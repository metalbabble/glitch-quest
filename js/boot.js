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
        this.load.image("blue-goo", "assets/monsters/blue-goo.png");
        this.load.image("orange-goo", "assets/monsters/orange-goo.png");
        this.load.image("trash-mimic", "assets/monsters/trash-mimic.png");
        this.load.image("ice-bird", "assets/monsters/ice-bird.png");
        
    },

    create: function ()
    {
        // start the WorldScene
        this.scene.start('WorldScene');
    }
});