/* globals game, Phaser, gameControl, $ */
/// <reference path="../typescript/phaser.d.ts" />

window.onload = function () {
    // eslint-disable-next-line no-global-assign
    game = new Phaser.Game(parseInt($("#game-container").css("width")) - 14, 600, Phaser.AUTO, "game-container");
    game.state.add("Boot", gameControl.Boot);
    game.state.add("Preloader", gameControl.Preloader);
    game.state.add("StartScreen", gameControl.StartScreen);
    game.state.add("MainGameScreen", gameControl.MainGameScreen);
    game.state.add("GameOverScreen", gameControl.GameOverScreen);
    game.state.start("Boot");
};

// Debug object, mainly for console.log and console.output
// eslint-disable-next-line no-unused-vars
var debug = {
    isDev: true,
    log: function (msg) {
        // eslint-disable-next-line no-console
        if (this.isDev) console.log(msg);
    },
    error: function (msg) {
        // eslint-disable-next-line no-console
        if (this.isDev) console.error(msg);
    }
};
