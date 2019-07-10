const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bodyParser = require('body-parser');
const users = require('./data/users.json');
const Race = require('./Race');

require('./passport.config');

server.listen(3001);

app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/auth/auth.html'));
});

app.get('/currentRace', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/currentRace/currentRace.html'));
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/login/login.html'));
});

app.post('/login', function (req, res) {
  const userFromReq = req.body;
  const userInDB = users.find(user => user.login === userFromReq.login);

  if (userInDB && userInDB.password === userFromReq.password) {
    const token = jwt.sign(userFromReq, 'supermegasecretkey', { expiresIn: '365d' });
    res.status(200).json({ auth: true, token });
  } else {
    res.status(401).json({ auth: false });
  }
});

app.get('/texts', passport.authenticate('jwt', { session: false }), function (req, res) {
  res.status(200).json({ text: race.getRandomText() });
});

const race = new Race(io);
io.on('connection', socket => {

    socket.on('user logged', ({ token }) => {
        if (socket.conn.server.clientsCount === 1) {
            race.startTimer();
        };
        const user = jwt.decode(token).login;
        race.addUser(user);
    });
  
    socket.on('first race', ({ token }) => {
        const user = jwt.decode(token).login;
        socket.emit('first race', race.getFirstRaceData());
    });
  
    socket.on('current progress', ({ userCurrentProgress: currentProgress, token }) => {
        const { login } = jwt.verify(token, 'supermegasecretkey');
        if (login) {
            race.updateProgress({ login, currentProgress });
        }
    });
  
    socket.on('30 chars to finish', ({ token }) => {
        const { login } = jwt.verify(token, 'supermegasecretkey');
        if (login) {
            race.createMessageBeforeFinish( login );
        }
    });

    socket.on('user finished', ({ token, timeSpent }) => {
        const { login } = jwt.verify(token, 'supermegasecretkey');
        if (login) {
            race.createFinishMessage({ login, timeSpent });
        }
    });

    socket.on('user disconnected', ({ token }) => {
        const userName = jwt.decode(token).login;
        race.userDisconnected(userName);
    });
});
