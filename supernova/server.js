require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const auth = require('./auth/auth');
const io = new Server(server);

app.use(express.urlencoded({extended: true}));
app.use(express.json());

io.on('connection', (socket) => {  
    let handshake = socket.handshake;
    console.log(handshake.query.message);
});

server.listen(3005, () => {
    console.log('listening on *:3005');
});

app.get('/', (req, res) => {
    res.send('<h1> Twinkle Server! </h1>');
});

app.post('/api/login', function requestHandler(req, res) {
    const response = req.body;
    if(typeof response.email === 'undefined' || typeof response.password === 'undefined'){
        console.log('Invalid request');
        res.send(false);
        return;
    };
    auth.login(response.email, response.password).then(result => {
        res.send(result);
    });
});  

app.post('/api/register', function requestHandler(req, res) {
    const response = req.body;
    if(typeof response.name === 'undefined' || typeof response.email === 'undefined' || typeof response.password === 'undefined'){
        res.send(false);
        return;
    };
    auth.register(response.name, response.email, response.password).then(result => {
        res.send(result);
    });
});

app.post('/api/verify', function requestHandler(req, res) {
    const response = req.body;
    if(typeof response.session === 'undefined'){
        res.send(false);
        return;
    };
    auth.checkSession(response.session).then(result => {
        res.send(result);
    });
});

