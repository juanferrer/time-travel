/* globals gameControl, debug, game */

/// <reference path="../typescript/phaser.d.ts" />

gameControl.StartScreen = function () {
    this.title;
    this.startButton;
    this.storeButton;

    this.startGame = function () {
        this.state.start("MainGameScreen");
    };

    this.openStore = function () {
        this.state.start("StoreScreen");
    };
};

gameControl.StartScreen.prototype = {
    create: function () {
        let style = { font: "40px 'VT323'", fill: "#000000" };

        this.title = this.add.image(game.canvas.width / 2, 200, "titleImage");
        this.title.anchor.setTo(0.5, 0.5);

        this.stage.backgroundColor = "#444444";
        debug.log("In start screen");
        this.startButton = this.add.nineSlice(game.canvas.width / 2, (game.canvas.height / 2) - 50, "button", null, 200, 70);
        this.startButton.anchor.setTo(0.5, 0.5);
        this.startButton.inputEnabled = true;
        this.startButton.events.onInputDown.addOnce(this.startGame, this);
        this.startButton.events.onInputOver.add(() => { this.startButton.resize(204, 74); }, this);
        this.startButton.events.onInputOut.add(() => { this.startButton.resize(200, 70); }, this);

        this.startText = this.add.text(0, 0, "Start", style);
        this.startButton.addChild(this.startText);
        this.startText.anchor.setTo(0.5, 0.5);

        this.storeButton = this.add.nineSlice(game.canvas.width / 2, (game.canvas.height / 2) + 50, "button", null, 200, 70);
        this.storeButton.anchor.setTo(0.5, 0.5);
        this.storeButton.inputEnabled = true;
        this.storeButton.events.onInputDown.addOnce(this.openStore, this);
        this.storeButton.events.onInputOver.add(() => { this.storeButton.resize(204, 74); }, this);
        this.storeButton.events.onInputOut.add(() => { this.storeButton.resize(200, 70); }, this);

        this.storeText = this.add.text(0, 0, "Store", style);
        this.storeButton.addChild(this.storeText);
        this.storeText.anchor.setTo(0.5, 0.5);
    }
};
