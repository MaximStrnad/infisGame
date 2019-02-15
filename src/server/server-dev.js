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
var client = {
  id: null,
  cards: ['yo','bro','test'],
  username: '',
  role: '',
}
var state = {
  clients: [],
  turn: 0,
  clientOnTurn: null,
}
// var updateGame = (socket) => {
//   socket.emit('updateGame',state);
// }
io.on('connection', function(socket){
  var newClient = client;
  newClient.id = socket.id;
  state.clients.push(newClient)
  socket.emit('init',state);
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('clickedCard', function(msg){
    console.log('message: ' + msg);
  });
});

const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
    console.log(`App listening to ${PORT}....`)
    console.log('Press Ctrl+C to quit.')
})