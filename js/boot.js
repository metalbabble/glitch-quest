var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BootScene ()
    {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },

    preload: function ()
    {
        // map tiles
        this.load.image('tiles', 'assets/map/spritesheet.png');
        
        // map in json format
        this.load.tilemapTiledJSON('map', 'assets/map/map.json');
        
        // player gfx (battle use?)
        this.load.spritesheet('player', 'assets/chara.png', { frameWidth: 16, frameHeight: 16 });

        // load battle resources
        this.load.spritesheet("player", "assets/chara.png", { frameWidth: 16, frameHeight: 16 });
        
        // load monster data json
        this.load.json('MonsterData', '/assets/data/MonsterData.json');

        // load enemy gfx
        this.load.image("blue-goo.png", "assets/monsters/blue-goo.png");
        this.load.image("orange-goo.png", "assets/monsters/orange-goo.png");
        this.load.image("trash-mimic.png", "assets/monsters/trash-mimic.png");
        this.load.image("ice-bird.png", "assets/monsters/ice-bird.png");
    },

    create: function ()
    {
        // start the WorldScene
        this.scene.start('WorldScene');
    }
});