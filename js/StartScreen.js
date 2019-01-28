/// <reference path="../typescript/phaser.d.ts" />

gameControl.StartScreen = function (game) {
	this.startBG;
	this.startPrompt;
};

gameControl.StartScreen.prototype = {
	create: function () {
		debug.log("In start screen");
		startBG = this.add.image(this.world.centerX, this.world.centerY, "titleScreen");
		startBG.anchor.setTo(0.5, 0.5);
		startBG.inputEnabled = true;
		startBG.events.onInputDown.addOnce(this.startGame, this);
	},

	startGame: function (pointer) {
		this.state.start("MainGameScreen");
	}
};