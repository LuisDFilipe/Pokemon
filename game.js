const TILE_SIZE = 32;
let player;
let cursors;
let isMoving = false;

const config = {
    type: Phaser.AUTO,
    width: 512,
    height: 512,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
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
    this.load.image('player', 'assets/player/player1.png'); // Player sprite
}

function create() {
    map = this.make.tilemap({ key: 'map' });
    ground_1_tileset = map.addTilesetImage('ground_1', 'ground_1');

    ground_1_layer = map.createLayer('Ground1', ground_1_tileset, 0, 0);

    ground_1_layer.setCollisionByProperty({ collides: true });

    // Place player at a tile position
    player = this.physics.add.sprite(0 * TILE_SIZE, 0 * TILE_SIZE, 'player');
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
}

function update() {
    if (isMoving) return;

    let moveX = 0;
    let moveY = 0;

    if (Phaser.Input.Keyboard.JustDown(cursors.left)) moveX = -1;
    else if (Phaser.Input.Keyboard.JustDown(cursors.right)) moveX = 1;
    else if (Phaser.Input.Keyboard.JustDown(cursors.up)) moveY = -1;
    else if (Phaser.Input.Keyboard.JustDown(cursors.down)) moveY = 1;
    else return;

    var targetX = player.x + moveX * TILE_SIZE;
    var targetY = player.y + moveY * TILE_SIZE;

    movePlayer(this, moveX, moveY);

    grass_trigger_zones.forEach(zone => {
        if (Phaser.Geom.Rectangle.Contains(zone.rect, targetX, targetY)) {
            //console.log("Grass", zone.rect, targetX, targetY);
            showToast("Grass", 1000);
        }
    });
}

function movePlayer(scene, moveX, moveY) {
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
        duration: 150,
        onComplete: () => { isMoving = false; }
    });
    
}

function showToast(message = "This is a toast!", duration = 3000) {
    const toast = document.createElement("div");
    toast.textContent = message;

    Object.assign(toast.style, {
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#333",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "6px",
        fontSize: "14px",
        zIndex: 9999,
        opacity: "0",
        transition: "opacity 0.4s ease, bottom 0.4s ease"
    });

    document.body.appendChild(toast);

    // Force style recalculation before showing
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.bottom = "50px";
    });

    // Remove after duration
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.bottom = "30px";
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 400);
    }, duration);
}

document.getElementById('up').addEventListener('mousedown', () => {
    console.log('Move Up');
    movePlayer(game.scene.scenes[0], 0, -1);
});

document.getElementById('down').addEventListener('mousedown', () => {
    console.log('Move Down');
    movePlayer(game.scene.scenes[0], 0, 1);
});

document.getElementById('left').addEventListener('mousedown', () => {
    console.log('Move Left');
    movePlayer(game.scene.scenes[0], -1, 0);
});

document.getElementById('right').addEventListener('mousedown', () => {
    console.log('Move Right');
    movePlayer(game.scene.scenes[0], 1, 0);
});

// Also support touch events for mobile:
['up', 'down', 'left', 'right'].forEach(dir => {
    var btn = document.getElementById(dir);
    btn.addEventListener('touchstart', e => {
        e.preventDefault(); // prevent mouse event from also firing
        console.log('Touch ' + dir);

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