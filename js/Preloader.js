/* globals gameControl, game, debug, Phaser, PhaserNineSlice */

var score = 0;

gameControl.Preloader = function () {
    this.preloadBar = null;
    this.titleText = null;
    this.ready = false;
};

gameControl.Preloader.prototype = {

    preload: function () {
        // Load plugins
        game.plugins.add(PhaserNineSlice.Plugin);

        this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, "preloaderBar");
        this.preloadBar.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(this.preloadBar);
        this.titleText = this.add.image(this.world.centerX, this.world.centerY - 220, "titleImage");
        this.titleText.anchor.setTo(0.5, 0.5);

        // Images
        this.load.image("titleScreen", "assets/images/TitleBG.png");
        this.load.spritesheet("player", "assets/images/detective.png", 70, 80, 13);
        this.load.tilemap("level", "assets/level0.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.image("wallpaper", "assets/images/wallpaper.png");
        this.load.image("walls", "assets/images/walls.png");
        this.load.image("key", "assets/images/key.png");
        this.load.spritesheet("enemy1", "assets/images/enemy1.png", 70, 80, 3);
        this.load.spritesheet("enemy2", "assets/images/enemy2.png", 70, 80, 3);
        this.load.spritesheet("doors", "assets/images/door.png", 120, 120, 5);
        this.load.spritesheet("stairsDoors", "assets/images/stairsDoor.png", 120, 120, 5);
        this.load.image("stopwatch", "assets/images/stopwatch.png");
        this.load.spritesheet("timeRift", "assets/images/timeRift.png", 60, 60, 4);
        this.load.nineSlice("dialog", "assets/images/dialog.png", 15, 54, 15, 30);
        this.load.nineSlice("button", "assets/images/button.png", 20);
        this.load.nineSlice("facebook", "assets/images/facebook.png", 20, 20, 50, 20);
        this.load.nineSlice("tube", "assets/images/tube.png", 36);
        this.load.nineSlice("tubeFilling", "assets/images/tubeFilling.png", 20);

        // Sounds
        this.load.audio("openDoor", "assets/sounds/door-open.wav");
        this.load.audio("closeDoor", "assets/sounds/door-close.wav");
        this.load.audio("woodStep", "assets/sounds/step-wood.wav");
        this.load.audio("woodStepSlow", "assets/sounds/step-wood-slow.wav");
    },

    create: function () {
        debug.log("In preloader");
        this.preloadBar.cropEnabled = false; //force show the whole thing
    },

    update: function () {
        this.ready = true;
        this.state.start("StartScreen"); //when create function is complete go to the start screen
    }
};
