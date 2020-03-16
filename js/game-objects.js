// describes the game state, can be saved & restored
var GameState = new Phaser.Class({
    mapNumber : Number,
    playerName : String
});

// start with new blank game
currentGame = new GameState();
currentGame.mapNumber = 1;
currentGame.playerName = "Player";
//currentGame.playerName = prompt("Enter your name...");
