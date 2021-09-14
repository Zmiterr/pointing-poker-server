const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const messageData = new Map();

app.get('/', (req, res) => {
    messageData.set('message', 'hello' );
    console.log('Hello from get')
    res.json(messageData);
})

app.post('/', (req, res) => {
    messageData.set('message', 'hello' );
    console.log('Hello from post')
    res.json(messageData);
})

io.on('connection', socket => {
    console.log('user connected', socket.id);

    socket.on('greet', function(data) {
        console.log(data);
        socket.emit('respond', { hello: 'Hey, Mr.Client!' });
    });
    socket.on('disconnect', function() {
        console.log('Socket disconnected', socket.id);
    });
})



server.listen(5000, (err) => {
    if(err) {throw new Error(err)}
    console.log('Server started on port 5000');

});

