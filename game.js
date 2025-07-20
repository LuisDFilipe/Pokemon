const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1d1d1d',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

let player;
let cursors;

const game = new Phaser.Game(config);

function preload() {
    // Optional: Load an image sprite
    // this.load.image('player', 'assets/player.png');
}

function create() {
    // Create player as a simple graphics object (a white square)
    const graphics = this.add.graphics({ fillStyle: { color: 0xffffff } });
    const square = new Phaser.Geom.Rectangle(0, 0, 32, 32);
    graphics.fillRectShape(square);
    const texture = graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);

    // Arrow keys
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    player.setVelocityX(0); // reset horizontal velocity
    player.setVelocityY(0); // reset vertical velocity

    if (cursors.up.isDown) {
        player.setVelocityY(-150);
    } else if (cursors.down.isDown) {
        player.setVelocityY(150);
    } else if (cursors.left.isDown) {
        player.setVelocityX(-150);
    } else if (cursors.right.isDown) {
        player.setVelocityX(150);
    }
}