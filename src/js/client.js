// import { disconnect } from "cluster";
var userName = localStorage.getItem('userName');
localStorage.removeItem('userName');
var state;
if(userName) {
    $(function () {

        // makes connection to the server
        var socket = io();
        socket.on('getClientName', (user) => {
            user.username = userName;
            user.username && socket.emit('registerClient',user);
        });
        
        // init of client after connecting to lobby
        socket.on('init', function (msg) {
            let clientState = msg.clients.find(x => x.id == socket.id);
            $('.inventory').empty();
            clientState && clientState.cards.forEach(card => {
                var html = `<div class="card col-3">${card}</div>`;
                $('.inventory').append(html);
            });

        });
        $('#sendChatMessage').on('click', () => {
            var text = $('#chatMessageBox').val();
            $('#chatMessageBox').val('');
            socket.emit('sendMessage',{
                username: state.client.username,
                text: text,
            });
        })

        socket.on('reciveMessage', (message) => {
            console.log('recived ' + message)
            var messageBox = `<div class='chat-message col-12'>${message.username}: ${message.text}</div>`;
            console.log(messageBox)
            $('#messageBox').append(messageBox);
            console.log( $('#messageBox'));
        })
        socket.on('alert',(message) => {
            console.log(message);
        });
        socket.on('updateGame',(data) => {
            console.log('update');
            console.log(data);
            state = data;
        })
        $(window).bind('beforeunload', () => {
            return socket.emit('onClientDisconect', socket.id);
        });
    })
} else {
    // similar behavior as an HTTP redirect
    window.location.replace('/');
}
