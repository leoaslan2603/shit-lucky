import * as React from 'react'
import Pusher from 'pusher-js'

if (process.env.NODE_ENV !== 'production') {
    Pusher.logToConsole = true
}

export const Socket = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
    cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
})

export const SocketContext = React.createContext()
