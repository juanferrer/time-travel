/// <reference path="../typescript/phaser.d.ts" />

window.onload = function() {
    game = new Phaser.Game(800,600,Phaser.AUTO, "gameContainer"); 
    game.state.add("Boot", gameControl.Boot);
    game.state.add("Preloader", gameControl.Preloader);
    game.state.add("StartScreen", gameControl.StartScreen);
    game.state.add("MainGameScreen", gameControl.MainGameScreen);
    game.state.add("GameOverScreen", gameControl.GameOverScreen);
    game.state.start("Boot");
}

// Debug object, mainly for console.log and console.output
var debug = {
    isDev: true,
    log: function(msg) {
        if (this.isDev) console.log(msg);
    },
    error: function(msg) {
        if (this.isDev) console.error(msg);
    }
}