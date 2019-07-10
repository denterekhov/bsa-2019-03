class RaceEndMessage {
    constructor() {

    }

    createNewMessage(users) {
        const firstPlace = `Итак, по результатам гонки первое место занимает ${users[0].user} с результатом в ${users[0].userCurrentProgress} знаков` + (users[0].timeSpent ? ` и временем ${users[0].timeSpent} сек.` : '.');

        let secondPlace = '',
            thirdPlace = '';

        if (users[1]) {
            secondPlace = ` Второе место занимает ${users[1].user} с результатом в ${users[1].userCurrentProgress} знаков` + (users[1].timeSpent ? ` и временем ${users[1].timeSpent} сек.` : '.');
        }

        if (users[2]) {
            thirdPlace = ` И, наконец, третье место достается ${users[2].user} с результатом в ${users[2].userCurrentProgress} знаков` + (users[2].timeSpent ? ` и временем ${users[2].timeSpent} сек.` : '.');
        }
 
        return firstPlace + secondPlace + thirdPlace + ' Что ж, сегодняшняя гонка была очень захватывающей, но, к сожалению, она закончилась. Будем надеяться, что следующая будет не менее интересной. До свидания, до новых встреч';
    }
}


module.exports = RaceEndMessage;