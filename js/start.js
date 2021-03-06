/* GLITCH GAME by Brian Shea Copyright 2020 metalbabble.com */

var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 320,
    height: 240,
    zoom: 3,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // set to true to view zones
        }
    },
    scene: [
        BootScene,
        WorldScene,
        BattleScene, 
        UIScene
    ]
};
var game = new Phaser.Game(config);