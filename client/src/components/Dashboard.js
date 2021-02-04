import Chat from './Chat'
import Picker from './Picker'
import Players from './Players'
import { useCallback, useContext, useEffect } from 'react'
import { SocketContext } from '../socket'
import { getUserOnline, updateOnlineStatus } from '../api'
import { useDispatch, useSelector } from 'react-redux'
import { addPlayer, getUser } from '../store'

const Dashboard = () => {
    const socket = useContext(SocketContext)
    const channel = socket.subscribe('presence-user')
    const dispatch = useDispatch()
    const user = useSelector(getUser)

    const handleSubscribed = useCallback(() => {
        updateOnlineStatus(user.id, true).then(r => {
            console.log(r)
        })
    }, [socket, user.id])

    const handleUserUpdate = useCallback((action) => {
        if (action === 'online') {
            getUserOnline().then((users) => {
                users.forEach(u => {
                    dispatch(addPlayer(u))
                })
            })
        }
    }, [dispatch])

    useEffect(() => {
        channel.bind('pusher:subscription_succeeded', handleSubscribed)
        channel.bind('action', handleUserUpdate)

        return () => {
            channel.unbind('pusher:subscription_succeeded', handleSubscribed)
            channel.unbind('action', handleUserUpdate)
        }
    }, [socket, channel, handleUserUpdate, handleSubscribed])

    return (
        <div className="h-screen py-4 flex space-x-0 space-y-2 md:space-x-2 md:space-y-0 flex-col md:flex-row w-full max-w-screen-xl mx-auto">
            <Chat />

            <div className="flex flex-col justify-between w-full md:w-2/3 bg-white rounded-lg shadow-md px-4 py-2">
                <Picker />
                <Players />
            </div>
        </div>
    )
}

export default Dashboard
