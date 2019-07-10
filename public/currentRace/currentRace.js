document.addEventListener('DOMContentLoaded', () => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        location.replace('/login');
    } else {
        const socket = io.connect();

        const second = 1000,
        minute = second * 60;

        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            socket.emit('user disconnected', { token: jwt });
        });

        socket.emit('user logged',  { token: jwt });
        socket.emit('first race', { token: jwt });

        let randomText,
            randomTextLength,
            currentPosition = 0,
            userCurrentProgress;

        const getRandomText = async() => {
            const data = await fetch('/texts', {headers: {'Authorization': `Bearer ${jwt}`}});
            const { text } = await data.json();
            randomText = text;
            randomTextLength = randomText.length;
        };

        socket.on('start race', ({ timeToEnd: time, users }) => {
            const startTime = time;
            document.body.innerHTML = 
            `<div class="container">
                <div class="text">
                    <span id='text'>${randomText}</span>
                </div>
                <h4 id='timeToRaceEnd'></h4>
                <div id='commentator'>
                    <p id='commentator_text'></p>
                    <img src="./comment.jpg" alt="commentator" />
                </div>
            </div>`;

            const container = document.querySelector('.container');
            const timeToRaceEnd = document.getElementById('timeToRaceEnd');

            users.forEach((user, ind) => {
                const userProgress = 
                    `<div class="userProgress">
                        <p class='username'>${user.user}</p>
                        <progress class='currentProgressMeter' value="${user.userCurrentProgress}" max="100"></progress>
                        <p class='progress'>${user.userCurrentProgress}</p>
                    </div>`;
                container.insertAdjacentHTML('afterBegin', userProgress);
            });

            let timerId = setInterval(() => {
                time -= second;
                let mm = Math.floor(time / minute);
                let ss = Math.floor(time / 1000 % 60);
                let timeLeft = ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2);
                timeToRaceEnd.textContent = `${timeLeft} until the end`;

                if(time <= 0) {
                    currentPosition = 0;
                    clearInterval(timerId);
                    document.removeEventListener('keypress', typing);
                };
            }, second);

            const typing = (e) => {
                if (e.key === randomText.charAt(currentPosition)) {
                    currentPosition++;
                    text.innerHTML = 
                        `<span style="color: #0f0">${randomText.substring(0, currentPosition)}</span>` + 
                        `<span style="color: #f00">${randomText.charAt(currentPosition)}</span>` + 
                        randomText.substring(currentPosition + 1);
    
                    userCurrentProgress = currentPosition;
                    socket.emit('current progress', { userCurrentProgress, token: jwt });
                }

                if(randomTextLength - currentPosition === 30) {
                    socket.emit('30 chars to finish', { token: jwt });
                }

                if(randomTextLength === currentPosition) {
                    const timeSpent = Math.floor((startTime - time)/1000);
                    socket.emit('user finished', { token: jwt, timeSpent });
                }
            };
            document.addEventListener('keypress', typing);
        });

        socket.on('commentator message', (message) => {
            document.getElementById('commentator_text').textContent = message;
        });

        socket.on('update progress', ( users ) => {
            users.forEach(user => {
                user.percentage = (user.userCurrentProgress/randomTextLength * 100).toFixed(1);
            });

            [...document.querySelectorAll('.userProgress')].forEach((el, ind) => {
                el.querySelector('.username').textContent = users[ind].user;
                users[ind][userCurrentProgress] !== 'Offline' 
                    ? el.querySelector('.currentProgressMeter').value = users[ind].percentage
                    : el.querySelector('.currentProgressMeter').classList.add("redprogressbar");
                el.querySelector('.progress').textContent = users[ind].percentage;
            })
        });

        socket.on('stop race', ({ timeToEnd: time }) => {
            if (document.querySelector('.text')) {
                document.querySelector('.text').remove();
            }
            getRandomText();
            document.getElementById('timeToRaceEnd').remove();
            document.body.insertAdjacentHTML('beforeEnd', "<h3 id='timeToNextRace'></h3>");
            const timeToNextRace = document.getElementById('timeToNextRace');
            
            let timerId = setInterval(() => {
                time -= second;
                let mm = Math.floor(time / minute);
                let ss = Math.floor(time / 1000 % 60);
                let timeLeft = ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2);
                timeToNextRace.textContent = `The next race starts in: ${timeLeft}`;

                if(time <= 0) {
                    timeToNextRace.textContent = 'The next race starts in: 00:00';
                    clearInterval(timerId);
                };
            }, second);
        });

        socket.on('first race', ({ timeToEnd: time, isRaceRunning }) => {
            getRandomText();

            const timeToNextRace = document.getElementById('timeToNextRace');

            const timerId = setInterval(() => {
                time -= second;
                let mm = Math.floor(time / minute);
                let ss = Math.floor(time / 1000 % 60);
                let timeLeft = ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2);
                timeToNextRace.textContent = isRaceRunning 
                    ? `The current race is in progress. It will end in ${timeLeft}`
                    : `The next race starts in: ${timeLeft}`;

                if(time <= 0) {
                    timeToNextRace.textContent = isRaceRunning 
                        ? 'The current race is in progress. It will end in 00:00'
                        : 'The next race starts in: 00:00';
                    clearInterval(timerId);
                    if(isRaceRunning) {
                        socket.emit('first race', { token: jwt });
                    }
                };
            }, second);
        });
    }
});