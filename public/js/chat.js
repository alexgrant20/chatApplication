const socket = io()

// ----------------- COUNT-------------------------
// socket.on('updateCount', (count) =>{
//     console.log('This is the updated count ' + count)
// })

// document.getElementById('increment').addEventListener('click',() =>{
//     socket.emit('incrementCount')
// })


// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')
const $sidebar =  document.querySelector('#sidebar')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () =>{

    // New Mesage Element
    const $newMessage = $messages.lastElementChild
    
    // Height of new Messages
    const newMessageStyle = getComputedStyle($newMessage)
    const newMeesageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMeesageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of the container
    const containerHeight = $messages.scrollHeight

    // How far have i been scrolled
    const scrollOfSet = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOfSet){
        $messages.scrollTop = containerHeight
    }
}



socket.on('message', (message) =>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text, 
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(location) =>{
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

document.getElementById('message-form').addEventListener('submit', (e) =>{
    e.preventDefault()
    // Disabled
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = document.getElementById('inputMessage').value

    socket.emit('send-message', message,(error) =>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message Delivered')
    })
})

$locationButton.addEventListener('click', () =>{

    if(!navigator.geolocation){
        return alert('Your browser dont support geolocation')
    }
    //Disable
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((location) =>{
        $locationButton.removeAttribute('disabled')
        socket.emit('send-location', {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        }, () =>{
            console.log('Location Shared!')
        })

    })
})

socket.emit('join', {username,room}, (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({room,users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
   $sidebar.innerHTML = html
})