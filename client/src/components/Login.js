import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'
import { useDispatch } from 'react-redux'
import { login } from '../store'
import { useHistory } from 'react-router-dom'
import { randomColor } from '../helpers'
import { login as apiLogin } from '../api'

const importAll = (r) => r.keys().map(r)

const Login = () => {
    const dispatch = useDispatch()
    const history = useHistory()
    const images = importAll(require.context('../../assets/avatars', false, /\.(png|jpe?g|svg)$/))

    const [avatar, setAvatar] = useState(null)
    const [username, setUsername] = useState('')
    const [error, setError] = useState(null)

    const slider = {
        className: 'mt-4',
        slidesPerView: 5,
        freeMode: true,
        loop: true,
        lazy: true,
    }

    useEffect(() => {
        setError(null)
    }, [avatar, username])

    const handleInputChange = (e) => {
        setUsername(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!username || !images[avatar]) {
            setError('Please enter your username and choose a avatar')
            return false
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters')
            return false
        }

        if (username.length > 10) {
            setError('Username may not be greater than 10 characters')
            return false
        }

        const color = randomColor()

        const user = await apiLogin({ name: username, avatar: images[avatar].default, color })

        if (!user) {
            setError('Can not login, please try again later')
            return false
        }

        await dispatch(login(user))

        return history.push('/')
    }

    return (
        <div className="flex h-screen w-full">
            <form onSubmit={handleSubmit} className="m-auto w-full md:w-96 bg-white rounded-lg shadow-md px-4 py-6 relative">
                {error &&
                <div className="text-center font-bold text-red-500 mb-4">
                    {error}
                </div>
                }

                <input onInput={handleInputChange} type="text" className="form-control rounded-lg" placeholder="Your user name" />

                <Swiper {...slider}>
                    {
                        images.map((img, index) => (
                            <SwiperSlide key={index} className="inline-block">
                                <img onClick={() => setAvatar(index)} className={classNames('rounded-full w-14 h-14 cursor-pointer my-2', { 'ring-4 ring-opacity-80 ring-yellow-500': index === avatar })} src={img.default} alt="" />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>

                <div className="text-center">
                    <button type="submit" className="mt-4 btn">
                        Go
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Login
