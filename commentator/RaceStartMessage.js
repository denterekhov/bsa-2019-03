class RaceStartMessage {
    constructor() {

    }

    createNewMessage(users) {
        return users.reduce((prev, current, ind) => `${prev} Под номером ${ind + 1} выступает ${current.user} на своем ${current.car}.`, 'На улице сейчас немного пасмурно, но на Львов Арена сейчас просто замечательная атмосфера: двигатели рычат, зрители улыбаются, а гонщики едва заметно нервничают и готовят своих железных коней к гонке. А комментировать всё это действо для вас буду я, Эскейп Энтерович и я рад вас приветствовать словами "Доброго дня, господа!". А тем временем, список гонщиков. Итак...');
    }
}

module.exports = RaceStartMessage;