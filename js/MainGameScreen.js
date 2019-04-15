/* eslint-disable no-global-assign */
/* globals Phaser, debug, gameControl, player, playerGhost, score, playerName, $, game, hatIndex*/

/// <reference path="../typescript/phaser.d.ts" />
/// <reference path="../typescript/phaser-nineslice.d.ts" />

gameControl.MainGameScreen = function () {
    this.map;
    this.bgLayer;
    this.floorLayer;
    this.wallLayer;
    this.doors;
    this.stairsDoors;
    this.lockedStairsDoors;
    this.dialog;
    this.dialogText;
    this.tubeFilling;
    this.slowTube;
    this.stopTube;
    this.portalTube;
    this.stopwatches;
    this.timeRift;
    this.keys;
    this.enemy1Group;
    this.enemy2Group;
    this.tubeFillingMaxY = 200;
    this.hat;
    this.hatGhost;

    // Player
    this.playerMoveSpeed = 300;

    // Score
    this.scoreSubmission;
    this.scoreLeft;
    this.scoreRight;
    this.scoreUp;
    this.scoreDown;
    this.chars = [];
    this.letters = ["A", "A", "A"];

    // Animation
    this.playerWalking;
    this.playerInAir;
    this.jumpFPS;
    this.walkFPS;
    this.doorFPS;

    // Sounds
    this.openDoorSound;
    this.closeDoorSound;
    this.woodStepSound;
    this.woodStepSlowSound;
    this.stepWaitTime = 0.1666666;
    this.stepTimer = this.stepWaitTime + 1; // Make it greater then stepWaitTime so that is starts immediately

    // Enemies
    this.enemyWaitTime = 1000;
    this.enemyMoveSpeed = 200;
    this.enemyChaseSpeed = 400;
    this.enemySightDistance = 500;
    this.line;

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
            this.playSound("step");
        }
    };

    /**
     * Collision handler for player with door
     * @param {Phaser.Sprite} player
     * @param {Phaser.Sprite} door
     */
    this.openDoor = function (player, door) {
        if (!door.isOpen && !door.isLocked) {
            door.animations.play("open", this.doorFPS / this.time.slowMotion);
            this.playSound("openDoor");
            door.isOpen = true;
            setTimeout((door) => {
                door.animations.play("close", this.doorFPS / this.time.slowMotion);
                this.playSound("closeDoor");
                door.isOpen = false;
            }, 3000, door);
        }
    };

    /**
     * Animation for player with stairs door
     * @param {Phaser.Sprite} player
     * @param {Phaser.Sprite} door
     */
    this.openStairsDoor = function (player, door) {
        door.animations.play("open", this.doorFPS / this.time.slowMotion);
        this.playSound("openDoor");
        door.isOpen = true;
        setTimeout((door) => {
            door.animations.play("close", this.doorFPS / this.time.slowMotion);
            this.playSound("closeDoor");
            door.isOpen = false;
        }, 3000, door);
    };

    /**
     * Go through stairs animation
     * @param {Function} callback
     * @param {Number} timer
     */
    this.playerGoThroughStairs = function (callback, timer = 1000) {
        player.renderable = false;
        setTimeout(() => {
            player.renderable = true;
            if (callback) callback();
        }, timer);
    };

    /**
     * Collision handler for player with stairs door
     * @param {Phaser.Sprite} player
     * @param {Phaser.Sprite} door
     */
    this.goThroughStairsDoor = function (player, door) {
        if (door.isLocked) {

            if (player.keyCount === 0) {
                // Door is locked and have no keys
                this.showDialog("The door is locked... I should look around");
                setTimeout(() => { this.hideDialog(); }, 2000);
                return;
            } else {
                player.keyCount--;
                door.isLocked = false;
            }
        }

        if (!door.isOpen) {
            this.openStairsDoor(player, door);
        }

        // Find the doors that are above and below this one
        let doors = (this.stairsDoors.children).concat(this.lockedStairsDoors.children);
        let doorAbove, doorBelow;
        for (let i = 0; i < doors.length; ++i) {
            if (doors[i].position.x === door.position.x && doors[i].position.y !== door.position.y) {
                // A door that is in the same X as this door, but is not this one
                if (doors[i].position.y < door.position.y) {
                    // Door is above current door
                    if (doorAbove && doorAbove.position) {
                        if (doors[i].position.y > doorAbove.position.y) {
                            doorAbove = doors[i];
                        }
                    } else {
                        doorAbove = doors[i];
                    }
                } else if (doors[i].position.y > door.position.y) {
                    // Door is below current door
                    if (doorBelow && doorBelow.position) {
                        if (doors[i].position.y < doorBelow.position.y) {
                            doorBelow = doors[i];
                        }
                    } else {
                        doorBelow = doors[i];
                    }
                }
            }
        }

        if (this.cursors.up.isDown && doorAbove) {
            if (doorAbove.isLocked && player.keyCount === 0) {
                // The other door is locked and have no keys
                this.playerGoThroughStairs(() => {
                    this.showDialog("The other door is locked... I should look around");
                    setTimeout(() => { this.hideDialog(); }, 2000);
                });
                return;
            } else {
                if (doorAbove.isLocked && player.keyCount > 0) {
                    player.keyCount--;
                    doorAbove.isLocked = false;
                }
                this.playerGoThroughStairs(() => {
                    player.position.x = doorAbove.position.x + doorAbove.width / 2;
                    player.position.y = doorAbove.position.y + doorAbove.height / 2;
                    this.openStairsDoor(player, doorAbove);
                });
            }
        } else if (this.cursors.down.isDown && doorBelow) {
            if (doorBelow.isLocked && player.keyCount === 0) {
                // The other door is locked and have no keys
                this.playerGoThroughStairs(() => {
                    this.showDialog("The other door is locked... I should look around");
                    setTimeout(() => { this.hideDialog(); }, 2000);
                });
                if (doorBelow.isLocked && player.keyCount > 0) {
                    player.keyCount--;
                    doorBelow.isLocked = false;
                }
                return;
            } else {
                this.playerGoThroughStairs(() => {

                    player.position.x = doorBelow.position.x + doorBelow.width / 2;
                    player.position.y = doorBelow.position.y + doorBelow.height / 2;
                    this.openStairsDoor(player, doorBelow);
                });
            }
        } else {
            // Do nothing, player stays in this floor
        }

    };

    /**
     * Remove key and add to player's inventory
     * @param {Phaser.Sprite} player
     * @param {Phaser.Sprite} key
     */
    this.grabKey = function (player, key) {
        player.keyCount++;
        key.kill();
    };

    /**
     * Remove stopwatch and add to player inventory
     * @param {Phaser.Sprite} player
     * @param {Phaser.Sprite} stopwatch
     */
    this.grabStopwatch = function (player, stopwatch) {
        player.hasStopwatch = true;
        stopwatch.kill();
        // Add the stopwatch to the UI, so that the player knows
        // they got it
        let sprite = this.add.sprite(30, game.canvas.height - 30 - 95, "stopwatch");
        sprite.fixedToCamera = true;
        sprite.alpha = 0.7;
    };

    /**
     * Show final animation and input for score
     * @param {Phaser.Sprite} player
     * @param {Phaser.Sprite} timeRift
     */
    this.enterTimeRift = function (player, timeRift) { // eslint-disable-line no-unused-vars
        // Disable gravity
        this.physics.arcade.isPaused = true;
        // TODO: Show end animation

        // Name input
        this.enterScoreSubmission();
    };

    /**
     * Move the arros on top of the letter in the direction specified
     * @param {string} direction
     */
    this.moveLetterSelector = function (direction) {
        const letterSize = 50;
        const center = (game.canvas.width) / 2;
        let letterIndex = (this.scoreUp.position.x + letterSize - center) / letterSize;
        let charIndex = 0;
        const letterStream = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";

        switch (direction.toUpperCase()) {
            case "LEFT":
                this.scoreUp.position.x = this.scoreDown.position.x -= letterSize;
                if (this.scoreUp.position.x < center - letterSize) {
                    this.scoreUp.position.x = this.scoreDown.position.x = center + letterSize;
                }
                break;
            case "RIGHT":
                this.scoreUp.position.x = this.scoreDown.position.x += letterSize;
                if (this.scoreUp.position.x > center + letterSize) {
                    this.scoreUp.position.x = this.scoreDown.position.x = center - letterSize;
                }
                break;
            case "UP":
                charIndex = letterStream.indexOf(this.letters[letterIndex]) - 1;
                if (charIndex < 0) charIndex = letterStream.length - 1;
                this.letters[letterIndex] = letterStream[charIndex];
                this.chars[letterIndex].setText(this.letters[letterIndex]);
                break;
            case "DOWN":
                charIndex = letterStream.indexOf(this.letters[letterIndex]) + 1;
                if (charIndex >= letterStream.length) charIndex = 0;
                this.letters[letterIndex] = letterStream[charIndex];
                this.chars[letterIndex].setText(this.letters[letterIndex]);
                break;
            default:
                // Do nothing
                break;
        }
    };

    /** Enter score submission state */
    this.enterScoreSubmission = function () {
        this.physics.arcade.isPaused = true;

        // Modify input

        // Show input area
        let graphics = this.add.graphics();
        graphics.beginFill(0x000000, 0.7);
        this.scoreSubmission = graphics.drawRect((game.canvas.width - 500) / 2, (game.canvas.height - 500) / 2, 500, 500);
        graphics.endFill();
        this.scoreSubmission.fixedToCamera = true;

        let centerX = (game.canvas.width) / 2;
        let centerY = (game.canvas.height) / 2;

        // Add arrows and spaces
        this.scoreLeft = this.add.sprite(centerX - 100, centerY, "arrow");
        this.scoreLeft.anchor.setTo(0.5, 0.5);
        this.scoreLeft.angle -= 90;

        this.scoreRight = this.add.sprite(centerX + 100, centerY, "arrow");
        this.scoreRight.anchor.setTo(0.5, 0.5);
        this.scoreRight.angle += 90;

        this.scoreUp = this.add.sprite(centerX, centerY - 50, "arrow");
        this.scoreUp.anchor.setTo(0.5, 0.5);

        this.scoreDown = this.add.sprite(centerX, centerY + 50, "arrow");
        this.scoreDown.anchor.setTo(0.5, 0.5);
        this.scoreDown.angle -= 180;

        this.scoreSubmission.addChild(this.scoreLeft);
        this.scoreSubmission.addChild(this.scoreRight);
        this.scoreSubmission.addChild(this.scoreUp);
        this.scoreSubmission.addChild(this.scoreDown);

        let textStyle = { font: "40px 'VT323'", fill: "#ffffff" };
        this.chars[0] = this.add.text(centerX - 50, centerY, this.letters[0], textStyle);
        this.chars[1] = this.add.text(centerX, centerY, this.letters[1], textStyle);
        this.chars[2] = this.add.text(centerX + 50, centerY, this.letters[2], textStyle);

        this.chars[0].anchor.setTo(0.5, 0.5);
        this.chars[1].anchor.setTo(0.5, 0.5);
        this.chars[2].anchor.setTo(0.5, 0.5);

        this.scoreSubmission.addChild(this.chars[0]);
        this.scoreSubmission.addChild(this.chars[1]);
        this.scoreSubmission.addChild(this.chars[2]);

        this.submitButton = this.add.nineSlice(centerX, centerY + 150, "button", null, 200, 70);
        this.submitButton.inputEnabled = true;
        this.submitButton.events.onInputDown.addOnce(() => { this.endGame(); }, this);
        this.submitButton.events.onInputOver.add(() => { this.submitButton.resize(204, 74); }, this);
        this.submitButton.events.onInputOut.add(() => { this.submitButton.resize(200, 70); }, this);
        this.submitButton.anchor.setTo(0.5, 0.5);

        this.submitText = this.add.text(0, 0, "Submit", { font: "40px 'VT323'", fill: "#000000" });
        this.submitButton.addChild(this.submitText);
        this.submitText.anchor.setTo(0.5, 0.5);

        this.scoreSubmission.addChild(this.submitButton);
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

    /** Trigger the end of the game, calculate score and go to end screen */
    this.endGame = function () {
        // Calculate players's score (Score time - gameTime in ms) + 5000 if extra achieved
        score = 100000 - (this.gameTime * 1000);
        if (player.hasStopwatch) {
            score += 5000;
        }

        playerName = this.letters.join("");
        // Send player's score
        $.ajax("https://vesta.uclan.ac.uk/~jeferrer-cortez/php/highscores.php", {
            type: "POST",
            data: { type: "SUBMIT_SCORE", name: playerName, score: score },
            error: (request, status, error) => {
                debug.log("Request: " + request);
                debug.log("Status: " + status);
                debug.log("Error: " + error);
            },
            success: (data/*, status, request*/) => {
                debug.log(data);
                this.state.start("GameOverScreen");
            }
        });
    };

    /**
     * General function for playing sounds
     * @param {string} type
     */
    this.playSound = function (type/*, position*/) {
        if (this.time.slowMotion > 1) {
            switch (type) {
                case "step":
                    this.woodStepSlowSound.play();
                    break;
                case "openDoor":
                    // TODO
                    break;
            }
        } else {
            switch (type) {
                case "step":
                    this.woodStepSound.play();
                    break;
                case "openDoor":
                    this.openDoorSound.play();
                    break;
                case "closeDoor":
                    this.closeDoorSound.play();
                    break;
            }
        }
    };

    /**
     * Collision handler for enemy and a door or wall
     * @param {Phaser.Sprite} enemy
     * @param {Phaser.Sprite} boundaryObject
     */
    this.enemyReachedEndOfRoute = function (enemy, boundaryObject) { // eslint-disable-line no-unused-vars
        if (Math.abs(enemy.lastBoundaryPos - enemy.position.x) > 50) {
            // Stop where you are
            enemy.isWalking = false;
            enemy.lastBoundaryPos = enemy.position.x;
            enemy.animations.stop("walk");

            setTimeout(this.enemyContinuePatrol, this.enemyWaitTime, enemy);
        }
    };

    /**
     * Enemy has stopped. Now should turn around and continue patrol
     * @param {Phaser.Sprite} enemy
     */
    this.enemyContinuePatrol = function (enemy) {
        // Turn around
        enemy.scale.x *= -1;
        // Start moving again
        enemy.isWalking = true;
    };

    this.killPlayer = function () {
        this.state.start("GameOverScreen");
    };
};

