const RaceStartMessage = require('./RaceStartMessage.js');
const Every30SecondsMessage = require('./Every30SecondsMessage.js');
const BeforeFinishMessage = require('./BeforeFinishMessage.js');
const FinishMessage = require('./FinishMessage.js');

class Commentator {
    constructor(io) {
        this.io = io;
    }

    createMessage(raceStage, users) {
        switch (raceStage) {
            case 'race start':
                return (new RaceStartMessage).createNewMessage(users);

            case 'every 30 seconds':
                return (new Every30SecondsMessage).createNewMessage(users);

            case 'before finish':
                return (new BeforeFinishMessage).createNewMessage(users);

            case 'user finished':
                return (new FinishMessage).createNewMessage(users);

            case 'race end':
                return (new RaceEndMessage).createNewMessage();
        }
    }

    sendMessage(raceStage, users) {
        const message = this.createMessage(raceStage, users);
        this.io.emit('commentator message', message);
    }
}

module.exports = Commentator;