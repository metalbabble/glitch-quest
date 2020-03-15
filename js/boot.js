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
        this.load.image("royal-knight.png", "assets/monsters/royal-knight.png");
        this.load.image("knight.png", "assets/monsters/knight.png");
       
    },

    create: function ()
    {
        /* TODO: make this work... might need to happen at preload

        // auto-load enemy gfx based on json contents
        var monsters = game.cache.json.get('MonsterData').MonsterData;
        for(var i=0; i<monsters.length; i++){
            this.load.image(monsters[i].img, "assets/monsters/" + monsters[i].img);
            console.log(monsters[i].img + ", " + "assets/monsters/" + monsters[i].img);
        }
        
        */

        // start the WorldScene
        this.scene.start('WorldScene');
    }
});