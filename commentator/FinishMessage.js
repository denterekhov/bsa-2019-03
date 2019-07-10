class FinishMessage {
    constructor() {

    }

    createNewMessage(user) {
        return `Финишную прямую пересекает ${user}.`
    }
}

module.exports = FinishMessage;