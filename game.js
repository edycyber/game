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
    // No need to load images, using graphics for basic shapes.
}

function create() {
    // Add background color
    this.cameras.main.setBackgroundColor('#000000');

    // Create player sprite using graphics
    player = this.add.rectangle(400, 500, 50, 50, 0x00ff00);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    // Create bullet group
    bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 10,
        classType: Phaser.GameObjects.Rectangle
    });

    // Create enemy group
    enemies = this.physics.add.group({
        key: 'enemy',
        repeat: 7,
        classType: Phaser.GameObjects.Rectangle,
        setXY: { x: 12, y: 0, stepX: 100 }
    });

    // Create enemies using graphics
    enemies.children.iterate(function (enemy) {
        enemy.setSize(40, 40);
        enemy.fillStyle(0xff0000);
        enemy.body.setVelocityY(100);
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
        player.body.setVelocityX(-300);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(300);
    } else {
        player.body.setVelocityX(0);
    }

    // Shoot bullets
    if (cursors.space.isDown && time > lastFired) {
        const bullet = bullets.create(player.x, player.y - 20, 'bullet');
        bullet.setSize(10, 20);
        bullet.fillStyle(0xffffff);
        this.physics.world.enable(bullet);
        bullet.body.setVelocityY(-500);
        lastFired = time + 300;
    }

    // Reuse bullets when off-screen
    bullets.children.each(function (bullet) {
        if (bullet.y < 0) {
            bullet.destroy();
        }
    });

    // Respawn enemies when off-screen
    enemies.children.iterate(function (enemy) {
        if (enemy.y > 600) {
            enemy.y = 0;
            enemy.x = Phaser.Math.Between(50, 750);
            enemy.body.setVelocityY(100 + Math.random() * 100); // Increase speed over time
        }
    });
}

function destroyEnemy(bullet, enemy) {
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
        player.fillColor = 0xff0000;
        livesText.setText('Game Over');
    }
}
