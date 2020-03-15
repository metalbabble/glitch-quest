var UIScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function UIScene ()
    {
        Phaser.Scene.call(this, { key: "UIScene" });
    },

    create: function ()
    {    
        console.log("Starting battle UI");
                
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
        
        //this.remapHeroes();
        //this.remapEnemies();
        
       // listen for keyboard events
       this.input.keyboard.on("keydown", this.onKeyInput, this);   
        
       // when its player unit turn to move
       this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);
       
       // when the action on the menu is selected
       // for now we have only one action so we dont send and action id
       this.events.on("SelectedAction", this.onSelectedAction, this);
       
       // an enemy is selected
       this.events.on("Enemy", this.onEnemy, this);

        // when the scene receives wake event
        this.sys.events.on('wake', this.createMenu, this);
        
        // message describing current action
        this.message = new Message(this, this.battleScene.events);
        this.add.existing(this.message);        
        
        this.createMenu();           
    },
    createMenu: function() {
        // map hero menu items to heroes
        this.remapHeroes();
        // map enemies menu items to enemies
        this.remapEnemies();
        // first move
        this.battleScene.nextTurn(); 
    },
    onEnemy: function(index) {
        // when the enemy is selected, deselect all menus and send event with the enemy id
        this.heroesMenu.deselect();
        this.actionsMenu.deselect();
        this.enemiesMenu.deselect();
        this.currentMenu = null;
        this.battleScene.receivePlayerSelection("attack", index);   
    },
    onPlayerSelect: function(id) {
        // when its player turn, select the active hero item and the first action
        // then we make actions menu active
        this.heroesMenu.select(id);
        this.actionsMenu.select(0);
        this.currentMenu = this.actionsMenu;
    },
    // we have action selected and we make the enemies menu active
    // the player needs to choose an enemy to attack
    onSelectedAction: function() {
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
        if(this.currentMenu && this.currentMenu.selected) {
            if(event.code === "ArrowUp") {
                this.currentMenu.moveSelectionUp();
            }
            else if(event.code === "ArrowDown") {
                this.currentMenu.moveSelectionDown();
            }
            else if(event.code === "ArrowRight" || event.code === "Shift") {

            }
            else if(event.code === "Space" || event.code === "Enter") {
                this.currentMenu.confirm();
            } 
        }
    },
});

// Message object used for displaying battle event text
var Message = new Phaser.Class({

    Extends: Phaser.GameObjects.Container,

    initialize: function Message(scene, events) {
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