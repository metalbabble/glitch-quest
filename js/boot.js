var currentBgm = null;
var bgmByKey = {};
var requestedBgmKey = null;
var requestedBgmScene = null;
var audioUnlockHandlersBound = false;

function bindAudioUnlockHandlers() {
    if(audioUnlockHandlersBound) {
        return;
    }

    var tryUnlockAudio = function() {
        if(!requestedBgmScene || !requestedBgmScene.sound) {
            return;
        }

        var ctx = requestedBgmScene.sound.context;

        if(requestedBgmScene.sound.unlock) {
            requestedBgmScene.sound.unlock();
        }

        if(ctx && ctx.state === 'suspended') {
            ctx.resume();
        }

        // Retry queued scene music after audio context resumes.
        if(requestedBgmKey) {
            playSceneMusic(requestedBgmScene, requestedBgmKey);
        }
    };

    window.addEventListener('pointerdown', tryUnlockAudio, { passive: true });
    window.addEventListener('keydown', tryUnlockAudio);
    audioUnlockHandlersBound = true;
}

function playSceneMusic(scene, key) {
    requestedBgmKey = key;
    requestedBgmScene = scene;
    bindAudioUnlockHandlers();

    var music = bgmByKey[key];
    if(!music || !music.manager) {
        music = scene.sound.add(key, { loop: true, volume: 0.5 });
        bgmByKey[key] = music;
    }

    if(currentBgm && currentBgm !== music && currentBgm.isPlaying) {
        currentBgm.stop();
    }

    currentBgm = music;

    var audioContext = scene.sound.context;
    if(scene.sound.locked && scene.sound.unlock) {
        scene.sound.unlock();
    }

    // Some Phaser builds can leave sound.locked=true even when context is running.
    // Only gate playback on the actual WebAudio context state.
    var isAudioLocked = audioContext && audioContext.state !== 'running';
    if(isAudioLocked) {
        return;
    }

    if(!music.isPlaying) {
        music.play();
    }
}

function stopSceneMusic(key) {
    if(!currentBgm) {
        return;
    }

    if(!key || currentBgm.key === key) {
        if(currentBgm.isPlaying) {
            currentBgm.stop();
        }
        currentBgm = null;
    }
}

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
        this.load.image("virus.png", "assets/monsters/virus.png");
        this.load.image("ice-bird.png", "assets/monsters/ice-bird.png");
        this.load.image("royal-knight.png", "assets/monsters/royal-knight.png");
        this.load.image("knight.png", "assets/monsters/knight.png");
        this.load.image("eye-bug.png", "assets/monsters/eye-bug.png");
        this.load.image("fire-walker.png", "assets/monsters/fire-walker.png");
        this.load.image("purple-eater.png", "assets/monsters/purple-eater.png");
        this.load.image("boomer.png", "assets/monsters/boomer.png");

        // background music
        this.load.audio('overworldMusic', 'assets/music/overworld.mp3');
        this.load.audio('battleMusic', 'assets/music/battle.mp3');
       
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