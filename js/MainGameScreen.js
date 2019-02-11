gameControl.MainGameScreen = function(game) {
};

gameControl.MainGameScreen.prototype = {	
    create: function () {
        debug.log("Main game screen");

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 100;

        this.add.tileSprite(0, 0, 2000, 600, "bg");
        this.world.resize(2000, 600);

        // Create assets on screen
        floor = this.add.sprite(50, 500, "floor");
        this.physics.enable(floor, Phaser.Physics.ARCADE);
        floor.body.immovable = true;
        floor.body.allowGravity = false;

        player = this.add.sprite(this.world.centerX, this.world.centerY, "player");
        this.physics.enable(player, Phaser.Physics.ARCADE);
        this.camera.follow(player, null, 0.05, 0.05);

        player.body.collideWorldBounds = true;
        player.body.gravity.y = 2000;
        player.body.maxVelocity.y = 2000;

        // Player cooldowns
        player.slowCD = 0;
        player.slowCDTime = 5;
        player.stopCD = 0;
        player.stopCDTime = 5;

        // Player ability timers
        player.slowTimer = 0;
        player.slowTime = 0.5;

        this.isTimeStopped = false;

        // Set animations
        player.animations.add("left", []);
        player.animations.add("turn", []);
        player.animations.add("right", []);

        // Set controls
        cursors = this.input.keyboard.createCursorKeys();
        jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        slowButton = this.input.keyboard.addKey(Phaser.Keyboard.D);
        stopButton = this.input.keyboard.addKey(Phaser.Keyboard.S);
    },	

    update: function () {
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
            this.physics.arcade.collide(player, floor, this.collisionHandler, null, this);
            player.body.velocity.x = 0;	
        
            // Check input
            if (cursors.left.isDown) {
                player.body.velocity.x = -300;
            } else if (cursors.right.isDown) {
                player.body.velocity.x = 300;
            } 
            
            if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down)) {
                player.body.velocity.y = -800;
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
    },

    collisionHandler: function () {
        debug.log("Collision");
    }
};