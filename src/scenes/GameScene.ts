import Phaser from "phaser";
import Player from "../Player.ts";
import Enemy from "../Enemy.ts";
import Resource from "../Resource.ts";


export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        this.enemies = []
    }

    preload() {
        Player.preload(this);
        Enemy.preload(this)
        Resource.preload(this);
        this.load.image('tiles', 'assets/images/RPG Nature Tileset-extruded.png');
        this.load.tilemapTiledJSON('map', 'assets/images/map.json');
        
    }

    create() {
        const map = this.make.tilemap({ key: 'map' });
        this.map = map;

        const tileset = map.addTilesetImage('RPG Nature Tileset', 'tiles', 32, 32, 1, 2);
        const layer1 = map.createLayer('Tile Layer 1', tileset, 0, 0);
        const layer2 = map.createLayer('Tile Layer 2', tileset, 0, 0);
        layer1.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(layer1);

        this.map.getObjectLayer('Resources').objects.forEach(resource=>new Resource({scene:this, resource}))
        this.map.getObjectLayer('Enemies').objects.forEach(enemy => this.enemies.push(new Enemy({scene:this, enemy})))
        //x:380, y:38
        this.player = new Player({ scene: this, x: 370, y: 45, texture: 'female', frame: 'townsfolk_f_idle_1',depth:1 });
        this.player.inputKeys = this.input.keyboard?.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
       let camera = this.cameras.main;
       camera.setZoom(5)
       camera.startFollow(this.player, true, 0.1, 0.1);
       camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
       camera.setViewport(0, 0, this.scale.width, this.scale.height);
    }

    update() {
        this.enemies.forEach(enemy => enemy.update())
        this.player.update();
    }


}
