/// <reference path="../typescript/phaser.d.ts" />

window.onload = function() {
    let game = new Phaser.Game(800,600,Phaser.AUTO, "gameContainer"); 
    game.state.add("Boot", myGame.Boot);
    game.state.add("Preloader", myGame.Preloader);
    game.state.add("StartScreen", myGame.StartScreen);
    game.state.add("MainGameScreen", myGame.MainGameScreen);
    game.state.add("GameOverScreen", myGame.GameOverScreen);
    game.state.start("Boot");
}