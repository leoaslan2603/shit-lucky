import axios from 'axios'
import { serialize } from './helpers'

export const chatHistories = async () => {
    return axios.get(`${process.env.REACT_APP_PUSHER_SERVER}/messages`).then(r => r.data)
}

export const sendChatMessage = async (userId, message) => {
    return axios
    .post(`${process.env.REACT_APP_PUSHER_SERVER}/messages`, serialize({ user_id: userId, message }))
    .then(r => r.data)
}

export const login = async (user) => {
    return axios.post(`${process.env.REACT_APP_PUSHER_SERVER}/login`, serialize(user)).then(r => r.data)
}

export const getUserOnline = async () => {
    return axios.get(`${process.env.REACT_APP_PUSHER_SERVER}/online`).then(r => r.data)
}

export const updateOnlineStatus = async (userId, status) => {
    return axios
    .put(`${process.env.REACT_APP_PUSHER_SERVER}/online`, serialize({ user_id: userId, is_online: status }))
    .then(r => r.data)
}
