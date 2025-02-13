const { Server } = require("socket.io")
const http = require('http')
const express = require('express')
const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: ['https://vdocall-1rhg.vercel.app/']
})

const emailToSocketIdMap = new Map()
const socketIdToEmailMap = new Map()

io.on('connection', socket => {
    console.log(`Socket connected : ${socket.id}`)

    socket.on('room:join', data => {
        const { email, room } = data
        emailToSocketIdMap.set(email, socket.id)
        socketIdToEmailMap.set(socket.id, email)
        socket.join(room);
        io.to(room).emit('user:joined', { email, id: socket.id })
        io.to(socket.id).emit('room:join', data)

    })


    socket.on('user:call', ({ to, offer }) => {
        io.to(to).emit('incoming:call', { from: socket.id, offer })
    })


    socket.on('call:accepted', ({ to, ans }) => {
        io.to(to).emit('call:accepted', { from: socket.id, ans })
    })
})

app.get('/', (req, res) => {
    res.send('hello wor  motoe')
})

server.listen(8000, () => {
    console.log('server us running in port 8000')
})