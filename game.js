// Create the game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Global variables
let player;
let cursors;
let bullets;
let enemies;
let lastFired = 0;
let score = 0;
let scoreText;
let lives = 3;
let livesText;

// Initialize the Phaser Game
const game = new Phaser.Game(config);

function preload() {
    // Load assets
    this.load.image('background', 'https://i.imgur.com/Wl11xgu.png');
    this.load.image('player', 'https://i.imgur.com/OWks14P.png');
    this.load.image('bullet', 'https://i.imgur.com/ZOAD2F7.png');
    this.load.image('enemy', 'https://i.imgur.com/LwEwLZJ.png');
}

function create() {
    // Add background
    this.add.image(400, 300, 'background');

    // Create player sprite
    player = this.physics.add.sprite(400, 500, 'player');
    player.setCollideWorldBounds(true);

    // Create bullet group
    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 10
    });

    // Create enemy group
    enemies = this.physics.add.group({
        key: 'enemy',
        repeat: 7,
        setXY: { x: 12, y: 0, stepX: 100 }
    });

    // Move enemies down periodically
    enemies.children.iterate(function (enemy) {
        enemy.setVelocityY(100);
    });

    // Create cursor input
    cursors = this.input.keyboard.createCursorKeys();

    // Score and Lives text
    scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#fff' });
    livesText = this.add.text(10, 40, 'Lives: 3', { fontSize: '20px', fill: '#fff' });

    // Bullet & Enemy collision
    this.physics.add.collider(bullets, enemies, destroyEnemy, null, this);

    // Detect if enemies reach the bottom
    this.physics.add.overlap(enemies, player, loseLife, null, this);
}

function update(time) {
    // Player movement
    if (cursors.left.isDown) {
        player.setVelocityX(-300);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300);
    } else {
        player.setVelocityX(0);
    }

    // Shoot bullets
    if (cursors.space.isDown && time > lastFired) {
        const bullet = bullets.get(player.x, player.y - 20);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setVelocityY(-500);
            lastFired = time + 300;
        }
    }

    // Reuse bullets when off-screen
    bullets.children.each(function (bullet) {
        if (bullet.y < 0) {
            bullets.killAndHide(bullet);
            bullet.setActive(false);
            bullet.setVisible(false);
        }
    });

    // Respawn enemies when off-screen
    enemies.children.iterate(function (enemy) {
        if (enemy.y > 600) {
            enemy.y = 0;
            enemy.x = Phaser.Math.Between(50, 750);
            enemy.setVelocityY(100 + Math.random() * 100); // Increase speed over time
        }
    });
}

function destroyEnemy(bullet, enemy) {
    bullet.setActive(false).setVisible(false);
    bullet.destroy();
    enemy.destroy();

    // Increase score
    score += 10;
    scoreText.setText('Score: ' + score);
}

function loseLife(player, enemy) {
    enemy.destroy();
    lives -= 1;
    livesText.setText('Lives: ' + lives);

    if (lives <= 0) {
        this.physics.pause();
        player.setTint(0xff0000);
        livesText.setText('Game Over');
    }
}

