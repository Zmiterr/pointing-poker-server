const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const redis = require("redis");
const config = require('./config');
const uuid4 = require('uuid4');
//const client = redis.createClient(config.redisConf);

// client.on("error", function(error) {
//     console.error(error);
// });


//file upload
const path = require('path');
app.use('images', express.static(path.join(__dirname, 'images')))
app.use('/api', require('./routes/upload.route'))


app.use(express.json())

const rooms = new Map();

// app.get('/', (req, res) => {
//     console.log('Hello from get')
//     res.json(rooms);
// })

app.get('/rooms/:id', (req, res) => {
    const { id: roomId } = req.params;
    const obj = rooms.has(roomId)
        ? {
            users: [...rooms.get(roomId).get('users').values()],
            messages: [...rooms.get(roomId).get('messages').values()],
            settings: rooms.get(roomId).get('settings'),
            issues: rooms.get(roomId).get('issues'),
        }
        : { users: [], messages: [] };
    res.json(obj);
});

app.post('/rooms', (req, res) => {
    const { roomId, userName } = req.body;

    if (!rooms.has(roomId)) {
        newRoomId = uuid4();
        rooms.set(
            newRoomId,
            new Map([
                ['users', new Map()],
                ['messages', []],
                ['settings', {}],
                ['issues', []]
            ]),

        );

        res.send({roomId: newRoomId, userName});
    }

    res.send({roomId: roomId, userName});
});

app.post('/start', (req, res) => {
    const { gameState } = req.body;
   //set gameState to rooms
    // rooms.get(roomId).set & etc.
    res.send({gameState});
});

io.on('connection', (socket) => {
    socket.on('ROOM:JOIN', ({ roomId, userName, jobPosition, isObserver, image }) => {
        socket.join(roomId);
        rooms.get(roomId).get('users').set(socket.id, { userName, jobPosition, isObserver, image });
        const users = [...rooms.get(roomId).get('users').values()];
        socket.broadcast.to(roomId).emit('ROOM:SET_USERS', users);
    });

    socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text }) => {
        const obj = {
            userName,
            text,
        };
        rooms.get(roomId).get('messages').push(obj);
        socket.broadcast.to(roomId).emit('ROOM:NEW_MESSAGE', obj);
    })

    socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text }) => {
        const obj = {
            userName,
            text,
        };
        rooms.get(roomId).get('messages').push(obj);
        socket.broadcast.to(roomId).emit('ROOM:NEW_MESSAGE', obj);
    })

    socket.on('disconnect', () => {
        console.log(`user ${socket.id} disconnected` )
        rooms.forEach((value, roomId) => {
            if (value.get('users').delete(socket.id)) {
                const users = [...value.get('users').values()];
                socket.broadcast.to(roomId).emit('ROOM:SET_USERS', users);
            }
        });
    });

    console.log('user connected', socket.id);
});

server.listen(5000, (err) => {
    if(err) {throw new Error(err)}
    console.log('Server started on port 5000');
});

