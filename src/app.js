const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,  {
    cors:{
        origin: '*',
    },
});
const redis = require("redis");
const config = require('./config');
const uuid4 = require('uuid4');
const cors = require('cors');
//const client = redis.createClient(config.redisConf);

// client.on("error", function(error) {
//     console.error(error);
// });
const getGame = (room) => {
    if (!room) return { gameError: new Error("Enter room ID") };
    const currentGame = games.find((game) => game.room === room);
    if (currentGame === undefined)
        return { gameError: new Error("Game not found") };
    return { currentGame };
};

//file upload
const path = require('path');
app.use('images', express.static(path.join(__dirname, 'images')))
app.use('/api', require('./routes/upload.route'))
app.use(cors({
    origin: '*'
}));


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
        //newRoomId = uuid4();
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
   //TODO set gameState to rooms
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
            console.log('Hello world')
        }
        catch (err) {
            console.log(err);
        }
    });

    socket.on('GAME:START', ({ roomId }) => {
        export const addGame = () => {
            const room = uuidv4();
            const users = [];
            const issues = [];
            const settings = {
                isFreeConnectionToGameForNewUsers:false,
            };
            const title = "";
            const dealer = {};
            const gameStatus = "lobby";
            const voting = {
                isVote: false,
                candidat: "",
                results: [],
            };
        try {
            const { room, game } = addGame();
            const dealer = {
                id,
                firstName,
                lastName,
                jobPosition,
                avatar,
                role,
                room,
            };
            socket.broadcast.to(roomId).emit('GAME:START', '');
        } catch (err) {
            console.log(err);
        }
    });

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
        const getPokerGame = (room) => {
            const currentPokerGame = pokers.find((poker) => poker.roomID === room);
            if (!currentPokerGame) return new Error("Poker game not found");
            return { currentPokerGame };
        };
        const getIssues = (room) => {
            const { currentGame, gameError } = getGame(room);
            if (gameError) return gameError;
            const issues = currentGame.issues.filter((issue) => issue.room === room);
            return { issues };

        const checkCurrentIssue = (room) => {
            const {currentPokerGame} = getPokerGame(room);
            const {issues} = getIssues(room);
            if(currentPokerGame) {
                const selectedID = currentPokerGame.round.issueID;
                const index = issues.findIndex(issue => issue.id === selectedID);
                if(index < 0 && issues.length) {
                    currentPokerGame.round.issueID = issues[0].id
                    const firstIssueID = issues[0].id;
                    addRound(room,firstIssueID)
                    return firstIssueID;
                } else {
                    addRound(room,selectedID)
                    return selectedID;
                }
            }
        }

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
            const { currentGame, gameError } = getGame(roomId);
            if (gameError) return gameError;
            const index = currentGame.issues.findIndex((issue) => issue.id === data.id);
            if (index < 0) return { issueError: new Error(`Issue not found`) };
            const existIssue = currentGame.issues[index];
            currentGame.issues[index] = { ...existIssue, ...data };
            const updIssue = currentGame.issues[index];
            return { updIssue };
            setTimeout(finishIssue, roundTime, roomId, curIssue)
        } catch (err) {
            console.log(err);
        }
    })

    socket.on('ISSUE:RESTART', ({ roomId }) => {
        try {
            const { gameError, issueError } = updateIssue(data.roomId, data);
            if (gameError) return gameError;
            if (issueError) return issueError;
            const { issues } = getIssues(data.room);
            const selectID  = checkCurrentIssue(data.room);
            console.log(`Update ${data.id} issue in room ${data.room}`)
            io.in(data.room).emit('RES_ISSUES_GET', issues);
            io.in(data.room).emit(='RES_SELECT_ISSUE',selectID)
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
            const { currentGame, gameError } = getGame(room);
            if (gameError) return;
            if (!currentGame.voting.isVote && currentGame.users.length > 2) {
                currentGame.voting.isVote = true;
                currentGame.voting.candidat = deleteUserID;
                currentGame.voting.results.push(true);
            socket.broadcast.to(roomId).emit('VOTES:START', {userName, kickUserName})}
        } catch (err) {
            console.log(err);
        }
    })
    socket.on('VOTES:APPROVE', ({ roomId, userName, kickUserName }) => {
        try {
            const usersCount = [...rooms.get(roomId).get('users')].length + 1;
            if (
                currentGame.voting.results.length === currentGame.users.length - 1 &&
                confirmDeleting.length > (currentGame.users.length - 1) / 2
            ) {
                const { deletedUser } = deleteUser(room, currentGame.voting.candidat);
                const deletedUserID = deletedUser.id;

                console.log(
                    `${deletedUserID} user deleted by voting from  the room: ${room}`
                );
                io.in(room).emit('RES_RESULT_VOTE', { deletedUserID, isDeleted });
                io.in(room).emit(
                    EVENTS.NOTIFICATIONS,
                    `${deletedUser.firstName} was deleted by voting`
                );
                currentGame.voting.isVote = false;
                currentGame.voting.results = [];
            }
                socket.broadcast.to(roomId).emit('GAME:KICK', kickUserName)

        } catch (err) {
            console.log(err);
        }
    })

    socket.on('VOTES:REJECT', ({ roomId, userName, kickUserName }) => {
        try {
            const usersCount = [...rooms.get(roomId).get('users')].length + 1;
            if (
                currentGame.voting.results.length === currentGame.users.length - 1 &&
                confirmDeleting.length > (currentGame.users.length - 1) / 2
            ) {
                const { deletedUser } = deleteUser(room, currentGame.voting.candidat);
                const deletedUserID = deletedUser.id;

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

