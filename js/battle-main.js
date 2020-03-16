var BattleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function BattleScene ()
    {
        Phaser.Scene.call(this, { key: "BattleScene" });        
    }, 
    create: function ()
    {
        this.startBattle();
        // on wake event call startBattle too
        this.sys.events.on('wake', this.startBattle, this);                              
    },
    startBattle: function() {
        // prep monster data
        var monsterJSON = game.cache.json.get('MonsterData');
        console.log(monsterJSON.MonsterData[0]);
        var m1 = monsterJSON.MonsterData[Phaser.Math.Between(0, monsterJSON.MonsterData.length-1)];
        var m2 = monsterJSON.MonsterData[Phaser.Math.Between(0, monsterJSON.MonsterData.length-1)];
        var m3 = monsterJSON.MonsterData[Phaser.Math.Between(0, monsterJSON.MonsterData.length-1)];

        // set the battle background color
        this.cameras.main.setBackgroundColor("#000000");//brown: 503000

        // players
        var player1 = new PlayerCharacter(this, 550, -100, "player", 1, currentGame.playerName, 50, 50);        
        this.add.existing(player1);
        var player2 = new PlayerCharacter(this, 550, -100, "player", 4, "Player 2", 80, 100);
        this.add.existing(player2);            
        var player3 = new PlayerCharacter(this, 550, -100, "player", 4, "Player 3", 80, 100);
        this.add.existing(player3);            
        
        // enemy
        var e1 = new Enemy(this, 50, 100, m1.img, null, m1.name, m1.hp, m1.atk, m1.def);
        this.add.existing(e1);
        var e2 = new Enemy(this, 150, 100, m2.img, null,m2.name, m2.hp, m2.atk, m2.def);
        this.add.existing(e2);
        var e3 = new Enemy(this, 250, 100, m3.img, null,m3.name, m3.hp, m3.atk, m3.def);
        this.add.existing(e3);
      
        // array with heroes
        //this.heroes = [ player1, player2, player3 ];
        this.heroes = [ player1];

        // array with enemies
        this.enemies = [ e1, e2, e3];
        // array with both parties, who will attack
        this.units = this.heroes.concat(this.enemies);
        
        this.index = -1;     // the current active unit in battle 

        this.scene.run("UIScene");                     
    },
    nextTurn: function() {
        console.log("Start next turn");
        
        // if we have victory or game over
        if(this.checkEndBattle()) {           
            this.endBattle();
            return;
        }

        do {
            // currently active unit
            this.index++;
            // if there are no more units, we start again from the first one
            if(this.index >= this.units.length) {
                this.index = 0;
            }            
        } while(!this.units[this.index].living);
        
        //if(this.units[this.index]) {
            // if its player hero
            if(this.units[this.index] instanceof PlayerCharacter) {                
                this.events.emit("PlayerSelect", this.index);
            } else { // else if its enemy unit
                // pick random hero
                var r = Math.floor(Math.random() * this.heroes.length);
                // call the enemy"s attack function 
                this.units[this.index].attack(this.heroes[r]);  
                
                // TODO: no shake if miss

                // shake and blink for damage fx
                this.cameras.main.shake(300);

                // send event for ui to shake also
                this.events.emit("PlayerDamage");
                
                // add timer for the next turn, so will have smooth gameplay
                this.time.addEvent({ delay: 1000, callback: this.nextTurn, callbackScope: this });
            }
        //}
    },
    // check for game over or victory
    checkEndBattle: function() {                
        // if all enemies are dead we have victory
        var victory = true;
        for(var i = 0; i < this.enemies.length; i++) {
            if(this.enemies[i].living)
                victory = false;
        }
        
        // if all heroes are dead we have game over
        var gameOver = true;
        for(var h = 0; h < this.heroes.length; h++) {
            if(this.heroes[h].hp > 0)
            {
                gameOver = false;
            }
        }
        
        if(victory)
        {
            // TODO: fix me
            //this.events.emit("Message", "Victory!");
            //console.log("umm... you win?");
            //this.time.addEvent({ delay: 1000, callback: this.endBattle, callbackScope: this });
        }

        return victory || gameOver;        
    },
    // when the player have selected the enemy to be attacked
    receivePlayerSelection: function(action, target) {
        console.log(action);
        if(action == "attack") {                
            this.units[this.index].attack(this.enemies[target]);              
        }
        else if (action == "run") { // TODO: this doesn't work
            exitBattle();
        }

        // minor delay before next player input
        this.time.addEvent({ delay: 2000, callback: this.nextTurn, callbackScope: this });        
    },
    
    // return to the world map
    exitBattle: function() {
        console.log("exitBattle");
        this.scene.sleep('UIScene');
        this.scene.switch('WorldScene');
    },
    wake: function() {
        console.log("wake");
        this.scene.run('UIScene');  
        this.time.addEvent({delay: 2000, callback: this.exitBattle, callbackScope: this});        
    },
    endBattle: function() {  
        console.log("Battle ended.");     
        // clear state, remove sprites
        this.heroes.length = 0;
        this.enemies.length = 0;
        for(var i = 0; i < this.units.length; i++) {
            // link item
            this.units[i].destroy();            
        }
        this.units.length = 0;
        // sleep the UI
        this.scene.sleep('UIScene');
        // return to WorldScene and sleep current BattleScene
        this.scene.switch('WorldScene');
    }
});

// base class for heroes and enemies
var Unit = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,
 
    initialize: function Unit(scene, x, y, texture, frame, type, hp, damage, defense) {
        Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame);
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage     
        this.living = true;         
        this.menuItem = null;
        this.defense = defense;
    },
    // we will use this to notify the menu item when the unit is dead
    setMenuItem: function(item) {
        this.menuItem = item;
    },
    // attack the target unit
    attack: function(target) {
        if(target.living) {
            // calculate damage
            var calculatedDmg = this.damage+
                Phaser.Math.Between(-5, 5);
            //TODO: calculatedDmg -= target.defense;
            if(calculatedDmg<0)
                calculatedDmg=0;

            // assign damage
            target.takeDamage(calculatedDmg);
            
            // build output text
            var battleMsg = this.type + " attacks! \n" + 
                calculatedDmg + " damage to " + target.type + "!";
            if (target.hp < 1)
            {
                battleMsg += "\n" + target.type + " was defeated!!";
            }

            // did they miss?
            if(calculatedDmg==0){
                battleMsg = this.type + " attacks! MISS!\n" + 
                    calculatedDmg + " avoids the attack!";
            }
            
            this.scene.events.emit("Message", battleMsg);
        }
    },    
    takeDamage: function(damage) {
        this.hp -= damage;
        if(this.hp <= 0) {
            this.hp = 0;
            this.menuItem.unitKilled();
            this.living = false;
            this.visible = false;   
            this.menuItem = null;
        }
    }    
});

var Enemy = new Phaser.Class({
    Extends: Unit,

    initialize: function Enemy(scene, x, y, texture, frame, type, hp, damage) {
        Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
    }
});

var PlayerCharacter = new Phaser.Class({
    Extends: Unit,

    initialize: function PlayerCharacter(scene, x, y, texture, frame, type, hp, damage) {
        Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
        //this.flipX = true;        
        //this.setScale(2);
    }
});

