package main

import (
	"./models"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gobuffalo/pop"
	_ "github.com/joho/godotenv/autoload"
	"github.com/pusher/pusher-http-go"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

func getEnv(key, fallback string) string {
	value := os.Getenv(key)

	if len(value) == 0 {
		return fallback
	}

	return value
}

func chat(r *gin.Engine, db *pop.Connection, pusher pusher.Client) {
	r.GET("/messages", func(c *gin.Context) {
		var messages []models.Chat

		err := db.Eager().Order("created_at DESC").Limit(50).All(&messages)

		if err != nil {
			_ = c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		c.JSON(http.StatusOK, messages)
	})

	r.POST("/messages", func(c *gin.Context) {
		user := models.User{}

		err := db.Find(&user, c.PostForm("user_id"))

		if err != nil {
			_ = c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		message := &models.Chat{
			User:    &user,
			Message: c.PostForm("message"),
		}

		chatErr := db.Create(message)

		if chatErr != nil {
			_ = c.AbortWithError(http.StatusInternalServerError, chatErr)
			return
		}

		pusherErr := pusher.Trigger("presence-chat", "message", message)

		if pusherErr != nil {
			_ = c.AbortWithError(http.StatusInternalServerError, pusherErr)
			return
		}

		c.JSON(http.StatusOK, message)
	})
}

func online(r *gin.Engine, db *pop.Connection, pusher pusher.Client)  {
	r.PUT("/online", func(c *gin.Context) {
		user := models.User{}

		err := db.Find(&user, c.PostForm("user_id"))

		if err != nil {
			_ = c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		type UpdateUser struct {
			IsOnline bool `form:"is_online"`
		}

		var data = UpdateUser{}

		_ = c.Bind(&data)

		user.IsOnline = data.IsOnline

		updateErr := db.Update(&user)

		if updateErr != nil {
			_ = c.AbortWithError(http.StatusInternalServerError, updateErr)
			return
		}

		pusherErr := pusher.Trigger("presence-user", "action", "online")

		if pusherErr != nil {
			_ = c.AbortWithError(http.StatusInternalServerError, pusherErr)
			return
		}

		c.JSON(http.StatusOK, user)
	})
}

func auth(r *gin.Engine, db *pop.Connection, pusher pusher.Client) {
	r.GET("/online", func(c *gin.Context) {
		var users []models.User

		err := db.Where("is_online = 1").All(&users)

		if err != nil {
			_ = c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		c.JSON(http.StatusOK, users)
	})

	online(r, db, pusher)

	r.POST("/login", func(c *gin.Context) {
		user := &models.User{
			Name:     c.PostForm("name"),
			Avatar:   c.PostForm("avatar"),
			Color:    c.PostForm("color"),
			IsOnline: false,
		}

		err := db.Create(user)

		if err != nil {
			_ = c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		c.JSON(http.StatusOK, user)
	})
}

func setupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"*"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	db, err := pop.Connect("development")

	if err != nil {
		log.Fatal(err)
	}

	pusherClient := pusher.Client{
		AppID:   "1148321",
		Key:     "5400a700b422ed7877cb",
		Secret:  "67ba1c92c4b7d9b3b0bc",
		Cluster: "ap1",
		Secure:  true,
	}

	chat(r, db, pusherClient)
	auth(r, db, pusherClient)

	fmt.Println(pusherClient.GetChannelUsers("presence-chat"))

	return r
}

func main() {
	gin.SetMode(getEnv("APP_ENV", "release"))

	var listen strings.Builder

	listen.WriteString(getEnv("APP_HOST", "0.0.0.0"))
	listen.WriteString(":")
	listen.WriteString(getEnv("APP_PORT", "80"))

	r := setupRouter()

	fmt.Printf("Listening and serving HTTP on %s\n", listen.String())

	err := r.Run(listen.String())

	if err != nil {
		log.Fatal(err)
	}
}