gameControl.MainGameScreen.prototype = {
    create: function () {
        debug.log("Main game screen");

        this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
        score = 0;
        if (playerName) {
            this.letters = playerName.split();
        }

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 100;

        // Create all layers
        this.map = this.add.tilemap("level");
        //this.map.addTilesetImage("trees", "trees");
        this.map.addTilesetImage("walls", "walls");
        this.map.addTilesetImage("wallpaper", "wallpaper", 120, 120);
        this.map.addTilesetImage("door", "doors");
        this.stage.backgroundColor = "#444444";
        this.bgLayer = this.map.createLayer("BG");
        this.floorLayer = this.map.createLayer("Floor");
        this.wallLayer = this.map.createLayer("Walls");
        this.doors = this.add.group();
        this.doors.enableBody = true;
        this.map.createFromObjects("Doors", 10, "doors", 0, true, false, this.doors);

        this.doors.callAll("animations.add", "animations", "open", [0, 1, 2, 3, 4]);
        this.doors.callAll("animations.add", "animations", "close", [4, 3, 2, 1, 0]);

        this.stairsDoors = this.add.group();
        this.stairsDoors.enableBody = true;
        this.map.createFromObjects("StairsDoors", 16, "stairsDoors", 0, true, false, this.stairsDoors);

        this.stairsDoors.callAll("animations.add", "animations", "open", [0, 1, 2, 3, 4]);
        this.stairsDoors.callAll("animations.add", "animations", "close", [4, 3, 2, 1, 0]);

        this.lockedStairsDoors = this.add.group();
        this.lockedStairsDoors.enableBody = true;
        this.map.createFromObjects("LockedStairsDoors", 16, "stairsDoors", 0, true, false, this.lockedStairsDoors);

        this.lockedStairsDoors.callAll("animations.add", "animations", "open", [0, 1, 2, 3, 4]);
        this.lockedStairsDoors.callAll("animations.add", "animations", "close", [4, 3, 2, 1, 0]);

        this.keys = this.add.group();
        this.keys.enableBody = true;
        this.map.createFromObjects("Keys", 54, "key", 0, true, false, this.keys);

        this.enemy1Group = this.add.group();
        this.enemy1Group.enableBody = true;
        this.map.createFromObjects("Enemy1", 46, "enemy1", 0, true, false, this.enemy1Group);

        this.enemy2Group = this.add.group();
        this.enemy2Group.enableBody = true;
        this.map.createFromObjects("Enemy2", 50, "enemy2", 0, true, false, this.enemy2Group);

        this.enemy1Group.callAll("animations.add", "animations", "walk", [1, 2], 20);
        this.enemy2Group.callAll("animations.add", "animations", "walk", [1, 2], 20);

        this.stopwatches = this.add.group();
        this.stopwatches.enableBody = true;
        this.map.createFromObjects("Stopwatch", 55, "stopwatch", 0, true, false, this.stopwatches);

        this.timeRift = this.add.group();
        this.timeRift.enableBody = true;
        this.map.createFromObjects("TimeRift", 56, "timeRift", 0, true, false, this.timeRift);

        this.timeRift.callAll("animations.add", "animations", "normal", [0, 1, 2, 3]);

        this.world.resize(this.tileSize * this.tilesX, this.tileSize * this.tilesY);

        player = this.add.sprite(200, 5800, "player");
        player.anchor.setTo(0.5, 0);
        playerGhost = this.add.sprite(5, 700, "player");
        playerGhost.anchor.setTo(0.5, 0);
        playerGhost.alpha = 0.5;
        playerGhost.visible = false;

        this.enemy1Group.callAll("anchor.setTo", "anchor", 0.5, 0);
        this.enemy2Group.callAll("anchor.setTo", "anchor", 0.5, 0);

        // Add hat
        if (hatIndex && hatIndex >= 0) {
            this.hat = this.add.sprite(0, 10, "hats", hatIndex);
            this.hat.anchor.setTo(0.5, 1);
            this.hat.enableBody = true;
            player.addChild(this.hat);

            this.hadGhost = this.add.sprite(0, 10, "hats", hatIndex);
            this.hadGhost.anchor.setTo(0.5, 1);
            playerGhost.addChild(this.hadGhost);
        }

        this.dialog = this.add.nineSlice(0, 0, "dialog", null, 100, 70);
        this.dialog.visible = false;
        this.dialog.anchor.setTo(0, 1);

        this.dialogText = this.add.text(0, 0, "Some text to test", { font: "40px 'VT323'", fill: "#000000" });
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
        this.doorFPS = 20;

        // Add sounds
        this.openDoorSound = this.add.audio("openDoor");
        this.closeDoorSound = this.add.audio("closeDoor");
        this.woodStepSound = this.add.audio("woodStep");
        this.woodStepSlowSound = this.add.audio("woodStepSlow");

        this.openDoorSound.allowMultiple = true;
        this.closeDoorSound.allowMultiple = true;
        this.woodStepSound.allowMultiple = true;
        this.woodStepSlowSound.allowMultiple = true;

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

        if (hatIndex && hatIndex >= 0) {
            this.hat.body.allowGravity = false;
        }
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


        this.lockedStairsDoors.forEach((door) => {
            door.body.allowGravity = false;
            door.isOpen = false;
            door.isLocked = true;
        });

        this.keys.forEach((key) => {
            key.body.allowGravity = false;
        });

        this.stopwatches.forEach((stopwatch) => {
            stopwatch.body.allowGravity = false;
        });

        this.timeRift.forEach((timeRift) => {
            timeRift.body.allowGravity = false;
            timeRift.animations.play("normal", 20, true);
        });

        // Set the size of the body of the agents
        player.body.setSize(60, 75);
        this.enemy1Group.callAll("body.setSize", "body", 60, 75);
        this.enemy2Group.callAll("body.setSize", "body", 60, 75);

        // Player cooldowns
        player.cd = 0;
        player.cdTime = 5;

        // Player ability timers
        // slowTime uses physics time, which goes at 1/3 the speed,
        // so stopTime needs to be 3x longer
        player.slowTimer = 0;
        player.slowTime = 0.5;
        player.stopTimer = 0;
        player.stopTime = 1.5;

        this.isTimeStopped = false;

        // Set controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.backtrackButton = this.input.keyboard.addKey(Phaser.Keyboard.A);
        this.slowButton = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.stopButton = this.input.keyboard.addKey(Phaser.Keyboard.S);


        // Prepare collisions
        this.map.setCollisionBetween(1, 999, true, "Floor");
        this.map.setCollisionBetween(1, 999, true, "Walls");

        // Prepare for the start
        this.dialogs.move.counter = this.dialogs.nextStepCounterTime;
        player.animations.play("walk");
        player.keyCount = 0;
        player.hasStopwatch = false;
        this.enemy1Group.forEach((enemy) => {
            enemy.lastBoundaryPos = 0;
            this.enemyContinuePatrol(enemy);
        });
        this.enemy2Group.forEach((enemy) => {
            enemy.lastBoundaryPos = 0;
            this.enemyContinuePatrol(enemy);
        });

        // Set hat powers

        switch (hatIndex) {
            case 0:
                // 33% longer powers (wealthy)
                player.slowTime += player.slowTime / 3;
                player.stopTime += player.stopTime / 3;
                break;
            case 1:
                // +100 movement speed
                this.playerMoveSpeed += 100;
                break;
            case 2:
                // 20% reduced effect of gravity
                player.body.gravity.y -= player.body.gravity.y * 0.2;
        }
    },

    update: function () {
        if (this.scoreSubmission) {
            // Don't go into normal loop, we're submitting our score
            if (this.cursors.left.isDown) {
                if (this.cursors.left.justPressed() || this.cursors.left.duration > 500) {

                    this.moveLetterSelector("left");
                    this.cursors.left.reset();
                }
            }

            if (this.cursors.right.isDown) {
                if (this.cursors.right.justPressed() || this.cursors.right.duration > 500) {
                    this.moveLetterSelector("right");
                    this.cursors.right.reset();
                }
            }

            if (this.cursors.up.isDown) {
                if (this.cursors.up.justPressed() || this.cursors.up.duration > 500) {
                    this.moveLetterSelector("up");
                    this.cursors.up.reset();
                }
            }

            if (this.cursors.down.isDown) {
                if (this.cursors.down.justPressed() || this.cursors.down.duration > 500) {
                    this.moveLetterSelector("down");
                    this.cursors.down.reset();
                }
            }

        } else {
            // Not on submission yet, do normal loop
            // Increase time
            this.gameTime += this.time.physicsElapsed;

            this.stepTimer += this.time.physicsElapsed;

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

            // Floor collisions
            this.physics.arcade.collide(player, this.floorLayer, this.collisionHandler, null, this);
            this.physics.arcade.collide(this.enemy1Group, this.floorLayer);
            this.physics.arcade.collide(this.enemy2Group, this.floorLayer);

            // Player
            this.physics.arcade.collide(player, this.wallLayer, this.collisionHandler, null, this);
            this.physics.arcade.overlap(player, this.doors, this.openDoor, null, this);
            this.physics.arcade.overlap(player, this.keys, this.grabKey, null, this);
            this.physics.arcade.overlap(player, this.stopwatches, this.grabStopwatch, null, this);
            this.physics.arcade.overlap(player, this.enemy1Group, this.killPlayer, null, this);
            this.physics.arcade.overlap(player, this.enemy2Group, this.killPlayer, null, this);
            this.physics.arcade.overlap(player, this.timeRift, this.enterTimeRift, null, this);

            // Enemy
            this.physics.arcade.overlap(this.enemy1Group, this.doors, this.enemyReachedEndOfRoute, null, this);
            this.physics.arcade.collide(this.enemy1Group, this.wallLayer, this.enemyReachedEndOfRoute, null, this);
            this.physics.arcade.overlap(this.enemy2Group, this.doors, this.enemyReachedEndOfRoute, null, this);
            this.physics.arcade.collide(this.enemy2Group, this.wallLayer, this.enemyReachedEndOfRoute, null, this);


            player.body.velocity.x = 0;

            // Check input
            if (this.cursors.left.isDown || this.cursors.right.isDown) {
                // Prepare next dialog
                if (!this.dialogs.move.completed) {
                    this.prepareNextDialog();
                }

                if (!player.renderable) {
                    player.body.velocity.x = 0;
                    return;
                }

                if (this.cursors.left.isDown) {
                    player.body.velocity.x = -this.playerMoveSpeed;
                    this.playerWalking = true;
                    if (player.scale.x > 0) {
                        player.scale.x *= -1;
                    }
                } else if (this.cursors.right.isDown) {
                    player.body.velocity.x = this.playerMoveSpeed;
                    this.playerWalking = true;
                    if (player.scale.x < 0) {
                        player.scale.x *= -1;
                    }
                }
            }
            if (this.cursors.up.isDown || this.cursors.down.isDown) {

                if ((this.cursors.up.justPressed() || this.cursors.up.duration > 1000) ||
                    (this.cursors.down.justPressed() || this.cursors.down.duration > 1000)) {
                    // Check if we're near a stairs door before acting
                    this.physics.arcade.overlap(player, this.stairsDoors, this.goThroughStairsDoor, null, this);
                    this.physics.arcade.overlap(player, this.lockedStairsDoors, this.goThroughStairsDoor, null, this);
                }
            }

            if (this.jumpButton.isDown && (player.body.onFloor() || player.body.blocked.down)) {
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

                    // Also, stop current walk animation so that the slow animation plays
                    player.animations.stop("walk");
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
            if (this.input.keyboard.isDown(Phaser.Keyboard.P)) {
                this.showDialog("This is a test");
            }

            // Play animations
            if (player.animations.currentAnim.name !== "disappear" || !player.animations.currentAnim.isPlaying) {
                if (this.playerWalking && !this.playerInAir && (player.body.onFloor() || player.body.touching.down)) {
                    player.animations.play("walk", this.walkFPS / this.time.slowMotion, false);
                    if (this.stepTimer > this.stepWaitTime) {
                        this.stepTimer = 0;
                        this.playSound("step");
                    }
                } else {
                    this.stepTimer = 0;
                    player.animations.stop("walk");
                }
            }

            // We're doing a loop here, so do it only once and perform every action that needs
            // to be performed on the enemy agents (performance)
            // Velocity, animations and raycasting
            this.enemy1Group.forEach((enemy) => {
                if (enemy.isWalking && !this.isTimeStopped) {
                    if (enemy.isChasingPlayer) {
                        enemy.body.velocity.x = this.enemyChaseSpeed * enemy.scale.x;
                    } else {
                        enemy.body.velocity.x = this.enemyMoveSpeed * enemy.scale.x;
                    }
                    enemy.animations.play("walk", this.walkFPS / this.time.slowMotion, false);
                } else {
                    enemy.body.velocity.x = 0;
                    enemy.animations.stop("walk");
                }

                if (Math.abs(enemy.position.y - player.position.y) <= 150) {
                    // Player is at the same level as the enemy
                    if (Phaser.Math.distanceSq(enemy.position.x, enemy.position.y, player.position.x, player.position.y) <= this.enemySightDistance * this.enemySightDistance) {
                        // Enemy is within visible distance, check if the enemy if facing the player
                        if ((enemy.scale.x > 0 && enemy.position.x < player.position.x) || enemy.scale.x < 0 && enemy.position.x > player.position.x) {
                            // Ok, do raycasting to see if there's anything obstructing view
                            this.line = new Phaser.Line(enemy.position.x, enemy.position.y, player.position.x, player.position.y);
                            let doorsHit = [];
                            this.doors.forEach(door => {
                                if (Phaser.Line.intersectsRectangle(this.line, door)) {
                                    doorsHit.push(door);
                                }
                            });
                            let tilesHit = this.wallLayer.getRayCastTiles(this.line, 4, false, true);

                            if (tilesHit.length === 0 && doorsHit.length === 0) {
                                // Enemy can see player... Chase!
                                debug.log("Player in sight");
                                enemy.isChasingPlayer = true;
                            } else {
                                enemy.isChasingPlayer = false;
                            }
                        } else {
                            enemy.isChasingPlayer = false;
                        }
                    } else {
                        enemy.isChasingPlayer = false;
                    }
                } else {
                    enemy.isChasingPlayer = false;
                }
            });

            this.enemy2Group.forEach((enemy) => {
                if (enemy.isWalking && !this.isTimeStopped) {
                    if (enemy.isChasingPlayer) {
                        enemy.body.velocity.x = this.enemyChaseSpeed * enemy.scale.x;
                    } else {
                        enemy.body.velocity.x = this.enemyMoveSpeed * enemy.scale.x;
                    }
                    enemy.animations.play("walk", this.walkFPS / this.time.slowMotion, false);
                } else {
                    enemy.body.velocity.x = 0;
                    enemy.animations.stop("walk");
                }

                if (Math.abs(enemy.position.y - player.position.y) <= 150) {
                    // Player is at the same level as the enemy
                    if (Phaser.Math.distanceSq(enemy.position.x, enemy.position.y, player.position.x, player.position.y) <= this.enemySightDistance * this.enemySightDistance) {
                        // Enemy is within visible distance, check if the enemy if facing the player
                        if ((enemy.scale.x > 0 && enemy.position.x < player.position.x) || enemy.scale.x < 0 && enemy.position.x > player.position.x) {
                            // Ok, do raycasting to see if there's anything obstructing view
                            this.line = new Phaser.Line(enemy.position.x, enemy.position.y, player.position.x, player.position.y);
                            let doorsHit = [];
                            this.doors.forEach(door => {
                                if (Phaser.Line.intersectsRectangle(this.line, door)) {
                                    doorsHit.push(door);
                                }
                            });
                            let tilesHit = this.wallLayer.getRayCastTiles(this.line, 4, false, true);

                            if (tilesHit.length === 0 && doorsHit.length === 0) {
                                // Enemy can see player... Chase!
                                debug.log("Player in sight");
                                enemy.isChasingPlayer = true;
                            } else {
                                enemy.isChasingPlayer = false;
                            }
                        } else {
                            enemy.isChasingPlayer = false;
                        }
                    } else {
                        enemy.isChasingPlayer = false;
                    }
                } else {
                    enemy.isChasingPlayer = false;
                }
            });

            // Update orientation of dialog
            this.dialog.scale.x = player.scale.x;
        }
    },

    shutdown: function () {
        this.scoreSubmission = undefined;
        player = undefined;
    },

    render: function () {
        if (debug.isDev) {
            game.debug.geom(this.line);
        }
    }
};
