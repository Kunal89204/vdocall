import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import { useNavigate } from 'react-router-dom'


const Lobby = () => {
    const [email, setEmail] = useState("")
    const [room, setRoom] = useState("")
    const navigate = useNavigate()
    const socket = useSocket()


    const handleSubmit = useCallback((e) => {
        e.preventDefault()
        socket.emit('room:join', { email, room })
    }, [email, room, socket])

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        navigate(`/room/${room}`)
    }, [])

    useEffect(() => {
        socket.on('room:join', handleJoinRoom);
        return () => {
            socket.off('room:join', handleJoinRoom)
        }
    }, [socket, handleJoinRoom])
    return (
        <div>
            Lobby

            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email Id</label>
                <input type="email" id='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                <br />
                <label htmlFor="room">Room Number</label>
                <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} id='room' />
                <button>Join</button>
            </form>
        </div>
    )
}

export default Lobby
