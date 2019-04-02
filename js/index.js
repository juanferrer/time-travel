/* globals game, Phaser, gameControl, $ */
/// <reference path="../typescript/phaser.d.ts" />

window.onload = function () {
    // eslint-disable-next-line no-global-assign
    game = new Phaser.Game(parseInt($("#game-container").css("width")) - 2, parseInt($("#game-container").css("height")) - 2, Phaser.AUTO, "game-container");
    game.state.add("Boot", gameControl.Boot);
    game.state.add("Preloader", gameControl.Preloader);
    game.state.add("StartScreen", gameControl.StartScreen);
    game.state.add("StoreScreen", gameControl.StoreScreen);
    game.state.add("MainGameScreen", gameControl.MainGameScreen);
    game.state.add("GameOverScreen", gameControl.GameOverScreen);
    game.state.start("Boot");
};

var score;
var playerName;
var hatIndex;
var hatsAmount = 3;
var hatsUnlocked;

const saveLocations = {
    hatIndex: "time-travel-hat-index",
    hatsUnlocked: "time-travel-hats-unlocked"
}

{
    // Load from local storage
    let hats = JSON.parse(localStorage.getItem(saveLocations.hatsUnlocked)) || [];
    hatsUnlocked = new Set(hats);
    hatIndex = JSON.parse(localStorage.getItem(saveLocations.hatIndex));
}

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
