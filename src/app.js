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
    try {
        const {id: roomId} = req.params;
        const obj = rooms.has(roomId)
            ? {
                users: [...rooms.get(roomId).get('users').values()],
                messages: [...rooms.get(roomId).get('messages').values()],
                settings: rooms.get(roomId).get('settings'),
                issues: rooms.get(roomId).get('issues'),
            }
            : {users: [], messages: []};
        res.json(obj);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Something broke!');
    }
});

app.post('/rooms', (req, res) => {
    try{
    const { roomId, userName } = req.body;

    if (!rooms.has(roomId)) {
        newRoomId = uuid4();
        rooms.set(
            newRoomId,
            new Map([
                ['users', new Map()],
                ['messages', []],
                ['settings', {}],
                ['issues', []],
                ['gameState', {}],
                ['votes', {}]
            ]),

        );

        res.send({roomId: newRoomId, userName});
    }

    res.send({roomId: roomId, userName});
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Something broke!');
    }
});

app.post('/start', (req, res) => {
    try{
    const { gameState } = req.body;
   //set gameState to rooms
    // rooms.get(roomId).set & etc.
    res.send('ok');
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Something broke!');
    }
});

io.on('connection', (socket) => {
    //*************************************//
    //            Lobby                    //
    //*************************************//
    socket.on('ROOM:JOIN', ({ roomId, userName, jobPosition, isObserver, image }) => {
        try{
            socket.join(roomId);
            rooms.get(roomId).get('users').set(socket.id, { userName, jobPosition, isObserver, image });
            const users = [...rooms.get(roomId).get('users').values()];
            socket.broadcast.to(roomId).emit('ROOM:SET_USERS', users);
        }
        catch (err) {
            console.log(err);
        }
    });

    socket.on('GAME:START', ({ roomId }) => {
        try {
            rooms.get(roomId).get('gameState').set('appStatus', 'game');  //TODO тут надо будет засетать здоровенный объект
            rooms.get(roomId).get('issues').set() //TODO set current issue
            socket.broadcast.to(roomId).emit('GAME:START', '');
        } catch (err) {
            console.log(err);
        }
    })

    //*************************************//
    //            Chat                     //
    //*************************************//
    socket.on('ROOM:NEW_MESSAGE', ({ roomId, userName, text }) => {
        try {
            const obj = {
                userName,
                text,
            };
            rooms.get(roomId).get('messages').push(obj);
            socket.broadcast.to(roomId).emit('ROOM:NEW_MESSAGE', obj);
        } catch (err) {
            console.log(err);
        }
    })
    //*************************************//
    //            Game                     //
    //*************************************//
    socket.on('CARD:SELECTED', ({ roomId, userName, scorePoint }) => {
        try {
            rooms.get(roomId).get('issues').set();  //TODO set {userName, scorePoint} for current issue
        } catch (err) {
            console.log(err);
        }
    })

    function finishIssue(roomId, curIssue) {
        socket.broadcast.to(roomId).emit('ISSUE:FINISHED', curIssue);
    }

    socket.on('ISSUE:NEXT', ({ roomId }) => {
        try {
            rooms.get(roomId).get('issues').set();  //TODO find 'current' issue and set status 'finished'
            rooms.get(roomId).get('issues').set();  //TODO find one issue with status 'future'  and set status 'current'
            const curIssue = rooms.get(roomId).get('issues') //TODO get issue with status 'current'
            socket.broadcast.to(roomId).emit('ISSUE:NEXT', curIssue)
            // if(rooms.get(roomId).get('settings') ) { //TODO get time from settings
            //     socket.broadcast.to(roomId).emit('ISSUE:FINISHED', curIssue) //TODO send it after Date.now + gameState.timer
            // }
            const roundTime = rooms.get(roomId).get('settings') //TODO get time from settings
            rooms.get(roomId).get('gameState').set() //TODO set 'timer' = roundTime + Date.now
            setTimeout(finishIssue, roundTime, roomId, curIssue)
        } catch (err) {
            console.log(err);
        }
    })

    socket.on('ISSUE:RESTART', ({ roomId }) => {
        try {
            const curIssue = rooms.get(roomId).get('issues') //TODO get issue with status 'current'
            rooms.get(roomId).get('issues').set();  //TODO find  issue with status 'future'  and clear votes
            socket.broadcast.to(roomId).emit('ISSUE:NEXT', curIssue)
            // if(rooms.get(roomId).get('settings') ) { //TODO get time from settings
            //     socket.broadcast.to(roomId).emit('ISSUE:FINISHED', curIssue) //TODO send it after Date.now + gameState.timer
            // }
            const roundTime = rooms.get(roomId).get('settings') //TODO get time from settings
            rooms.get(roomId).get('gameState').set() //TODO set 'timer' = roundTime + Date.now
            setTimeout(finishIssue, roundTime, roomId, curIssue)
        } catch (err) {
            console.log(err);
        }
    })

    socket.on('GAME:STOP', ({ roomId }) => {
        try {
            rooms.get(roomId).get('settings').set(); //TODO set game status 'finished'
            socket.broadcast.to(roomId).emit('GAME:STOP', '')
        } catch (err) {
            console.log(err);
        }
    })
    //*************************************//
    //            Votes                    //
    //*************************************//
    socket.on('VOTES:START', ({ roomId, userName, kickUserName }) => {
        try {
            rooms.get(roomId).get('VOTES').set(); //TODO set kickUserName and 'approve +1'
            socket.broadcast.to(roomId).emit('VOTES:START', {userName, kickUserName})
        } catch (err) {
            console.log(err);
        }
    })
    socket.on('VOTES:APPROVE', ({ roomId, userName, kickUserName }) => {
        try {
            const usersCount = [...rooms.get(roomId).get('users')].length + 1;
            rooms.get(roomId).get('VOTES').set(); //TODO set kickUserName and 'approve +1'
            if (rooms.get(roomId).get('VOTES').get() > usersCount / 2) { //TODO get approve count
                socket.broadcast.to(roomId).emit('GAME:KICK', kickUserName)
            }
        } catch (err) {
            console.log(err);
        }
    })

    socket.on('VOTES:REJECT', ({ roomId, userName, kickUserName }) => {
        try {
            const usersCount = [...rooms.get(roomId).get('users')].length + 1;
            rooms.get(roomId).get('VOTES').set(); //TODO set kickUserName and 'reject +1'
            if (rooms.get(roomId).get('VOTES').get() > usersCount / 2) { //TODO get reject count
                rooms.get(roomId).get('VOTES').set({}) //TODO clear votes
            }
        } catch (err) {
            console.log(err);
        }
    })
    //*************************************//
    //            Disconnect               //
    //*************************************//
    socket.on('disconnect', () => {
        try {
            console.log(`user ${socket.id} disconnected`)
            rooms.forEach((value, roomId) => {
                if (value.get('users').delete(socket.id)) {
                    const users = [...value.get('users').values()];
                    socket.broadcast.to(roomId).emit('ROOM:SET_USERS', users);
                }
            });
        } catch (err) {
            console.log(err);
        }
    });

    console.log('user connected', socket.id);
});

server.listen(5000, (err) => {
    if(err) {throw new Error(err)}
    console.log('Server started on port 5000');
});

