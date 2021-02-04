import classNames from 'classnames'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { getUser } from '../store'
import { SocketContext } from '../socket'
import { chatHistories as fetchChats, sendChatMessage } from '../api'

const Chat = () => {
    const ref = useRef(null)
    const user = useSelector(getUser)
    const socket = useContext(SocketContext)

    const [message, setMessage] = useState('')
    const [chatHistories, setChatHistories] = useState([])

    useEffect(() => {
        fetchChats().then(data => {
            if (Array.isArray(data)) {
                setChatHistories(data.sort((a, b) => a.created_at > b.created_at ? 1 : -1))
            }
        })
    }, [])

    const handleInputChange = function (e) {
        setMessage(e.target.value)
    }

    const send = async (e) => {
        e.preventDefault()

        if (!message.trim()) {
            return false
        }

        await sendChatMessage(user.id, message)

        setMessage('')
        setChatHistories([...chatHistories, { message, user }])
    }

    const handleChat = useCallback((chat) => {
        if (chat.user.id !== user.id) {
            setChatHistories([...chatHistories, chat])
        }
    }, [chatHistories, user])

    const channel = socket.subscribe('presence-chat')

    useEffect(() => {
        if (ref) {
            ref.current.scrollTop = ref.current.scrollHeight
        }

        channel.bind('message', handleChat)

        return () => {
            channel.unbind('message', handleChat)
        }
    }, [socket, handleChat, channel])

    return (
        <div className="flex flex-col justify-between w-full md:w-1/3 bg-white rounded-lg shadow-md px-4 py-2">
            <div ref={ref} className="h-full flex flex-col space-y-4 p-3 overflow-y-auto">
                {chatHistories.length === 0 && (
                    <div className="text-gray-400 m-auto">
                        No message found!
                    </div>
                )}

                {
                    chatHistories.map((history, index) => (
                        <div key={index} className={classNames('flex items-end', { 'justify-end': history.user.id === user.id })}>
                            <span className={classNames('flex flex-col space-y-1 text-sm max-w-xs mx-2 px-4 py-2 rounded-lg inline-block', history.user.id === user.id ? 'rounded-br-none order-1 bg-yellow-500 text-white' : 'rounded-bl-none order-2 bg-gray-300 text-gray-600')}>
                                {history.user.id === user.id || (
                                    <span className={'text-xs font-bold ' + history.user.color}>
                                        {history.user.name}
                                    </span>
                                )}

                                <span>{history.message}</span> </span>

                            <img src={history.user.avatar} alt={history.user.name} className={classNames('w-6 h-6 rounded-full', history.user.id === user.id ? 'order-2' : 'order-1')} />
                        </div>
                    ))
                }
            </div>

            <form className="bg-white pb-2 pt-4 border-t" onSubmit={send}>
                <input value={message} type="text" className="form-control" placeholder="Enter message" onInput={handleInputChange} />
            </form>
        </div>
    )
}

export default Chat
