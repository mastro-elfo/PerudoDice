
/**
 * Constructor
 * param options:
 */
var PerudoDice = function (options) {
	this._options = options || {};
	this._options['game-area'] = options['game-area'] || document.body;
	this._options['delta'] = options['delta'] || {
		x: 5,
		y: 5,
		a: 360
	};
	
	this._dice = [];
	this.setDiceNumber(5);
	this._setRemove = null;
};

PerudoDice.prototype.scramble = function (dir) {
	var self = this;
	// all dice should go out of the screen
	$.Each(this._dice, function(die){
		$.Dom.style(die._element, {
			'top': '-2em',
			'left': '50%',
			'transform': 'rotate(0deg)'
		});
	});
	
	$.Timeout.set('roll', function(){
		// set random values
		$.Each(self._dice, function(die){
			die.setValue(Math.floor(Math.random() *6 +1));
		});
		// all dice rolled that value
		$.Each(self._dice, function(die){
			$.Dom.style(die._element, {
				'top': (die._position.y +((Math.random() *2 -1) *self._options.delta.y))+'%',
				'left': (die._position.x +((Math.random() *2 -1) *self._options.delta.x))+'%',
				'transform': 'rotate('+((Math.random() *2 -1) *self._options.delta.a)+'deg)'
			});
		});
	}, 1000);
};

/**
 * Set class to remove a die
 */
PerudoDice.prototype.setRemove = function (event, timeoutId) {
	if (event && $.Dom.hasClass(event.target, 'die')) {
		$.Each(this._dice, function(die){
			if (die._index == event.target.getAttribute('data-index')) {
				$.Dom.addEvent(event.target, 'mouseout', function(){
					$.Timeout.clear(timeoutId);
					$.Dom.removeEvent(this, 'mouseout');
				});
				return false;
			}
			return true;
		});
	}
	else {
		
	}
}

PerudoDice.prototype.remove = function (index) {
	var self = this;
	$.Each(this._dice, function(die, key){
		if (die._index == index) {
			die.remove();
			self._dice.splice(key, 1);
			return false;
		}
		return true;
	});
};

PerudoDice.prototype.getDiceNumber = function () {
	return this._dice.length;
}

PerudoDice.prototype.setDiceNumber = function(value) {
	$.Each(this._dice, function(die){
		die.remove(true);
	});
	this._dice = [];
	var position = [
		{
			x: 25,
			y: 25
		},
		{
			x: 25,
			y: 75
		},
		{
			x: 75,
			y: 25
		},
		{
			x: 75,
			y: 75
		},
		{
			x: 50,
			y: 50
		}
	];
	var self = this;
	for (var i=0; i<value; i++) {
		this._dice[i] = new Die(i, position[i]);
		$.Dom.inject(this._dice[i]._element, this._options['game-area']);
		new $.Gesture.longPress(this._dice[i]._element);
		$.Dom.addEvent(this._dice[i]._element, 'longpress', function(event){
			self.remove(event.target.getAttribute('data-index'));
		});
	}
}

var Die = function(index, position) {
	this._index = index;
	this._position = position;
	this._element = $.Dom.element('div', {
		'class': 'die',
		'data-index': index
	});
	$.Dom.style(this._element, {
		'top': position.y+'%',
		'left': position.x+'%'
	});
	this.setValue(1);
}

Die.prototype.setValue = function (value) {
	this._value = value;
	this._element.innerHTML = '';
	if (value == 1) {
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet cc'
		}), this._element);
	}
	else if (value == 2) {
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet tl'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet br'
		}), this._element);
	}
	else if (value == 3) {
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet cc'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet tl'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet br'
		}), this._element);
	}
	else if (value == 4) {
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet tl'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet tr'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet bl'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet br'
		}), this._element);
	}
	else if (value == 5) {
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet cc'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet tl'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet tr'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet bl'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet br'
		}), this._element);
	}
	else if (value == 6) {
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet tl'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet cl'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet bl'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet tr'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet cr'
		}), this._element);
		$.Dom.inject($.Dom.element('div', {
			'class': 'bullet br'
		}), this._element);
	}
}

Die.prototype.remove = function (fast) {
	var self = this;
	fast = fast || false;
	if (fast) {
		$.Dom.destroy(self._element);
	}
	else {
		$.Dom.style(this._element, 'font-size', 0);
		$.Timeout.set('remove-die', function(){
			$.Dom.destroy(self._element);
		}, 500);
	}
}