
/**
 * Constructor
 * param options:
 */
var PerudoDice = function (options) {
	this._options = options || {
		'game-area': document.body
	};
	
	// TODO: initialize game
	// TODO: start with 5 dice
	// TODO: draw dice
};

PerudoDice.prototype.scramble = function () {
	alert('Scramble');
	// TODO
};

PerudoDice.prototype.remove = function (event) {
	if ($.Dom.hasClass(event.target, 'dice')) {
		alert('Remove');
		// TODO
	}
};

PerudoDice.prototype.getDiceNumber = function () {
	// TODO
	return 0;
}

PerudoDice.prototype.setDiceNumber = function(value) {
	// TODO
}