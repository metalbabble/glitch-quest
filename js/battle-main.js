// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scenemanager/
var BattleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function BattleScene ()
    {
        Phaser.Scene.call(this, { key: "BattleScene" });        
    }, 
    create: function ()
    {
        this.startBattle();
        // on wake event we call startBattle too
        this.sys.events.on('wake', this.startBattle, this);                              
    },
    startBattle: function() {
        // set the battle background color
        this.cameras.main.setBackgroundColor("#503000");

        // player 1
        var player1 = new PlayerCharacter(this, 550, -100, "player", 1, "Player", 100, 200);        
        this.add.existing(player1);
        
        // player 2
        var player2 = new PlayerCharacter(this, 550, -100, "player", 4, "Player 2", 80, 100);
        this.add.existing(player2);            

        // player 3
        var player3 = new PlayerCharacter(this, 550, -100, "player", 4, "Player 3", 80, 100);
        this.add.existing(player3);            
        
        // enemy 1
        var dragonblue = new Enemy(this, 50, 100, "blue-goo", null, "Blue Goo", 50, 3);
        this.add.existing(dragonblue);
        
        // enemy 2
        var dragonOrange = new Enemy(this, 150, 100, "orange-goo", null,"Orange Goo", 50, 3);
        this.add.existing(dragonOrange);
        
        // enemy 3
        var trashMimic = new Enemy(this, 250, 100, "trash-mimic", null,"Trash Mimic", 50, 3);
        this.add.existing(trashMimic);
      
        // array with heroes
        this.heroes = [ player1, player2, player3 ];
        // array with enemies
        this.enemies = [ dragonblue, dragonOrange, trashMimic];
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
                
                // shake and blink for damage fx
                this.cameras.main.shake(300);
                
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
 
    initialize: function Unit(scene, x, y, texture, frame, type, hp, damage) {
        Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame);
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage     
        this.living = true;         
        this.menuItem = null;
    },
    // we will use this to notify the menu item when the unit is dead
    setMenuItem: function(item) {
        this.menuItem = item;
    },
    // attack the target unit
    attack: function(target) {
        if(target.living) {
            target.takeDamage(this.damage);
            
            // build output text
            var battleMsg = this.type + " attacks! \n" + 
                            this.damage + " damage to " + target.type + "!";
            if (target.hp < 1)
            {
                battleMsg += "\n" + target.type + " was defeated!!";
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

var MenuItem = new Phaser.Class({
    Extends: Phaser.GameObjects.Text,
    
    initialize: function MenuItem(x, y, text, scene) {
        Phaser.GameObjects.Text.call(this, scene, x, y, text, 
            { color: "#ffffff", align: "left", fontSize: 12});
    },
    
    select: function() {
        //this.setColor("#f8ff38");
        this.setBackgroundColor('#ffffff');
        this.setColor('#000000');
    },
    
    deselect: function() {
        this.setBackgroundColor('#000000');
        this.setColor("#ffffff");
    },
    // when the associated enemy or player unit is killed
    unitKilled: function() {
        this.active = false;
        //this.setColor("#a81000");
        this.visible = false;
    }    
});

var Menu = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,
    
    initialize: function Menu(x, y, scene, heroes) {
        Phaser.GameObjects.Container.call(this, scene, x, y);
        this.menuItems = [];
        this.menuItemIndex = 0;
        //this.heroes = heroes; //TODO: do i need this here?
        this.x = x;
        this.y = y;
        this.selected = false;
    },     
    addMenuItem: function(unit) {
        var menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene);
        this.menuItems.push(menuItem);
        this.add(menuItem);    
        return menuItem;    
    },
    // menu navigation            
    moveSelectionUp: function() {
        this.menuItems[this.menuItemIndex].deselect();
        do {
            this.menuItemIndex--;
            if(this.menuItemIndex < 0)
                this.menuItemIndex = this.menuItems.length - 1;
        } while(!this.menuItems[this.menuItemIndex].active);
        this.menuItems[this.menuItemIndex].select();
    },
    moveSelectionDown: function() {
        this.menuItems[this.menuItemIndex].deselect();
        do {
            this.menuItemIndex++;
            if(this.menuItemIndex >= this.menuItems.length)
                this.menuItemIndex = 0;
        } while(!this.menuItems[this.menuItemIndex].active);
        this.menuItems[this.menuItemIndex].select();
    },
    // select the menu as a whole and an element with index from it
    select: function(index) {
        if(!index)
            index = 0;       
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = index;
        while(!this.menuItems[this.menuItemIndex].active) {
            this.menuItemIndex++;
            if(this.menuItemIndex >= this.menuItems.length)
                this.menuItemIndex = 0;
            if(this.menuItemIndex == index)
                return;
        }        
        this.menuItems[this.menuItemIndex].select();
        this.selected = true;
    },
    // deselect this menu
    deselect: function() {        
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = 0;
        this.selected = false;
    },
    confirm: function() {
        // wen the player confirms his slection, do the action
    },
    // clear menu and remove all menu items
    clear: function() {
        for(var i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i].destroy();
        }
        this.menuItems.length = 0;
        this.menuItemIndex = 0;
    },
    // recreate the menu items
    remap: function(units) {
        this.clear();        
        for(var i = 0; i < units.length; i++) {
            var unit = units[i];
            unit.setMenuItem(this.addMenuItem(unit.type));            
        }
        this.menuItemIndex = 0;
    }
});

var HeroesMenu = new Phaser.Class({
    Extends: Menu,
    
    initialize: function HeroesMenu(x, y, scene) {
        Menu.call(this, x, y, scene);                    
    }
});

var ActionsMenu = new Phaser.Class({
    Extends: Menu,
    
    initialize: function ActionsMenu(x, y, scene) {
        Menu.call(this, x, y, scene);   
        this.addMenuItem("Attack");
        this.addMenuItem("Run");
    },
    confirm: function() {      
        // we select an action and go to the next menu and
        // choose from the enemies to apply the action
        this.scene.events.emit("SelectedAction");    
    }
    
});

var EnemiesMenu = new Phaser.Class({
    Extends: Menu,
    
    initialize:
            
    function EnemiesMenu(x, y, scene) {
        Menu.call(this, x, y, scene);        
    },       
    confirm: function() {        
        // the player has selected the enemy and we send its id with the event
        this.scene.events.emit("Enemy", this.menuItemIndex);
    }
});
