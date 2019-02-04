gameControl.MainGameScreen = function(game) {
};

gameControl.MainGameScreen.prototype = {	
	create: function () {
		debug.log("Main game screen");

		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.physics.arcade.gravity.y = 100;

		this.add.tileSprite(0, 0, 2000, 600, "bg");
		this.world.resize(2000, 600);

		// Create assets on screen
		floor = this.add.sprite(50, 500, "floor");
		this.physics.enable(floor, Phaser.Physics.ARCADE);
		floor.body.immovable = true;
		floor.body.allowGravity = false;

		player = this.add.sprite(this.world.centerX, this.world.centerY, "player");
		this.physics.enable(player, Phaser.Physics.ARCADE);
		this.camera.follow(player, null, 0.05, 0.05);

		player.body.collideWorldBounds = true;
		player.body.gravity.y = 2000;
		player.body.maxVelocity.y = 2000;

		// Set animations
		player.animations.add("left", []);
		player.animations.add("turn", []);
		player.animations.add("right", []);

		// Set controls
		cursors = this.input.keyboard.createCursorKeys();
		jumpButton = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	},

	update: function () {
		    // Physics
			this.physics.arcade.collide(player, floor, this.collisionHandler, null, this);
			player.body.velocity.x = 0;	
		
			// Check input
			if (cursors.left.isDown) {
				player.body.velocity.x = -300;
			} else if (cursors.right.isDown) {
				player.body.velocity.x = 300;
			} 
			
			if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down)) {
				player.body.velocity.y = -800;
			}
	},

	collisionHandler: function () {
		debug.log("Collision");
	}
};