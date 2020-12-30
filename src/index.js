const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/message')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const port = process.env.PORT
const server = http.createServer(app)
const io = socketio(server)

const pathToPublic = path.join(__dirname, '../public')
app.use(express.static(pathToPublic))

// let count = 0

/* Count App

io.on('connection', (socket) =>{
    console.log('This is the connection')
    // Memberi data dari server - client
    socket.emit('updateCount',count)
    
    // Listen data from client - server
    socket.on('incrementCount', () => {
        count++
        // Socket => specific client
        socket.emit('updateCount', count)
        // Io => all client can see
        io.emit('updateCount', count)
    })
})
*/



io.on('connection', (socket) =>{
    const owner = 'Admin'
    socket.on('join', ({username,room},callback) =>{
        const {error,user} = addUser({ id:socket.id,username,room})
        
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage(owner,`Welcome! ${user.username}`))
        socket.broadcast.to(user.room).emit('message',generateMessage(owner,`${user.username} has join the chat!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })
    socket.on('send-message', (message,callback) =>{
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Message cant contain bad words')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('disconnect', () =>{
        const user = removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message', generateMessage(owner,`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('send-location',(location,callback) =>{
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
})

server.listen(port, () =>{
console.log(`App is live on port ${port}`)
})