/* globals debug */

var gameControl = {};
// eslint-disable-next-line no-unused-vars
var game;

gameControl.Boot = function () { };

gameControl.Boot.prototype = {

    preload: function () {
        this.load.image("preloaderBar", "assets/images/preloaderBar.png");
    },

    create: function () {
        debug.log("In boot");
        this.state.start("Preloader");
    }
};
