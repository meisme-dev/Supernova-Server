const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const auth = require('./auth/auth');
const session = require('express-session');

const io = new Server(server);

app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(session({
    secret: 'hello',
    resave: false,
    saveUninitialized: false
}));

io.on('connection', (socket) => {  
    let handshake = socket.handshake;
    console.log(handshake.query.message);
});

server.listen(3005, () => {
    console.log('listening on *:3005');
});

app.post('/app/login', function requestHandler(req, res) {
    const response = req.body;
    auth.login(response.email, response.password).then(result => {
        res.send(result);
    });;
});  

app.post('/app/register', function requestHandler(req, res) {
    const response = req.body;
    auth.register(response.email, response.password).then(result => {
        res.send(result);
    });;
});  