/* globals gameControl, game, debug, Phaser, PhaserNineSlice */

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
        this.load.image("titleScreen", "assets/TitleBG.png");
        this.load.spritesheet("player", "assets/detective.png", 70, 80, 13);
        this.load.tilemap("level", "assets/level0.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.image("wallpaper", "assets/wallpaper.png");
        this.load.image("walls", "assets/walls.png");
        this.load.spritesheet("doors", "assets/door.png", 120, 120, 5);
        this.load.spritesheet("stairsDoors", "assets/stairsDoor.png", 120, 120, 5);
        //this.load.image("trees", "assets/trees.png");
        this.load.nineSlice("dialog", "assets/dialog.png", 15, 54, 15, 30);
        this.load.nineSlice("tube", "assets/tube.png", 36);
        this.load.nineSlice("tubeFilling", "assets/tubeFilling.png", 20);
        // Sounds
        //this.load.audio("slowTimeSound", "assets/slowTimeSound.wav");
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
