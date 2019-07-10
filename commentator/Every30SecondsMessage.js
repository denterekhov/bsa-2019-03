class RaceStartMessage {
    constructor() {

    }

    createNewMessage(users) {
        return users.reduce((prev, current, ind) => prev + `На ${ind + 1} месте сейчас идет ${current.user} на ${current.car}. `, '');
    }
}

module.exports = RaceStartMessage;