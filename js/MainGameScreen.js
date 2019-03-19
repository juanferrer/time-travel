gameControl.MainGameScreen = function(game) {
    this.map;
    this.bgLayer;
    this.floorLayer;
    this.platformLayer;
    this.dialog;
    this.dialogText;

    // Player animation info
    this.playerWalking;
    this.playerInAir;
    this.jumpFPS;
    this.walkFPS;

    this.tileSize = 60;
    this.tilesX = 100;
    this.tilesY = 15;


    this.collisionHandler = function() {
        if (this.playerInAir && (player.body.onFloor() || player.body.touching.down)) {
            this.playerInAir = false;
            player.animations.stop("inAir");
            player.animations.play("land", this.jumpFPS / this.time.slowMotion);
        }
    },

    this.showDialog = function(text) {
        this.dialog.resize((text.length * 16) + 20, 80);
        this.dialog.x = player.x;
        this.dialog.y = player.y - 80;
        this.dialog.visible = true;

        let numberOfLines = parseInt(text.length / 20);

        this.dialogText.text = text;
        this.dialogText.position.y = -numberOfLines * 30;
    },

    this.hideDialog = function() {
        this.dialog.visible = false;
    }
};

gameControl.MainGameScreen.prototype = {	
    create: function () {
        debug.log("Main game screen");

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 100;

        this.map = this.add.tilemap("level");
        this.map.addTilesetImage("tileset", "tiles");
        game.stage.backgroundColor = "#FFAC5B";
        this.bgLayer = this.map.createLayer("BG");
        this.floorLayer = this.map.createLayer("Floor");
        this.platformLayer = this.map.createLayer("Platforms");

        this.map.setCollisionBetween(2, 3, true, "Platforms");
        this.map.setCollisionBetween(1, 2, true, "Floor");

        this.world.resize(this.tileSize * this.tilesX, this.tileSize * this.tilesY);

        player = this.add.sprite(5, 700, "player");
        player.anchor.setTo(0.5, 0.5);

        this.dialog = this.add.nineSlice(player.x, player.y - 60, "dialog", null, 100, 70);
        this.dialog.visible = false;
        this.dialog.anchor.setTo(0, 0.5);
      
        this.dialogText = game.add.text(0, 0, "Some text to test", {font: "40px 'VT323'", fill: "#000000"});
        this.dialog.addChild(this.dialogText);
        this.dialogText.position.x = 10;

        /*let platformsNumber = 1;

        // Create assets on screen
        platforms = [];
        for (let i = 0; i < platformsNumber; ++i) {
            platforms.push(this.add.sprite(50, 500, "platform"));
            this.physics.enable(platform, Phaser.Physics.ARCADE);
            platforms[i].body.immovable = true;
            platforms[i].body.allow
        }*/

        this.physics.enableGravity = false;

        this.walkFPS = 8;
        this.jumpFPS = 20;

        // Add animations
        player.animations.add("walk", [1, 2]);
        player.animations.add("jump", [3, 4, 5]);
        player.animations.add("inAir", [5]);       
        player.animations.add("land", [5, 6, 7]);

        player.events.onAnimationComplete.add((that) => {
            // Check what animation was playing and play what should go next
            if (player.animations.currentAnim.name === "jump") {
                player.animations.play("inAir", this.jumpFPS / this.time.slowMotion);
            }
        }, this);

        this.physics.enable(player, Phaser.Physics.ARCADE);
        this.camera.follow(player, null, 0.05, 0.05);

        player.body.collideWorldBounds = true;
        player.body.gravity.y = 2000;
        player.body.maxVelocity.y = 2000;

        player.body.setSize(60, 75);

        // Player cooldowns
        player.slowCD = 0;
        player.slowCDTime = 5;
        player.stopCD = 0;
        player.stopCDTime = 5;

        // Player ability timers
        player.slowTimer = 0;
        player.slowTime = 0.5;

        this.isTimeStopped = false;

        // Set controls
        cursors = this.input.keyboard.createCursorKeys();
        jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        slowButton = this.input.keyboard.addKey(Phaser.Keyboard.D);
        stopButton = this.input.keyboard.addKey(Phaser.Keyboard.S);
    },	

    update: function () {
        // Reset bools
        this.playerWalking = false;    

        // Update cooldowns
        if (player.stopCD > 0) player.stopCD -= this.time.physicsElapsed;
        if (player.slowCD > 0) player.slowCD -= this.time.physicsElapsed;

        // Update timers
        if (player.slowTimer > 0) {
            player.slowTimer -= this.time.physicsElapsed;
            if (player.slowTimer <= 0) {
                this.time.desiredFps = 60;
                this.time.slowMotion = 1;
            }
        }

        if (player.stopTimer > 0) {
            player.stopTimer -= this.time.physicsElapsed;
            if (player.stopTimer <= 0) {
                this.isTimeStopped = false;
            }
        }

        // Physics
        //this.physics.arcade.collide(player, platform, this.collisionHandler, null, this);
        this.physics.arcade.collide(player, this.floorLayer, this.collisionHandler, null, this);
        this.physics.arcade.collide(player, this.platformLayer, this.collisionHandler, null, this);
        player.body.velocity.x = 0;	
    
        // Check input
        if (cursors.left.isDown) {
            player.body.velocity.x = -300;
            this.playerWalking = true;
            if (player.scale.x > 0) player.scale.x *= -1;
        } else if (cursors.right.isDown) {
            player.body.velocity.x = 300;
            this.playerWalking = true;
            if (player.scale.x < 0) player.scale.x *= -1;
        } 
        
        if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down)) {
            player.body.velocity.y = -600;
            player.animations.play("jump", this.jumpFPS / this.time.slowMotion);
            this.playerInAir = true;
        }

        // Handle abilities
        if (stopButton.isDown) {
            if  (player.stopCD <= 0) {
                player.stopCD = player.stopCDTime;
                player.stopTimer = player.stopTime;
                this.isTimeStopped = true;
            }
        } else {
            this.isTimeStopped = false;
        }

        if (slowButton.isDown) {
            // Player is pressing slow down
            // TODO: Slow down over time
            if (player.slowTimer <= 0 && player.slowCD <= 0) {
                player.slowCD = player.slowCDTime;
                player.slowTimer = player.slowTime;
                this.time.slowMotion = 3.0;
                this.time.desiredFps = 180;
            }
        } else {
            player.slowTimer = 0;
            this.time.slowMotion = 1.0;
            this.time.desiredFps = 60;
        }

        // Debug
        if (game.input.keyboard.isDown(Phaser.Keyboard.P)) {
            this.showDialog("This is a test");
        }

        // Play animations 
        if (this.playerWalking && !this.playerInAir && (player.body.onFloor() || player.body.touching.down)) {
            player.animations.play("walk", this.walkFPS / this.time.slowMotion, true);
        } else {
            player.animations.stop("walk");
        }
    }
};