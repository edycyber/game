// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Keyboard controls
let keys = {};

// Player object
const player = {
    x: 100,
    y: 500,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
    gravity: 0.5,
    jumpPower: 10,
    grounded: false,
    shootCooldown: 0,
    bullets: [],
    health: 3,
};

// Add Event Listeners for keyboard controls
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Enemy setup
const enemies = [];
function createEnemy() {
    enemies.push({
        x: canvas.width,
        y: Math.random() * canvas.height - 50,
        width: 50,
        height: 50,
        speed: 2,
        health: 2,
    });
}
setInterval(createEnemy, 2000); // Spawn an enemy every 2 seconds

// Power-Up setup
const powerUps = [];
function createPowerUp() {
    powerUps.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - 50,
        width: 20,
        height: 20,
        type: 'health', // Example power-up type
    });
}
setInterval(createPowerUp, 10000); // Spawn a power-up every 10 seconds

// Platforms setup
const platforms = [
    { x: 150, y: 450, width: 100, height: 20 },
    { x: 350, y: 350, width: 150, height: 20 },
    { x: 600, y: 500, width: 100, height: 20 },
];

// Player movement and physics
function playerMovement() {
    if (keys['ArrowRight']) {
        player.dx = player.speed;
    } else if (keys['ArrowLeft']) {
        player.dx = -player.speed;
    } else {
        player.dx = 0;
    }

    if (keys['Space'] && player.grounded) {
        player.dy = -player.jumpPower;
        player.grounded = false;
    }

    // Gravity
    player.dy += player.gravity;
    player.y += player.dy;
    player.x += player.dx;

    // Ground check
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.grounded = true;
        player.dy = 0;
    }

    // Shooting mechanic
    if (keys['KeyZ'] && player.shootCooldown === 0) {
        shootBullet();
        player.shootCooldown = 20; // Cooldown between shots
    }
    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }
}

// Function to shoot bullets
function shootBullet() {
    player.bullets.push({
        x: player.x + player.width,
        y: player.y + player.height / 2 - 5,
        width: 10,
        height: 5,
        speed: 8,
    });
}

// Handle bullets
function handleBullets() {
    player.bullets.forEach((bullet, index) => {
        bullet.x += bullet.speed;
        if (bullet.x > canvas.width) {
            player.bullets.splice(index, 1);
        }

        // Draw bullet
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Bullet collision with enemies
        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemies.splice(enemyIndex, 1); // Remove enemy
                player.bullets.splice(index, 1); // Remove bullet
            }
        });
    });
}

// Handle enemies
function handleEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.x -= enemy.speed;

        if (enemy.x + enemy.width < 0) {
            enemies.splice(index, 1); // Remove off-screen enemies
        }

        // Draw enemy
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Enemy collision with player
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            player.health--;
            enemies.splice(index, 1);
            if (player.health <= 0) {
                alert("Game Over!");
                document.location.reload();
            }
        }
    });
}

// Handle platforms
function handlePlatforms() {
    platforms.forEach((platform) => {
        ctx.fillStyle = 'gray';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Collision with player
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height &&
            player.dy >= 0
        ) {
            player.grounded = true;
            player.dy = 0;
        }
    });
}

// Handle power-ups
function handlePowerUps() {
    powerUps.forEach((powerUp, index) => {
        ctx.fillStyle = 'blue';
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);

        // Power-up collision with player
        if (
            player.x < powerUp.x + powerUp.width &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.height &&
            player.y + player.height > powerUp.y
        ) {
            if (powerUp.type === 'health' && player.health < 3) {
                player.health++; // Heal the player
            }
            powerUps.splice(index, 1); // Remove collected power-up
        }
    });
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Handle player movement
    playerMovement();

    // Draw player
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Handle bullets, enemies, platforms, and power-ups
    handleBullets();
    handleEnemies();
    handlePlatforms();
    handlePowerUps();

    // Show player's health
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Health: ${player.health}`, 10, 20);

    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();

