const users = []

// addUser, removeUser

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const addUser = ({id, username, room}) =>{

    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if(!username || !room){
        return{
            error:'Room & Username must be provided'
        }
    }

    // Check for exicsting user
    const existingUser = users.find((user) =>{
        return user.room === room && user.username === username
    })

    // Validate user
    if(existingUser){
        return {
            error: 'Username already taken'
        }
    }

    // Store User
    const user = {id,username,room}
    users.push(user)
    return { user }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}