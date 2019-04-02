/* globals gameControl, debug */

/// <reference path="../typescript/phaser.d.ts" />

gameControl.StartScreen = function () {
    this.startButton;
    this.storeButton;

    this.startGame = function() {
        this.state.start("MainGameScreen");
    }
};

gameControl.StartScreen.prototype = {
    create: function () {
        this.stage.backgroundColor = "#444444";
        debug.log("In start screen");
        this.startButton = this.add.nineSlice(game.canvas.width / 2, (game.canvas.height / 2) - 50, "button", null, 200, 70);
        this.startButton.anchor.setTo(0.5, 0.5);
        this.startButton.inputEnabled = true;
        this.startButton.events.onInputDown.addOnce(this.startGame, this);

        this.startText = this.add.text(0, 0, "Play", { font: "40px 'VT323'", fill: "#000000" });
        this.startButton.addChild(this.startText);
        this.startText.anchor.setTo(0.5, 0.5);

        this.storeButton = this.add.nineSlice(game.canvas.width / 2, (game.canvas.height / 2) + 50, "button", null, 200, 70);
        this.storeButton.anchor.setTo(0.5, 0.5);
        this.storeButton.inputEnabled = true;
        this.storeButton.events.onInputDown.addOnce(this.startGame, this);

        this.storeText = this.add.text(0, 0, "Store", { font: "40px 'VT323'", fill: "#000000" });
        this.storeButton.addChild(this.storeText);
        this.storeText.anchor.setTo(0.5, 0.5);
    },

    update: function () {
        if (this.startButton.input.pointerOver()) {
            this.startButton.resize(204, 74);
        } else {
            this.startButton.resize(200, 70);
        }

        if (this.storeButton.input.pointerOver()) {
            this.storeButton.resize(204, 74);
        } else {
            this.storeButton.resize(200, 70);
        }
    }
};
