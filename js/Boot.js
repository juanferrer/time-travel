var gameControl = {};
var game;

gameControl.Boot = function(game){ };

gameControl.Boot.prototype = {
    
    preload: function() {
    this.load.image("preloaderBar", "assets/loader_bar.png");
    this.load.image("titleImage", "assets/TitleImage.png");   
    },

    create: function() {
        debug.log("In boot");
        this.state.start("Preloader");
    }	
};
