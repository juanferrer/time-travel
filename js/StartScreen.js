/* globals gameControl, debug */

/// <reference path="../typescript/phaser.d.ts" />

gameControl.StartScreen = function () {
    this.startBG;
    this.startPrompt;
};

gameControl.StartScreen.prototype = {
    create: function () {
        debug.log("In start screen");
        this.startBG = this.add.image(this.world.centerX, this.world.centerY, "titleScreen");
        this.startBG.anchor.setTo(0.5, 0.5);
        this.startBG.inputEnabled = true;
        this.startBG.events.onInputDown.addOnce(this.startGame, this);
    },

    startGame: function () {
        this.state.start("MainGameScreen");
    }
};
