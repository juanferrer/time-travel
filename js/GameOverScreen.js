/* globals gameControl, debug, $, Phaser, FB */

/// <reference path="../typescript/phaser.d.ts" />

gameControl.GameOverScreen = function () {
    this.highscores;

    this.displayHighScores = function (scores) {
        let scoresText = "";
        for (let i = 0; i < scores.length; ++i) {
            scoresText += `${scores[i].name}....................${scores[i].score}\n`;
        }

        this.highscores = this.add.text(this.world.centerX, this.world.centerY - 100, scoresText, { font: "40px 'VT323'", fill: "#FFFFFF" });
        this.highscores.anchor.setTo(0.5, 0.5);
    };

    this.shareOnFacebook = function (score) {
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
