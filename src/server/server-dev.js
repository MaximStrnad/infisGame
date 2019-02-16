import path from 'path'
import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config from '../../webpack.dev.config.js'

const app = express(),
						DIST_DIR = __dirname,
						HTML_FILE = path.join(DIST_DIR, 'index.html'),
						compiler = webpack(config)
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(webpackDevMiddleware(compiler, {
	publicPath: config.output.publicPath
}))

app.use(webpackHotMiddleware(compiler))

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html')
})
app.get('/game', function(req, res){
	res.sendFile(__dirname + '/game.html')
})
var client = {
	id: null,
	items: ['yo','bro','test'],
	username: '',
	role: '',
}
var state = {
	clients: [],
	turn: 0,
	clientOnTurn: null,
	numberOfPlayers: 0,
	maxNumberOfPlayers: 4,
}
var action = {
    actionType: '',
    actionPerformer: '',
    actionData: '',
}
var updateGame = (socket) => {
    state.clients.map( client => {
        io.to(`${client.id}`).emit('updateGame',{
            clients: state.clients.map(c => c.username),
            clientOnTurn: state.clientOnTurn,
            client: client,
            turn: state.turn,
        })
    })
}
var validateClient = (client) => {
    console.log(`${client.id} ${client.items} ${client.username}`)
	return client.id != undefined && client.items != undefined && client.username != undefined
}

var alertClient = (socket, message) => {
	console.log('alerting')
	socket && message && socket.emit('alert',message)
}
var broadcastAlert = (socket, message) => {
	console.log('alerting')
    socket && message && socket.broadcast.emit('alert',message)
}
io.on('connection', function(socket){
	var newClient = client
	newClient.id = socket.id
	socket.emit('getClientName',newClient)
	socket.on('registerClient',(client) => {
        console.log(client.username)
		newClient.username = client.username
		if(validateClient(newClient) && state.numberOfPlayers < state.maxNumberOfPlayers) {
                state.clients.push(newClient)
                state.numberOfPlayers++
				alertClient(socket,'U have joined the game')
                broadcastAlert(socket,`${newClient.username} has joined`)
                updateGame(socket)
		} else {
			alertClient(socket,'An error has occured')
		}
		})
	
	// when server recives call for clickedCard
	socket.on('click', function(msg){
		console.log('message: ' + msg)
		broadcastAlert(socket,msg) 
	})

    socket.on('sendMessage', (message) => {
        console.log(message);
        io.emit('reciveMessage',message);
    });

	// when clients disconnects
	socket.on('onClientDisconect', (clientId) => {
		var disconnectedUser = state.clients.find(c => c.id == clientId)
		disconnectedUser && console.log(disconnectedUser.username)
        state.clients.splice(state.clients.indexOf(state.clients.find(c => c.id == clientId)),1)
        state.numberOfPlayers--
		updateGame(socket)
		disconnectedUser && broadcastAlert(socket,`${disconnectedUser.username} has left the game.`)
	})

})

const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
		console.log(`App listening to ${PORT}....`)
		console.log('Press Ctrl+C to quit.')
})