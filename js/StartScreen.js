myGame.StartScreen = function(game) {
	this.startBG;
	this.startPrompt;
};

myGame.StartScreen.prototype = {
	
	create: function () {
        console.log("in start screen");
		startBG = this.add.image(this.world.centerX, this.world.centerY, "titlescreen");
        startBG.anchor.setTo(0.5, 0.5);
	}

};