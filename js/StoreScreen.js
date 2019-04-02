/* globals gameControl, debug, $, Phaser, saveLocations */

/// <reference path="../typescript/phaser.d.ts" />

gameControl.StoreScreen = function () {
	this.background;
	this.hats = [];
	this.hatButtons = [];
	this.startButton;

    this.startGame = function () {
        this.state.start("MainGameScreen");
    };

	this.unlock = function (object, sender, index) {
		hatsUnlocked.add(index);
		this.hatButtons[index].events.onInputDown.addOnce(this.equip, this, 0, index);
		this.hatButtons[index].children[0].text = "Equip";
		localStorage.setItem(saveLocations.hatsUnlocked, JSON.stringify(Array.from(hatsUnlocked)));
	};

	this.equip = function (object, sender, index) {

		for (let i = 0; i < hatsAmount; ++i) {
			if (i !== index && hatsUnlocked.has(i)) {
				this.hatButtons[i].events.onInputDown.removeAll();
				this.hatButtons[i].events.onInputDown.addOnce(this.equip, this, 0, i);
				this.hatButtons[i].children[0].text = "Equip";
				localStorage.removeItem(saveLocations.hatIndex);
			}
		}

		hatIndex = index;
		this.hatButtons[index].events.onInputDown.addOnce(this.unequip, this, 0, index);
		this.hatButtons[index].children[0].text = "Unequip";
		localStorage.setItem(saveLocations.hatIndex, hatIndex);
	};

	this.unequip = function (object, sender, index) {
		hatIndex = undefined;
		this.hatButtons[index].events.onInputDown.addOnce(this.equip, this, 0, index);
		this.hatButtons[index].children[0].text = "Equip";
		localStorage.removeItem(saveLocations.hatIndex);
	};
};

gameControl.StoreScreen.prototype = {
    create: function () {
		let textStyle = { font: "40px 'VT323'", fill: "#000000" };

		// Prepare the background for the store
		let graphics = this.add.graphics();
        graphics.beginFill(0x000000, 0.7);
		this.background = graphics.drawRect((game.canvas.width - 900) / 2, (game.canvas.height - 500) / 2, 900, 500);
		this.background.anchor.setTo(0.5, 0.5);
        graphics.endFill();
        this.background.fixedToCamera = true;

        let centerX = (game.canvas.width) / 2;
		let centerY = (game.canvas.height) / 2;
		
		
		// Add buttons and hats
		for (let i = 0; i < hatsAmount; ++i) {
			// Center - half the size of the button block + button center offset + current button offset
			let xPos = centerX - (125 * hatsAmount) + 125 + 250 * i;
			// Hats
			this.hats.push(this.add.sprite(xPos, centerY - 100, "hats", i));
			this.hats[i].anchor.setTo(0.5, 0.5);
			
			// Unlock buttons
			this.hatButtons.push(this.submitButton = this.add.nineSlice(xPos, centerY, "button", null, 200, 70));
			this.hatButtons[i].inputEnabled = true;
			
			this.hatButtons[i].events.onInputOver.add(() => { this.hatButtons[i].resize(204, 74); }, this);
			this.hatButtons[i].events.onInputOut.add(() => { this.hatButtons[i].resize(200, 70); }, this);
			this.hatButtons[i].anchor.setTo(0.5, 0.5);
			let hatButtonText;
			if (hatsUnlocked.has(i)) {
				if (hatIndex === i) {
					hatButtonText = this.add.text(0, 0, "Unequip", textStyle);	
					this.hatButtons[i].events.onInputDown.addOnce(this.unequip, this, 0, i);		
				} else {
					hatButtonText = this.add.text(0, 0, "Equip", textStyle);	
					this.hatButtons[i].events.onInputDown.addOnce(this.equip, this, 0, i);		
				}
			} else {
				hatButtonText = this.add.text(0, 0, "Unlock", textStyle);
				this.hatButtons[i].events.onInputDown.addOnce(this.unlock, this, 0, i);
			}
			this.hatButtons[i].addChild(hatButtonText);
			hatButtonText.anchor.setTo(0.5, 0.5);
		}

		// Add start button
		this.startButton = this.add.nineSlice(centerX, centerY + 150, "button", null, 200, 70);
		this.startButton.anchor.setTo(0.5, 0.5);
		this.startButton.inputEnabled = true;
		this.startButton.events.onInputDown.addOnce(this.startGame, this);
		this.startButton.events.onInputOver.add(() => { this.startButton.resize(204, 74); }, this);
		this.startButton.events.onInputOut.add(() => { this.startButton.resize(200, 70); }, this);

		this.startText = this.add.text(0, 0, "Start", textStyle);
        this.startButton.addChild(this.startText);
        this.startText.anchor.setTo(0.5, 0.5);
	}
};