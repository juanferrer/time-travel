/* eslint-disable no-global-assign */
/* globals Phaser, game, debug, gameControl, player, playerGhost */

/// <reference path="../typescript/phaser.d.ts" />
/// <reference path="../typescript/phaser-nineslice.d.ts" />

gameControl.MainGameScreen = function () {
    this.map;
    this.bgLayer;
    this.floorLayer;
    this.doors;
    this.stairsDoors;
    this.dialog;
    this.dialogText;
    this.tubeFilling;
    this.slowTube;
    this.stopTube;
    this.portalTube;

    this.tubeFillingMaxY = 200;

    this.trees = [];

    // Player animation info
    this.playerWalking;
    this.playerInAir;
    this.jumpFPS;
    this.walkFPS;

    // Controls
    this.cursors;
    this.jumpButton;
    this.backtrackButton;
    this.slowButton;
    this.stopButton;

    this.tileSize = 60;
    this.tilesX = 60;
    this.tilesY = 100;

    this.gameTime = 0;

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
        },
        backtrack1: {
            text: "Press A to set a backtrack point",
            counter: -1,
            completed: false
        },
        backtrack2: {
            text: "Press A again to travel to backtrack point",
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

    this.openDoor = function (player, door) {
        if (!door.isOpen && !door.isLocked) {
            door.animations.play("open");
            door.isOpen = true;
            //door.animations.play("open");
            setTimeout((door) => {
                door.animations.play("close");
                door.isOpen = false;
            }, 3000, door);
        }
    };

    this.openStairsDoor = function (player, door) {
        if (!door.isOpen && !door.isLocked) {
            door.animations.play("open");
            door.isOpen = true;
            //door.animations.play("open");
            setTimeout((door) => {
                door.animations.play("close");
                door.isOpen = false;
            }, 3000, door);
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
        }
        return lines;
    };

    /** Find next dialog that has not been displayed and prepare it for display */
    this.prepareNextDialog = function () {
        let dialogs = ["move", "jump", "slow", "stop", "backtrack1", "backtrack2"];
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
        //this.map.addTilesetImage("trees", "trees");
        this.map.addTilesetImage("walls", "walls");
        this.map.addTilesetImage("door", "doors");
        game.stage.backgroundColor = "#FFAC5B";
        this.bgLayer = this.map.createLayer("BG");
        this.floorLayer = this.map.createLayer("Floor");
        this.doors = game.add.group();
        this.doors.enableBody = true;
        this.map.createFromObjects("Doors", 13, "doors", 0, true, false, this.doors);

        this.doors.callAll("animations.add", "animations", "open", [0, 1, 2, 3, 4], 20);
        this.doors.callAll("animations.add", "animations", "close", [4, 3, 2, 1, 0], 20);

        this.stairsDoors = game.add.group();
        this.stairsDoors.enableBody = true;
        this.map.createFromObjects("StairsDoors", 19, "stairsDoors", 0, true, false, this.stairsDoors);

        this.stairsDoors.callAll("animations.add", "animations", "open", [0, 1, 2, 3, 4], 20);
        this.stairsDoors.callAll("animations.add", "animations", "close", [4, 3, 2, 1, 0], 20);

        this.world.resize(this.tileSize * this.tilesX, this.tileSize * this.tilesY);

        player = this.add.sprite(200, 5800, "player");
        player.anchor.setTo(0.5, 0);
        playerGhost = this.add.sprite(5, 700, "player");
        playerGhost.anchor.setTo(0.5, 0);
        playerGhost.alpha = 0.5;
        playerGhost.visible = false;

        this.dialog = this.add.nineSlice(0, 0, "dialog", null, 100, 70);
        this.dialog.visible = false;
        this.dialog.anchor.setTo(0, 1);

        this.dialogText = game.add.text(0, 0, "Some text to test", { font: "40px 'VT323'", fill: "#000000" });
        this.dialog.addChild(this.dialogText);
        player.addChild(this.dialog);
        this.dialogText.anchor.setTo(0, 0);
        this.dialogText.position.x = 10;

        this.tubeFilling = this.add.nineSlice(0, 0, "tubeFilling", null, 100, 70);
        this.tubeFilling.fixedToCamera = true;
        this.tubeFilling.resize(200, 60);
        this.tubeFilling.angle = -90;
        this.tubeFilling.cameraOffset = { x: 10, y: 210, type: 25 };
        this.tubeFilling.alpha = 0.7;

        this.slowTube = this.add.nineSlice(0, 0, "tube", null, 100, 70);
        this.slowTube.fixedToCamera = true;
        this.slowTube.resize(60, 200);
        this.slowTube.cameraOffset = { x: 10, y: 10, type: 25 };

        this.physics.enableGravity = false;

        this.walkFPS = 8;
        this.jumpFPS = 20;

        // Add animations
        player.animations.add("walk", [1, 2]);
        player.animations.add("jump", [3, 4, 5]);
        player.animations.add("inAir", [5]);
        player.animations.add("land", [5, 6, 7]);
        player.animations.add("disappear", [8, 9, 10, 11, 12]);

        player.events.onAnimationComplete.add(() => {
            // Check what animation was playing and play what should go next
            switch (player.animations.currentAnim.name) {
                case "jump":
                    player.animations.play("inAir", this.jumpFPS / this.time.slowMotion);
                    break;
                case "disappear":
                    player.frame = 0;
                    player.position.x = playerGhost.position.x;
                    player.position.y = playerGhost.position.y;
                    player.scale.x = playerGhost.scale.x;
                    this.hideDialog();
                    playerGhost.visible = false;
                    break;
            }
        });

        this.physics.enable(player, Phaser.Physics.ARCADE);
        this.camera.x = player.position.x;
        this.camera.y = player.position.y;
        this.camera.follow(player, null, 0.05, 0.05);

        player.body.collideWorldBounds = true;
        player.body.gravity.y = 2000;
        player.body.maxVelocity.y = 2000;
        this.dialog.body.allowGravity = false;
        this.dialog.position.y = -20;
        this.dialogText.body.allowGravity = false;
        this.doors.forEach((door) => {
            door.body.allowGravity = false;
            door.isOpen = false;
            door.isLocked = false;
        });

        this.stairsDoors.forEach((door) => {
            door.body.allowGravity = false;
            door.isOpen = false;
            door.isLocked = false;
        });

        player.body.setSize(60, 75);

        // Player cooldowns
        player.cd = 0;
        player.cdTime = 5;

        // Player ability timers
        player.slowTimer = 0;
        player.slowTime = 0.5;

        this.isTimeStopped = false;

        // Set controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.backtrackButton = this.input.keyboard.addKey(Phaser.Keyboard.A);
        this.slowButton = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.stopButton = this.input.keyboard.addKey(Phaser.Keyboard.S);

        // Prepare collisions
        this.map.setCollisionBetween(1, 999, true, "Floor");

        // Prepare for the start
        this.dialogs.move.counter = this.dialogs.nextStepCounterTime;
        player.animations.play("walk");
    },

    update: function () {
        // Increase time
        this.gameTime += this.time.physicsElapsed;

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

        // Update cooldown
        if (player.cd > 0) player.cd -= this.time.physicsElapsed;

        // Update tube fillings
        this.tubeFilling.resize(Math.max(200 * ((player.cdTime - player.cd) / player.cdTime), 30), 60);

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
        this.physics.arcade.overlap(player, this.doors, this.openDoor, null, this);
        player.body.velocity.x = 0;

        // Check input
        if (this.cursors.left.isDown || this.cursors.right.isDown) {
            // Prepare next dialog
            if (!this.dialogs.move.completed) {
                this.prepareNextDialog();
            }

            if (this.cursors.left.isDown) {
                player.body.velocity.x = -300;
                this.playerWalking = true;
                if (player.scale.x > 0) {
                    player.scale.x *= -1;
                    this.dialog.scale.x *= -1;
                }
            } else if (this.cursors.right.isDown) {
                player.body.velocity.x = 300;
                this.playerWalking = true;
                if (player.scale.x < 0) {
                    player.scale.x *= -1;
                    this.dialog.scale.x *= -1;
                }
            }
        }
        if (this.cursors.up.isDown || this.cursors.down.isDown) {
            // Check if we're near a stairs door before acting
            this.physics.arcade.overlap(player, this.stairsDoors, this.openStairsDoor, null, this);

            // Find the doors that are above and below this one
            this.stairsDoors.forEach(() => {

            });
        }

        if (this.jumpButton.isDown && (player.body.onFloor() || player.body.touching.down)) {
            // Prepare next dialog
            if (!this.dialogs.jump.completed) {
                this.prepareNextDialog();
            }

            player.body.velocity.y = -800;
            player.animations.play("jump", this.jumpFPS / this.time.slowMotion);
            this.playerInAir = true;
        }

        // Handle abilities
        if (this.backtrackButton.isDown) {
            if (!this.dialogs.backtrack1.completed) {
                this.prepareNextDialog();
            } else if (this.dialogs.backtrack1.completed && !this.dialogs.backtrack2.completed) {
                this.prepareNextDialog();
            }

            if (player.cd <= 0) {
                if (playerGhost.visible) {
                    // Send player to backtrack position
                    player.animations.play("disappear");
                    player.cd = player.cdTime;
                } else {
                    // Set backtrack point
                    playerGhost.position.x = player.position.x;
                    playerGhost.position.y = player.position.y;
                    playerGhost.scale.x = player.scale.x;
                    playerGhost.visible = true;
                    player.cd = player.cdTime / 10;
                }
            }
        } else {
            //
        }

        if (this.stopButton.isDown) {
            if (!this.dialogs.stop.completed) {
                this.prepareNextDialog();
            }
            if (player.cd <= 0) {
                player.cd = player.cdTime;
                player.stopTimer = player.stopTime;
                this.isTimeStopped = true;
                // Prepare next dialog
            }

        } else {
            this.isTimeStopped = false;
        }

        if (this.slowButton.isDown) {
            if (!this.dialogs.slow.completed) {
                this.prepareNextDialog();
            }
            // Player is pressing slow down
            // TODO: Slow down over time
            if (player.slowTimer <= 0 && player.cd <= 0) {
                player.cd = player.cdTime;
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
        if (player.animations.currentAnim.name !== "disappear" || !player.animations.currentAnim.isPlaying) {
            if (this.playerWalking && !this.playerInAir && (player.body.onFloor() || player.body.touching.down)) {
                player.animations.play("walk", this.walkFPS / this.time.slowMotion, true);
            } else {
                player.animations.stop("walk");
            }
        }
    }
};
