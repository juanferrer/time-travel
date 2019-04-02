/* globals gameControl, debug, $, Phaser, FB, score */

/// <reference path="../typescript/phaser.d.ts" />

gameControl.GameOverScreen = function () {
    this.highscores;
    this.playAgainButton;
    this.playAgainText;
    this.shareOnFacebookButton;

    this.displayHighScores = function (scores) {
        let scoresText = "";
        for (let i = 0; i < scores.length; ++i) {
            scoresText += `${scores[i].name}....................${scores[i].score}\n`;
        }

        this.highscores = this.add.text(this.world.centerX, this.world.centerY - 10, scoresText, { font: "30px 'VT323'", fill: "#FFFFFF" });
        this.highscores.anchor.setTo(0.5, 0.5);
    };

    this.shareOnFacebook = function (object, sender, score) {
        FB.ui({
            method: "share",
            href: "https://vesta.uclan.ac.uk/~jeferrer-cortez",
            quote: `I achieved a score of ${score} on Time Travel!`,
        });
    };
};

gameControl.GameOverScreen.prototype = {
    create: function () {
        debug.log("Game Over screen");
        this.stage.backgroundColor = "#000000";
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        this.playAgainButton = this.add.nineSlice(this.world.centerX - 100, this.world.centerY * 2 - 60, "button", null, 200, 70);
        this.playAgainButton.inputEnabled = true;
        this.playAgainButton.events.onInputDown.addOnce(() => { this.state.start("MainGameScreen", true, false); }, this);
        this.playAgainButton.events.onInputOver.add(() => { this.playAgainButton.resize(204, 74); }, this);
        this.playAgainButton.events.onInputOut.add(() => { this.playAgainButton.resize(200, 70); }, this);

        this.playAgainButton.fixedToCamera = true;
        this.playAgainButton.anchor.setTo(0.5, 0.5);

        this.playAgainText = this.add.text(0, 0, "Play Again", { font: "40px 'VT323'", fill: "#000000" });
        this.playAgainButton.addChild(this.playAgainText);
        this.playAgainText.anchor.setTo(0.5, 0.5);

        this.shareOnFacebookButton = this.add.nineSlice(this.world.centerX + 100, this.world.centerY * 2 - 60, "facebook", null, 200, 70);
        this.shareOnFacebookButton.inputEnabled = true;
        this.shareOnFacebookButton.events.onInputDown.add(this.shareOnFacebook, this, 0, score);
        this.shareOnFacebookButton.events.onInputOver.add(() => { this.shareOnFacebookButton.resize(204, 74); }, this);
        this.shareOnFacebookButton.events.onInputOut.add(() => { this.shareOnFacebookButton.resize(200, 70); }, this);
        this.shareOnFacebookButton.fixedToCamera = true;
        this.shareOnFacebookButton.anchor.setTo(0.5, 0.5);

        // Request and display high scores tables
        $.ajax("https://vesta.uclan.ac.uk/~jeferrer-cortez/php/highscores.php", {
            type: "POST",
            data: { type: "GET_SCORES" },
            error: (request, status, error) => {
                debug.log("Request: " + request);
                debug.log("Status: " + status);
                debug.log("Error: " + error);
            },
            success: (data/*, status, request*/) => {
                debug.log(JSON.parse(data));

                this.displayHighScores(JSON.parse(data));
            }
        });
    }
};
