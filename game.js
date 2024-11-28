const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Устанавливаем размеры канваса
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.8;

// Параметры поезда
const train = {
    x: canvas.width / 5,
    y: canvas.height / 2,
    width: 60,
    height: 40,
    speed: 8,
    direction: 0, // 0 - стоит, 1 - вверх, -1 - вниз
    image: new Image(), // Иконка поезда
};

// Параметры препятствий
const obstacles = [];
const obstacleWidth = 60;
const obstacleHeight = 40;
let obstacleSpeed = 4;
let obstacleInterval = 1000; // Интервал между созданием препятствий

// Игровые параметры
let gameOver = false;
let score = 0;

// Получаем элементы для отображения счета и игры
const gameOverElement = document.getElementById('gameOver');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restartButton');

// Загрузим изображения для поезда и препятствий
train.image.src = 'train.svg'; // Путь к SVG-иконке поезда

// Обработчик для клавиатуры (для тестирования на компьютере)
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        train.direction = 1; // Двигаем поезд вверх
    } else if (event.key === 'ArrowDown') {
        train.direction = -1; // Двигаем поезд вниз
    }
});

// Обработчик для мобильных устройств (свайпы)
let touchStartY = 0;

canvas.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0].clientY;
});

canvas.addEventListener('touchend', (event) => {
    const touchEndY = event.changedTouches[0].clientY;

    if (touchStartY > touchEndY + 10) {
        train.direction = 1; // Свайп вверх
    } else if (touchStartY < touchEndY - 10) {
        train.direction = -1; // Свайп вниз
    }
});

// Обработчик нажатия на кнопку для перезапуска игры
restartButton.addEventListener('click', resetGame);

// Функция для создания нового препятствия
function createObstacle() {
    const xPosition = canvas.width;
    const yPosition = Math.random() * (canvas.height - obstacleHeight);
    // Устанавливаем случайный цвет для каждого препятствия
    const obstacleColor = '#395f85'; // Красный цвет (можно выбрать любой другой)
    obstacles.push({ x: xPosition, y: yPosition, color: obstacleColor });
}

// Функция для обновления состояния игры
function update() {
    if (gameOver) return;

    // Проверка на выход за границы игровой зоны
    if (train.y < 0 || train.y + train.height > canvas.height) {
        gameOver = true;
        gameOverElement.style.display = 'block';
        return;
    }

    // Двигаем препятствия
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= obstacleSpeed;

        // Удаляем препятствия, которые выходят за пределы экрана
        if (obstacles[i].x + obstacleWidth < 0) {
            obstacles.splice(i, 1);
            i--;
            score++;
            scoreElement.textContent = `Счет: ${score}`;

            // Усложнение игры после достижения 20 и 40 очков
            if (score === 20) {
                obstacleInterval = 800; // Уменьшаем интервал между препятствиями
                setInterval(createObstacle, obstacleInterval);
            }

            if (score === 40) {
                train.speed = 8; // Увеличиваем скорость поезда
                obstacleSpeed = 6; // Увеличиваем скорость препятствий
            }
        }
    }

    // Проверка на столкновение
    for (let obstacle of obstacles) {
        if (
            train.x + train.width > obstacle.x &&
            train.x < obstacle.x + obstacleWidth &&
            train.y + train.height > obstacle.y &&
            train.y < obstacle.y + obstacleHeight
        ) {
            gameOver = true;
            gameOverElement.style.display = 'block';
        }
    }

    // Обновляем положение поезда в зависимости от направления
    if (train.direction === 1 && train.y > 0) {
        train.y -= train.speed; // Двигаем поезд вверх
    }
    if (train.direction === -1 && train.y < canvas.height - train.height) {
        train.y += train.speed; // Двигаем поезд вниз
    }

    draw();
}

// Функция для рисования объектов на канвасе
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем поезд
    ctx.drawImage(train.image, train.x, train.y, train.width, train.height);

    // Рисуем препятствия
    for (let obstacle of obstacles) {
        ctx.fillStyle = obstacle.color; // Устанавливаем цвет для каждого препятствия
        ctx.fillRect(obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
    }
}

// Функция для сброса игры
function resetGame() {
    gameOver = false;
    score = 0;
    train.y = canvas.height / 2;
    train.direction = 0;
    obstacles.length = 0; // очищаем список препятствий
    obstacleSpeed = 4;
    obstacleInterval = 1000;
    gameOverElement.style.display = 'none';
    scoreElement.textContent = `Счет: ${score}`;
}

// Основной игровой цикл
function gameLoop() {
    if (!gameOver) {
        update();
    }
    requestAnimationFrame(gameLoop);
}

// Создаем первое препятствие и начинаем игру
createObstacle();
setInterval(createObstacle, obstacleInterval); // создаем новое препятствие каждые 1 секунду
gameLoop(); // начинаем игровой цикл
