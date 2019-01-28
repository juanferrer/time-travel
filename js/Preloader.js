gameControl.Preloader = function(game) {
	this.preloadBar = null;
	this.titleText = null;
	this.ready = false;
};

gameControl.Preloader.prototype = {
	
	preload: function () {
		this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, "preloaderBar");
		this.preloadBar.anchor.setTo(0.5, 0.5);
		this.load.setPreloadSprite(this.preloadBar);
		this.titleText = this.add.image(this.world.centerX, this.world.centerY - 220, "titleImage");
		this.titleText.anchor.setTo(0.5, 0.5);
        
        //preload main game assets here
		this.load.image("titleScreen", "assets/TitleBG.png");
		this.load.image("player", "assets/player.png");
		this.load.image("floor", "assets/floor.png");
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
