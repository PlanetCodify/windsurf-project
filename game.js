const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const startButton = document.getElementById('startButton');
const loadingElement = document.getElementById('loading');

let score = 0;
let animationId;
let gameSpeed = 3;

// Set up canvas for emoji rendering
ctx.font = '45px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 45,
    height: 45,
    speed: 5,
    dx: 0,
    emoji: '🚘',
    color: '#0055ff'
};

let obstacles = [];
const keys = {
    ArrowLeft: false,
    ArrowRight: false
};

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

startButton.addEventListener('click', startGame);

// Road lines for visual effect
const roadLines = [];
const ROAD_LINE_COUNT = 5;
for (let i = 0; i < ROAD_LINE_COUNT; i++) {
    roadLines.push({
        y: (canvas.height / ROAD_LINE_COUNT) * i,
        speed: gameSpeed
    });
}

class Obstacle {
    constructor() {
        this.width = 45;
        this.height = 45;
        this.x = Math.random() * (canvas.width - this.width) + this.width/2;
        this.y = -this.height;
        this.type = Math.random() < 0.4 ? 'car' : 
                   Math.random() < 0.7 ? 'pothole' : 'barricade';
        
        switch(this.type) {
            case 'car':
                this.emoji = '🚘';
                this.points = 1;
                break;
            case 'pothole':
                this.emoji = '🚧';
                this.width = 35;
                this.height = 35;
                this.points = 2;
                break;
            case 'barricade':
                this.emoji = '🚨';
                this.width = 40;
                this.height = 40;
                this.points = 3;
                break;
        }
    }

    draw() {
        ctx.fillText(this.emoji, this.x, this.y);
    }

    update() {
        this.y += gameSpeed;
        this.draw();
    }
}

function drawRoad() {
    // Draw road background
    ctx.fillStyle = '#444444';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw road lines
    ctx.fillStyle = '#ffffff';
    for (let line of roadLines) {
        ctx.fillRect(canvas.width/2 - 2, line.y, 4, 30);
        line.y += line.speed;
        if (line.y > canvas.height) {
            line.y = -30;
        }
    }
}

function drawPlayer() {
    // Save current context state
    ctx.save();
    
    // Apply blue tint to the player's car
    // First, draw a stronger blue glow
    ctx.fillStyle = player.color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.width/2 + 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a second, more intense blue layer
    ctx.fillStyle = '#0099ff';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.width/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset for emoji
    ctx.globalAlpha = 1.0;
    ctx.fillText(player.emoji, player.x, player.y);
    
    // Restore context state
    ctx.restore();
}

function updatePlayer() {
    if (keys.ArrowLeft && player.x > player.width) {
        player.dx = -player.speed;
    } else if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.dx = player.speed;
    } else {
        player.dx = 0;
    }

    player.x += player.dx;
    
    // Keep player within bounds
    if (player.x < player.width) player.x = player.width;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}

function checkCollision(obstacle) {
    const distance = Math.hypot(player.x - obstacle.x, player.y - obstacle.y);
    return distance < (player.width + obstacle.width) / 2;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawRoad();
    updatePlayer();
    drawPlayer();

    // Update and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            score += obstacles[i].points;
            scoreElement.textContent = `Score: ${score}`;
            gameSpeed += 0.1;
            // Update road line speed
            roadLines.forEach(line => line.speed = gameSpeed);
        } else if (checkCollision(obstacles[i])) {
            gameOver();
            return;
        }
    }

    // Add new obstacles
    if (Math.random() < 0.02) {
        obstacles.push(new Obstacle());
    }

    animationId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    cancelAnimationFrame(animationId);
    gameOverElement.style.display = 'block';
}

function startGame() {
    // Reset game state
    score = 0;
    gameSpeed = 3;
    obstacles = [];
    player.x = canvas.width / 2;
    scoreElement.textContent = `Score: ${score}`;
    gameOverElement.style.display = 'none';
    
    // Reset road lines
    roadLines.forEach((line, index) => {
        line.y = (canvas.height / ROAD_LINE_COUNT) * index;
        line.speed = gameSpeed;
    });
    
    // Start game loop
    gameLoop();
}

// Remove loading message and start the game
loadingElement.style.display = 'none';
startGame();
