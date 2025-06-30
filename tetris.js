const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

context.scale(20, 20);
nextContext.scale(20, 20);

let highScore = localStorage.getItem('highscore') || 0;

function arenaSweep() {
    const clearedRows = [];
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        clearedRows.push(y);
    }

    if (clearedRows.length > 0) {
        let scoreMultiplier = 1;
        for (let i = 0; i < clearedRows.length; i++) {
            player.score += 10 * scoreMultiplier;
            scoreMultiplier *= 2;
        }

        for (const y of clearedRows) {
            arena[y].fill(8); // Flash color
        }

        setTimeout(() => {
            for (const y of clearedRows) {
                arena.splice(y, 1);
            }
            for (let i = 0; i < clearedRows.length; i++) {
                arena.unshift(new Array(arena[0].length).fill(0));
            }
        }, 200);
    }
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset, targetContext, ghost = false) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                if (ghost) {
                    targetContext.fillStyle = 'rgba(255, 255, 255, 0.2)';
                } else {
                    targetContext.fillStyle = colors[value];
                }
                targetContext.fillRect(x + offset.x,
                    y + offset.y,
                    1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    drawMatrix(arena, {
        x: 0,
        y: 0
    }, context);
    const ghostPos = { ...player.pos
    };
    while (!collide(arena, {
            matrix: player.matrix,
            pos: ghostPos
        })) {
        ghostPos.y++;
    }
    ghostPos.y--;
    drawMatrix(player.matrix, ghostPos, context, true);
    drawMatrix(player.matrix, player.pos, context);
    drawMatrix(player.nextMatrix, {
        x: 1,
        y: 1
    }, nextContext);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerHardDrop() {
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    if (!player.nextMatrix) {
        player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    } else {
        player.matrix = player.nextMatrix;
    }
    player.nextMatrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        if (player.score > highScore) {
            highScore = player.score;
            localStorage.setItem('highscore', highScore);
        }
        showGameOverScreen();
        return;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
let gameActive = false;

const titleScreen = document.getElementById('title-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-button');
const retryButton = document.getElementById('retry-button');
const finalScoreSpan = document.getElementById('final-score');

function showTitleScreen() {
    titleScreen.style.display = 'block';
    gameOverScreen.style.display = 'none';
    gameContainer.style.display = 'none';
    gameActive = false;
}

function showGameOverScreen() {
    titleScreen.style.display = 'none';
    gameOverScreen.style.display = 'block';
    gameContainer.style.display = 'none';
    finalScoreSpan.innerText = player.score;
    gameActive = false;
}

function startGame() {
    titleScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    arena.forEach(row => row.fill(0));
    player.score = 0;
    playerReset();
    updateScore();
    gameActive = true;
    update();
}

function update(time = 0) {
    if (!gameActive) return;

    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = 'Score: ' + player.score;
    document.getElementById('highscore').innerText = highScore;
}


document.addEventListener('keydown', event => {
    if (!gameActive) return;

    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    } else if (event.keyCode === 32) {
        playerHardDrop();
    }
});

// Gamepad support
let gamepadInterval;
let gamepadState = {};

function handleGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads) return;

    for (const gamepad of gamepads) {
        if (gamepad) {
            // Buttons
            gamepad.buttons.forEach((button, index) => {
                if (button.pressed && !gamepadState[gamepad.index + '_button_' + index]) {
                    // Button pressed
                    if (index === 14) playerMove(-1); // D-pad left
                    if (index === 15) playerMove(1);  // D-pad right
                    if (index === 13) playerDrop();   // D-pad down
                    if (index === 0) playerHardDrop(); // A button
                    if (index === 2) playerRotate(-1); // X button
                    if (index === 3) playerRotate(1);  // Y button
                }
                gamepadState[gamepad.index + '_button_' + index] = button.pressed;
            });

            // Axes (for joysticks)
            gamepad.axes.forEach((axis, index) => {
                // Left stick horizontal
                if (index === 0) {
                    if (axis < -0.5 && !gamepadState[gamepad.index + '_axis_' + index + '_left']) {
                        playerMove(-1);
                    } else if (axis > 0.5 && !gamepadState[gamepad.index + '_axis_' + index + '_right']) {
                        playerMove(1);
                    }
                    gamepadState[gamepad.index + '_axis_' + index + '_left'] = axis < -0.5;
                    gamepadState[gamepad.index + '_axis_' + index + '_right'] = axis > 0.5;
                }
                // Left stick vertical
                if (index === 1) {
                    if (axis > 0.5 && !gamepadState[gamepad.index + '_axis_' + index + '_down']) {
                        playerDrop();
                    }
                    gamepadState[gamepad.index + '_axis_' + index + '_down'] = axis > 0.5;
                }
            });
        }
    }
}

window.addEventListener("gamepadconnected", (e) => {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
    if (!gamepadInterval) {
        gamepadInterval = setInterval(handleGamepad, 100);
    }
});

window.addEventListener("gamepaddisconnected", (e) => {
    console.log("Gamepad disconnected from index %d: %s",
        e.gamepad.index, e.gamepad.id);
    if (!navigator.getGamepads().some(gp => gp !== null)) {
        clearInterval(gamepadInterval);
        gamepadInterval = null;
    }
});

startButton.addEventListener('click', startGame);
retryButton.addEventListener('click', startGame);

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
    '#FFFFFF',
];

const arena = createMatrix(12, 20);

const player = {
    pos: {
        x: 0,
        y: 0
    },
    matrix: null,
    nextMatrix: null,
    score: 0,
};

playerReset();
updateScore();
update();

showTitleScreen();