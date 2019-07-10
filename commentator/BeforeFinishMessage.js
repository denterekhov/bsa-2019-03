class BeforeFinishMessage {
    constructor() {

    }

    createNewMessage(users) {
        const firstPlace = `До финиша осталось совсем немного и похоже, что первым его может пересечь ${users[0].user} из команды Atom на своем белом ${users[0].car}.`
        let secondPlace = '',
            thirdPlace = '';
        if (users[1]) {
            secondPlace = ` Второе место может достаться ${users[1].user}`
        }
        if (users[2]) {
            thirdPlace = ` или ${users[2].user}. Но давайте дождемся финиша.`
        }
           
        return firstPlace + secondPlace + thirdPlace;
    }
}


module.exports = BeforeFinishMessage;