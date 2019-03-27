/* globals gameControl, debug, $ */

gameControl.GameOverScreen = function () {
    this.displayHighScores = function (scores) {

    };
};

gameControl.GameOverScreen.prototype = {
    create: function () {
        debug.log("Game Over screen");

        // Request and display high scores tables
        $.ajax("https://vesta.uclan.ac.uk/~jeferrer-cortez/highscores.php", {
            type: "POST",
            data: { type: "GET_SCORES" },
            error: (request, status, error) => {
                debug.log("Request: " + request);
                debug.log("Status: " + status);
                debug.log("Error: " + error);
            },
            success: (data, status, request) => {
                debug.log(data);

                this.displayHighScores();
            }
        });
    }
};
