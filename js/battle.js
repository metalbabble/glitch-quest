/*var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function BootScene ()
    {
        Phaser.Scene.call(this, { key: "BootScene" });
    },

    preload: function ()
    {
        // load resources
        this.load.spritesheet("player", "assets/chara.png", { frameWidth: 16, frameHeight: 16 });
        
        this.load.image("blue-goo", "assets/monsters/blue-goo.png");
        this.load.image("orange-goo", "assets/monsters/orange-goo.png");
        this.load.image("trash-mimic", "assets/monsters/trash-mimic.png");
    },

    create: function ()
    {
        this.scene.start("BattleScene");
    }
});*/

var BattleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function BattleScene ()
    {
        Phaser.Scene.call(this, { key: "BattleScene" });        
    }, 
    create: function ()
    {
        // change the background to green
        //this.cameras.main.setBackgroundColor("rgba(0, 200, 0, 0.5)");
        //this.cameras.main.setBackgroundColor("#004058");
        this.cameras.main.setBackgroundColor("#503000");
        
        // player 1
        var player1 = new PlayerCharacter(this, 550, -100, "player", 1, "Player", 100, 20);        
        this.add.existing(player1);
        
        // player 2
        var player2 = new PlayerCharacter(this, 550, -100, "player", 4, "Player 2", 80, 8);
        this.add.existing(player2);            

        // player 3
        var player3 = new PlayerCharacter(this, 550, -100, "player", 4, "Player 3", 80, 8);
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
        
        // Run UI Scene at the same time
        this.scene.launch("UIScene");

        this.index = -1;                
    },
    nextTurn: function() {        
        this.index++;
        // if there are no more units, we start again from the first one
        if(this.index >= this.units.length) {
            this.index = 0;
        }
        if(this.units[this.index]) {
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
        }
    },
    // when the player have selected the enemy to be attacked
    receivePlayerSelection: function(action, target) {
        if(action == "attack") {            
            this.units[this.index].attack(this.enemies[target]);              
        }
        // minor delay before next player input
        this.time.addEvent({ delay: 2000, callback: this.nextTurn, callbackScope: this });        
    }
});

// base class for heroes and enemies
var Unit = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,

    initialize: function Unit(scene, x, y, texture, frame, type, hp, damage) {
        Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage                
    },
    attack: function(target) {
        target.takeDamage(this.damage);
        this.scene.events.emit("Message", this.type + " attacks! \n" + this.damage + " damage to " + target.type + "!");
    },
    takeDamage: function(damage) {
        this.hp -= damage;
        if(this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
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
        // flip the image so I don"t have to edit it manually
        this.flipX = true;
        
        this.setScale(2);
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
    }
    
});

var Menu = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,
    
    initialize: function Menu(x, y, scene, heroes) {
        Phaser.GameObjects.Container.call(this, scene, x, y);
        this.menuItems = [];
        this.menuItemIndex = 0;
        this.heroes = heroes;
        this.x = x;
        this.y = y;
    },     
    addMenuItem: function(unit) {
        var menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene);
        this.menuItems.push(menuItem);
        this.add(menuItem);        
    },            
    moveSelectionUp: function() {
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex--;
        if(this.menuItemIndex < 0)
            this.menuItemIndex = this.menuItems.length - 1;
        this.menuItems[this.menuItemIndex].select();
    },
    moveSelectionDown: function() {
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex++;
        if(this.menuItemIndex >= this.menuItems.length)
            this.menuItemIndex = 0;
        this.menuItems[this.menuItemIndex].select();
    },
    // select the menu as a whole and an element with index from it
    select: function(index) {
        if(!index)
            index = 0;
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = index;
        this.menuItems[this.menuItemIndex].select();
    },
    // deselect this menu
    deselect: function() {        
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = 0;
    },
    confirm: function() {
        // wen the player confirms his slection, do the action
    },
    clear: function() {
        for(var i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i].destroy();
        }
        this.menuItems.length = 0;
        this.menuItemIndex = 0;
    },
    remap: function(units) {
        this.clear();        
        for(var i = 0; i < units.length; i++) {
            var unit = units[i];
            this.addMenuItem(unit.type);
        }
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
        this.scene.events.emit("SelectEnemies");        
    }
    
});

var EnemiesMenu = new Phaser.Class({
    Extends: Menu,
    
    initialize:
            
    function EnemiesMenu(x, y, scene) {
        Menu.call(this, x, y, scene);        
    },       
    confirm: function() {        
        this.scene.events.emit("Enemy", this.menuItemIndex);
    }
});

var UIScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function UIScene ()
    {
        Phaser.Scene.call(this, { key: "UIScene" });
    },

    create: function ()
    {    
        // layout the battle windows
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(4, 0xffffff);
        this.graphics.fillStyle(0x000000, 1);        //alternate gray: 0x787878

        // command menu (lower)
        this.graphics.strokeRect(4, 150, 90, 60);
        this.graphics.fillRect(4, 150, 90, 60);

        // enemy list (lower)
        this.graphics.strokeRect(102, 150, 210, 85);
        this.graphics.fillRect(102, 150, 210, 85);

        // player stats (top)
        this.graphics.strokeRect(4, 4, 310, 60);
        this.graphics.fillRect(4, 4, 310, 60);
        
        // basic container to hold all menus
        this.menus = this.add.container();
        
        // position the menus
        this.heroesMenu = new HeroesMenu(6, 6, this);           
        this.actionsMenu = new ActionsMenu(6, 153, this);            
        this.enemiesMenu = new EnemiesMenu(104, 153, this);   
        
        // the currently selected menu 
        this.currentMenu = this.actionsMenu;
        
        // add menus to the container
        this.menus.add(this.heroesMenu);
        this.menus.add(this.actionsMenu);
        this.menus.add(this.enemiesMenu);
        
        this.battleScene = this.scene.get("BattleScene");
        
        this.remapHeroes();
        this.remapEnemies();
        
        this.input.keyboard.on("keydown", this.onKeyInput, this);   
        
        this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);
        
        this.events.on("SelectEnemies", this.onSelectEnemies, this);
        
        this.events.on("Enemy", this.onEnemy, this);
        
        this.message = new Message(this, this.battleScene.events);
        this.add.existing(this.message);        
        
        this.battleScene.nextTurn();                
    },
    onEnemy: function(index) {
        this.heroesMenu.deselect();
        this.actionsMenu.deselect();
        this.enemiesMenu.deselect();
        this.currentMenu = null;
        this.battleScene.receivePlayerSelection("attack", index);
    },
    onPlayerSelect: function(id) {
        this.heroesMenu.select(id);
        this.actionsMenu.select(0);
        this.currentMenu = this.actionsMenu;
    },
    onSelectEnemies: function() {
        this.currentMenu = this.enemiesMenu;
        this.enemiesMenu.select(0);
    },
    remapHeroes: function() {
        var heroes = this.battleScene.heroes;
        this.heroesMenu.remap(heroes);
    },
    remapEnemies: function() {
        var enemies = this.battleScene.enemies;
        this.enemiesMenu.remap(enemies);
    },
    onKeyInput: function(event) {
        if(this.currentMenu) {
            if(event.code === "ArrowUp") {
                this.currentMenu.moveSelectionUp();
            } else if(event.code === "ArrowDown") {
                this.currentMenu.moveSelectionDown();
            } else if(event.code === "ArrowRight" || event.code === "Shift") {

            } else if(event.code === "Space" || event.code === "Enter") {
                this.currentMenu.confirm();
            } 
        }
    },
});

// Message object used for displaying battle event text
var Message = new Phaser.Class({

    Extends: Phaser.GameObjects.Container,

    initialize:
    function Message(scene, events) {
        Phaser.GameObjects.Container.call(this, scene, 160, 30);
        var graphics = this.scene.add.graphics();
        this.add(graphics);
        
        //graphics.lineStyle(1, 0xffffff, 0.8);
        //graphics.fillStyle(0x031f4c, 0.3);   
        //this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: "#ffffff", align: "center", fontSize: 12, wordWrap: { width: 160, useAdvancedWrap: true }});

        //TODO: why do i need negative numbers to offset this box??

        graphics.lineStyle(4, 0xffffff, 1);
        graphics.fillStyle(0x000000, 1);        
        graphics.strokeRect(-156, 115, 310, 90);
        graphics.fillRect(-156, 115, 310, 90);
        this.text = new Phaser.GameObjects.Text(scene, -154, 120, "", 
            { color: "#ffffff", fontSize: 12, wordWrap: { width: 160, useAdvancedWrap: true }
        });
        this.add(this.text);
        //this.text.setOrigin(0.5);        
        events.on("Message", this.showMessage, this);
        this.visible = false;
    },
    showMessage: function(text) {
        this.text.setText(text);
        this.visible = true;
        if(this.hideEvent)
            this.hideEvent.remove(false);
        this.hideEvent = this.scene.time.addEvent(
            { delay: 2000, 
                callback: this.hideMessage, 
                callbackScope: this 
            });
    },
    hideMessage: function() {
        this.hideEvent = null;
        this.visible = false;
    }
});
/*
var config = {
    type: Phaser.AUTO,
    parent: "content",
    width: 320,
    height: 240,
    zoom: 3,
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [ BootScene, BattleScene, UIScene ]
};

var game = new Phaser.Game(config);*/