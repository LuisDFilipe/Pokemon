const TILE_SIZE = 32;
let player;
let cursors;
let wasd;
let isMoving = false;

const config = {
    type: Phaser.AUTO,
    width: 512,
    height: 512,
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT, // FIT scales the game to fit the screen while preserving aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the canvas
    },
    physics: {
        default: 'arcade',
        arcade: { debug: true }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);
var map;
var ground_1_tileset;
var ground_1_layer;
var object_layer;

function preload() {
    this.load.image('ground_1', 'assets/map/ground_1.png');
    this.load.image('grass_1', 'assets/map/grass_1.png');
    this.load.tilemapTiledJSON('map', 'assets/map/map1.json'); // Your map JSON
    //this.load.image('player', 'assets/player/player1.png'); // Player sprite
    this.load.spritesheet('player', 'assets/player/player1.png', {
        frameWidth: 32,
        frameHeight: 32
    });
}

function create() {
    map = this.make.tilemap({ key: 'map' });
    ground_1_tileset = map.addTilesetImage('ground_1', 'ground_1');

    ground_1_layer = map.createLayer('Ground1', ground_1_tileset, 0, 0);

    ground_1_layer.setCollisionByProperty({ collides: true });

    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
    });

    // Place player at a tile position
    player = this.physics.add.sprite(0 * TILE_SIZE, 0 * TILE_SIZE, 'player');
    player.play('walk');
    player.setOrigin(0.5);
    player.setDepth(10);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, ground_1_layer);

    grass_object_layer = map.getObjectLayer('Grass1');

    grass_trigger_zones = grass_object_layer.objects.map(obj => {
        var sprite = this.add.sprite(obj.x, obj.y - obj.height, 'grass_1');
        sprite.setOrigin(0, 0);
        return {
            name: obj.name,
            rect: new Phaser.Geom.Rectangle(obj.x, obj.y - obj.height, obj.width, obj.height),
            triggered: false
        };
    });

    cursors = this.input.keyboard.createCursorKeys();

    // WASD keys
    wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });
}

function update() {    
    if (isMoving) return;
    
    //check key presses
    if (Phaser.Input.Keyboard.JustDown(cursors.left) || Phaser.Input.Keyboard.JustDown(wasd.left))
        var moveX = -1;
    else if (Phaser.Input.Keyboard.JustDown(cursors.right) || Phaser.Input.Keyboard.JustDown(wasd.right))
        var moveX = 1;
    else if (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(wasd.up))
        var moveY = -1;
    else if (Phaser.Input.Keyboard.JustDown(cursors.down) || Phaser.Input.Keyboard.JustDown(wasd.down))
        var moveY = 1;
    else return;

    //movePlayer
    if((moveX != null) || (moveY != null))
        movePlayer(this, (moveX != null) ? moveX : 0, (moveY != null) ? moveY : 0);
}

function movePlayer(scene, moveX, moveY) {
    if (isMoving) {
        return;
    }

    var targetX = player.x + moveX * TILE_SIZE;
    var targetY = player.y + moveY * TILE_SIZE;

    var tileX = Math.floor(targetX / TILE_SIZE);
    var tileY = Math.floor(targetY / TILE_SIZE);

    layer = map.getLayer('Ground1').tilemapLayer;
    var tile = layer.hasTileAt(tileX, tileY) ? layer.getTileAt(tileX, tileY) : null;

    if (tile && tile.properties.collides) return; // Block movement if collides

    isMoving = true;
    
    scene.tweens.add({
        targets: player,
        x: targetX,
        y: targetY,
        duration: 100,
        onComplete: () => { isMoving = false; }
    });
    
    grass_trigger_zones.forEach(zone => {
        if (Phaser.Geom.Rectangle.Contains(zone.rect, targetX, targetY)) {
            //console.debug("Grass", zone.rect, targetX, targetY);
            showToast("Grass", 1000, "top");
        }
    });
}

function showToast(message = "This is a toast!", duration = 1000, position = "bottom") {
    const toast = document.createElement("div");
    toast.textContent = message;

    const isTop = position.toLowerCase() === "top";
    const initialOffset = "30px";
    const visibleOffset = "50px";

    Object.assign(toast.style, {
        position: "fixed",
        [position]: initialOffset, // Sets 'top' or 'bottom'
        left: "50%",
        transform: "translateX(-50%)",
        background: "#333",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "6px",
        fontSize: "14px",
        zIndex: 9999,
        opacity: "0",
        transition: `opacity 0.4s ease, ${position} 0.4s ease`
    });

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style[position] = visibleOffset;
    });

    // Animate out and remove
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style[position] = initialOffset;
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 400);
    }, duration);
}


// Support touch events
['up', 'down', 'left', 'right'].forEach(dir => {
    var btn = document.getElementById(dir);
    btn.addEventListener('touchstart', e => {
        //e.preventDefault(); // prevent mouse event from also firing
        console.debug('Touch ' + dir);
        
        moveX = 0;
        moveY = 0;
        
        if (dir == "left") moveX = -1;
        else if (dir == "right") moveX = 1;
        else if (dir == "up") moveY = -1;
        else if (dir == "down") moveY = 1;
        else return;

        movePlayer(game.scene.scenes[0], moveX, moveY);
    });
});