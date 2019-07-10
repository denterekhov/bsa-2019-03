const texts = require('./data/texts.js');
const Commentator = require('./commentator/Commentator.js');

class Race {
    constructor(io) {
        this.io = io;
        this.users = [];
        this.timer = null;
        this.every30SecondsTimer = null;
        this.timeToEnd = 120000;
        this.isRaceRunning = false;
        this.randomText = '';
        this.commentator = new Commentator(io);
        this.leader = null;
        this.cars = ['Toyota', 'BMW', 'Lotus', 'VW', 'Shelby Mustang', 'Ford', 'Chevrolet'];
    }

    startTimer() {
        this.randomText = texts[Math.floor(Math.random() * texts.length)];

        this.countDown = Date.now() + 120000;
        this.timer = setInterval(() => {
            let now = Date.now();
            this.timeToEnd = this.countDown - now;

            if(!(Math.floor(this.timeToEnd/1000)%30) && this.timeToEnd > 1000 && this.isRaceRunning) {
                this.commentator.sendMessage('every 30 seconds', this.users);
            }

            if(this.timeToEnd <= 0) {
                clearInterval(this.timer);
                this.startTimer();
                this.isRaceRunning = !(this.isRaceRunning);

                if (this.isRaceRunning) {
                    this.timeToEnd = 120000;
                    this.leader = null;
                    
                    this.users.forEach(user => {
                        user.userCurrentProgress = '0.0';
                    })

                    const timeToEnd = this.timeToEnd;
                    this.io.emit('start race', { timeToEnd: this.timeToEnd, users: this.users });
                    this.commentator.sendMessage('race start', this.users);
                } else {
                    if(this.users.length && this.users.some(user => user.userCurrentProgress === 'Offline')) {
                        const userToRemove = this.users.findIndex(user => user.userCurrentProgress === 'Offline');
                        this.users.splice(userToRemove, 1);
                    }

                    const timeToEnd = this.timeToEnd;
                    this.io.emit('stop race', { timeToEnd: 120000 });
                }
            };
            if (!this.io.engine.clientsCount) {
                clearInterval(this.timer);
            }
        }, 1000);
    };

    addUser(user) {
        const car = this.cars[Math.floor(Math.random() * this.cars.length)];
        this.users.push({
            user,
            car,
            userCurrentProgress: 0
        });
    };

    getFirstRaceData() {
        const timeToEnd = this.timeToEnd;
        const isRaceRunning = this.isRaceRunning;

        return {
            timeToEnd,
            isRaceRunning
        }
    }

    updateProgress({ login, currentProgress }) {
        const sortedUsers = this.users.map(user => {
            return user.user === login 
            ? {
                ...user,
                userCurrentProgress: currentProgress
            } 
            : user;        
        });
        
        this.users = sortedUsers;
        this.io.emit('update progress', this.users);
    }

    userDisconnected(userName) {
        this.users.forEach(user => {
            if(user.user === userName) {
                user.userCurrentProgress === 'Offline'
            }
        })
    }

    getRandomText() {
        return this.randomText;
    }

    createMessageBeforeFinish(login) {
        if (!this.leader) {
            this.leader = login;
            this.commentator.sendMessage('before finish', this.users);
        }
    }

    createFinishMessage(login) {
        this.commentator.sendMessage('user finished', login);
    }
}

module.exports = Race;