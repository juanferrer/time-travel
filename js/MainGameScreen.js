gameControl.MainGameScreen = function(game) {
};

gameControl.MainGameScreen.prototype = {	
	create: function () {
		debug.log("Main game screen");

		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.arcade.gravity.y = 100;

		// Create assets on screen
		floor = game.add.sprite(50, 500, "floor");
		game.physics.enable(floor, Phaser.Physics.ARCADE);
		floor.body.immovable = true;
		floor.body.allowGravity = false;

		player = game.add.sprite(game.world.centerX, game.world.centerY, "player");
		game.physics.enable(player, Phaser.Physics.ARCADE);

		player.body.collideWorldBounds = true;
		player.body.gravity.y = 1000;
		player.body.maxVelocity.y = 500;

		// Set animations
		player.animations.add("left", []);
		player.animations.add("turn", []);
		player.animations.add("right", []);

		// Set controls
		cursors = game.input.keyboard.createCursorKeys();
		jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	},

	update: function () {
		    // Physics
			game.physics.arcade.collide(player, floor, this.collisionHandler, null, this);
			player.body.velocity.x = 0;	
		
			// Check input
			if (cursors.left.isDown) {
				player.body.velocity.x = -150;
			} else if (cursors.right.isDown) {
				player.body.velocity.x = 150;
			} 
			
			if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down)) {
				player.body.velocity.y = -1000;
			}
	},

	collisionHandler: function () {
		debug.log("Collision");
	}
};