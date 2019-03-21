/* eslint-disable no-global-assign */
/* globals cursors, jumpButton, slowButton, stopButton, Phaser, game, debug, gameControl, player */

gameControl.MainGameScreen = function (game) {
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

    this.dialogs = {
        nextStepCounterTime: 3,
        move: {
            text: "Use Left Arrow and Right Arrow to move",
            counter: -1,
            completed: false
        },
        jump: {
            text: "Press Space to jump",
            counter: -1,
            completed: false
        },
        slow: {
            text: "Press D to slow down time",
            counter: -1,
            completed: false
        },
        stop: {
            text: "Press S to stop time",
            counter: -1,
            completed: false
        }
    };

    /** Handle collision of player with objects */
    this.collisionHandler = function () {
        if (this.playerInAir && (player.body.onFloor() || player.body.touching.down)) {
            this.playerInAir = false;
            player.animations.stop("inAir");
            player.animations.play("land", this.jumpFPS / this.time.slowMotion);
        }
    };

    /**
     * Split a text into an array of lines of a specified length
     * @param {string} text
     * @param {number} lineLength
     * @returns {string[]}
     */
    this.splitIntoLines = function (text, lineLength) {
        let words = text.split(" ");
        let lines = [""];
        let lineIndex = 0;

        for (let i = 0; i < words.length; ++i) {
            let word = words[i];
            lines[lineIndex] += word;
            if (lines[lineIndex].length > lineLength) {
                ++lineIndex;
                if (i < words.length - 1) {
                    lines[lineIndex] = "";
                }
            } else {
                lines[lineIndex] += " ";
            }
        };
        return lines;
    };

    /** Find next dialog that has not been displayed and prepare it for display */
    this.prepareNextDialog = function () {
        let dialogs = ["move", "jump", "slow", "stop"];
        for (let i = 0; i < dialogs.length; ++i) {
            if (!this.dialogs[dialogs[i]].completed) {
                this.hideDialog();
                this.dialogs[dialogs[i]].completed = true;
                if (i < dialogs.length - 1) {
                    this.dialogs[dialogs[i + 1]].counter = this.dialogs.nextStepCounterTime;
                }
                return;
            }
        }
    };

    /**
     * Show the dialog with the specified text
     * @param {string} text
     */
    this.showDialog = function (text) {
        let lineSize = 15;
        let lines = this.splitIntoLines(text, lineSize);
        let finalLineLength = lines.reduce((a, b) => { return a.length > b.length ? a : b; }).length;
        text = lines.join("\n");

        this.dialog.resize((finalLineLength * 16) + 20, (lines.length * 50) + 20);
        this.dialog.visible = true;

        this.dialogText.text = text;
        this.dialogText.position.y = (-53 * lines.length) - 8;
    };

    /** Hide the dialog */
    this.hideDialog = function () {
        this.dialog.visible = false;
    };
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

        this.dialog = this.add.nineSlice(0, 0, "dialog", null, 100, 70);
        this.dialog.visible = false;
        this.dialog.anchor.setTo(0, 1);

        this.dialogText = game.add.text(0, 0, "Some text to test", { font: "40px 'VT323'", fill: "#000000" });
        this.dialog.addChild(this.dialogText);
        player.addChild(this.dialog);
        this.dialogText.anchor.setTo(0, 0);
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

        player.events.onAnimationComplete.add(() => {
            // Check what animation was playing and play what should go next
            if (player.animations.currentAnim.name === "jump") {
                player.animations.play("inAir", this.jumpFPS / this.time.slowMotion);
            }
        });

        this.physics.enable(player, Phaser.Physics.ARCADE);
        this.camera.follow(player, null, 0.05, 0.05);

        player.body.collideWorldBounds = true;
        player.body.gravity.y = 2000;
        player.body.maxVelocity.y = 2000;
        this.dialog.body.allowGravity = false;
        this.dialog.position.y = -20;
        this.dialogText.body.allowGravity = false;

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

        // Prepare for the start
        this.dialogs.move.counter = this.dialogs.nextStepCounterTime;
    },

    update: function () {
        // Reset bools
        this.playerWalking = false;

        // Update dialog counters
        for (let key in this.dialogs) {
            if (this.dialogs[key].counter > 0) {
                let object = this.dialogs[key];
                object.counter -= this.time.physicsElapsed;
                if (object.counter < 0) {
                    this.showDialog(object.text);
                    object.counter = -1;
                }
            }
        }

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
        if (cursors.left.isDown || cursors.right.isDown) {
            // Prepare next dialog
            if (!this.dialogs.move.completed) {
                this.prepareNextDialog();
            }

            if (cursors.left.isDown) {
                player.body.velocity.x = -300;
                this.playerWalking = true;
                if (player.scale.x > 0) {
                    player.scale.x *= -1;
                    this.dialog.scale.x *= -1;
                }
            } else if (cursors.right.isDown) {
                player.body.velocity.x = 300;
                this.playerWalking = true;
                if (player.scale.x < 0) {
                    player.scale.x *= -1;
                    this.dialog.scale.x *= -1;
                }
            }
        }

        if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down)) {
            // Prepare next dialog
            if (!this.dialogs.jump.completed) {
                this.prepareNextDialog();
            }

            player.body.velocity.y = -600;
            player.animations.play("jump", this.jumpFPS / this.time.slowMotion);
            this.playerInAir = true;
        }

        // Handle abilities
        if (stopButton.isDown) {
            if (!this.dialogs.stop.completed) {
                this.prepareNextDialog();
            }
            if (player.stopCD <= 0) {
                player.stopCD = player.stopCDTime;
                player.stopTimer = player.stopTime;
                this.isTimeStopped = true;
                // Prepare next dialog
            }

        } else {
            this.isTimeStopped = false;
        }

        if (slowButton.isDown) {
            if (!this.dialogs.slow.completed) {
                this.prepareNextDialog();
            }
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
