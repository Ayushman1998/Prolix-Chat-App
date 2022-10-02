const express = require('express');
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const cors = require('cors');

const privateConstants = require('./privateConstants');

// routes imports
const UserController = require('./Controller/UserController');
const ChatController = require('./Controller/ChatController');
const MessageController = require('./Controller/MessageController');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// connect to database
mongoose.connect(privateConstants.MONGODBURI)
    .then(res => {
        console.log('Connected to database successfully');
    }).catch(err => {
        console.log(err);
    });

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session based authentication
const store = new mongoDBSession({
    uri: privateConstants.MONGODBURI,
    collection: 'chat_sessions'
});

app.use(session({
    secret: privateConstants.SESSIONKEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 30, sameSite: 'lax' },
    store: store
}));

app.get('/', (req, res) => {
    res.send("Welcome to home page");
});

// router
app.use('/auth', UserController);
app.use('/chat', ChatController);
app.use('/message', MessageController);

app.get('/*', (req, res) => {
    res.send({
        status: 404,
        message: "Page not found"
    });
});

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Listening on PORT 5000');
});

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: ['http://localhost:3000']
    }
});

io.on('connection', (socket) => {

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on('join chat', (room) => {
        socket.join(room);
    });

    socket.on('typing', (room) => {
        (socket.in(room).emit('typing', room));
    });

    socket.on('stop typing', (room) => {
        (socket.in(room).emit('stop typing', room));
    });

    socket.on('new message', (newMessageRecieved) => {
        let chat = newMessageRecieved.chat;
        if (!chat.participants) {
            console.log('chat.participants not defined');
        }

        chat.participants.forEach(paricipant => {
            if (paricipant._id === newMessageRecieved.sender._id) {
                return;
            }

            socket.in(paricipant._id).emit('message recieved', newMessageRecieved);
        });
    });

    socket.off('setup', () => {
        console.log('User Disconnected');
        socket.leave(userData._id);
    });
});