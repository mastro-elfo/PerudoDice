
// TODO: add to dollar
// TODO: add some randomness to dice position and angle

$.Gesture = {};
$.Gesture.swipe = function (element, options) {
	if (typeof element == 'string') {
		element = $.Dom.id(element);
	}
	this.element = element;
	this.options = options || {
		length: 200,
		delay: 150,
		id: 'swipe-timeout',
		acceptance: 20
	};
	this.start = {
		x: null,
		y: null
	};
	(function(self){
		var events = {
			'start': function(event){
				self.start.x = event.clientX;
				self.start.y = event.clientY;
				if (event.touches) {
					self.start.x = event.touches[0].clientX;
					self.start.y = event.touches[0].clientY;
				}
				$.Timeout.set(self.options.id, function(){
					self.start.x = null;
					self.start.y = null;
				}, self.options.delay);
				// DEBUG
				//$.Dom.inject($.Dom.element('div', {
				//	'style': 'position: fixed;top:'+event.clientY+'px;left:'+event.clientX+'px;width:1em;height:1em;background-color:rgba(0,0,0,0.5);border-radius:1em;'
				//}), document.body);
				// /DEBUG
			},
			'move': function(event){
				if (self.start.x !== null && self.start.y !== null) {
					var delta = {
						x: event.clientX - self.start.x,
						y: event.clientY - self.start.y
					};
					if (event.touches) {
						delta.x = event.touches[0].clientX - self.start.x;
						delta.y = event.touches[0].clientY - self.start.y;
					}
					delta.ax = Math.abs(delta.x);
					delta.ay = Math.abs(delta.y);
					if (delta.ax > delta.ay && delta.ax > self.options.length) {
						if (delta.ay /2 < self.options.acceptance) {
							self.start.x = null;
							self.start.y = null;
							$.Dom.fireEvent(self.element, 'swipe', {
								dir: delta.x > 0? 'right': 'left',
								target: event.target
							});
						}
					}
					else if (delta.ay > self.options.length){
						if (delta.ax /2 < self.options.acceptance) {
							self.start.x = null;
							self.start.y = null;
							$.Dom.fireEvent(self.element, 'swipe', {
								dir: delta.y > 0? 'down': 'up',
								target: event.target
							});
						}
					}
				}
			},
			'end': function(event){
				self.start.x = null;
				self.start.y = null;
				$.Timeout.clear(self.options.id);
			}
		};
		$.Dom.addEvent(self.element, 'mousedown', events.start);
		$.Dom.addEvent(self.element, 'touchstart', events.start);
		
		$.Dom.addEvent(self.element, 'mousemove', events.move);
		$.Dom.addEvent(self.element, 'touchmove', events.move);
		
		$.Dom.addEvent(self.element, 'mouseup', events.end);
		$.Dom.addEvent(self.element, 'mouseleave', events.end);
		$.Dom.addEvent(self.element, 'touchleave', events.end);
		$.Dom.addEvent(self.element, 'touchend', events.end);
		$.Dom.addEvent(self.element, 'touchcancel', events.end);
	})(this);
};

$.Gesture.longPress = function (element, options) {
	if (typeof element == 'string') {
		element = $.Dom.id(element);
	}
	this.element = element;
	this.options = options || {
		delay: 750,
		id: 'longpress-timeout',
	};
	(function(self){
		var events = {
			'start': function(event){
				$.Timeout.set(self.options.id, function(){
					$.Dom.fireEvent(self.element, 'longpress', {
						target: self.element
					});
				}, self.options.delay);
			},
			'end': function(event){
				$.Timeout.clear(self.options.id);
			}
		};
		
		$.Dom.addEvent(self.element, 'mousedown', events.start);
		$.Dom.addEvent(self.element, 'touchstart', events.start);
		$.Dom.addEvent(self.element, 'mouseup', events.end);
		$.Dom.addEvent(self.element, 'mouseleave', events.end);
		$.Dom.addEvent(self.element, 'touchleave', events.end);
		$.Dom.addEvent(self.element, 'touchend', events.end);
		$.Dom.addEvent(self.element, 'touchcancel', events.end);
	})(this);
};

$.Dom.addEvent(window, 'load', function(){
	
	$.L10n.setLanguage($.L10n.sniff().substring(0, 2));
	// $.L10n.setLanguage('de');
	
	// Translate all
	$.L10n.translateAll();
	
	// Add 'goto' events
	$.Each(document.body.querySelectorAll('[data-goto]'), function(item){
		$.Dom.addEvent(item, 'click', function(event){
			Page.open(event.target.getAttribute('data-goto'));
		});
	});
	
	// Add 'goback' events
	$.Each(document.body.querySelectorAll('[data-goback]'), function(item){
		$.Dom.addEvent(item, 'click', function(event){
			Page.back();
		});
	});
	
	var dice = new PerudoDice({
		'game-area': $.Dom.id('index')
	});
	
	// Swipe
	new $.Gesture.swipe($.Dom.id('index'));
	$.Dom.addEvent($.Dom.id('index'), 'swipe', function(event){
		if (!$.Dom.select('.tutorial:not(.hidden)').length) {
			dice.scramble(event.detail.dir);
		}
	});
	
	// Reload settings on settings open
	$.Dom.addEvent('index-settings', 'click', function(){
		$.Dom.id('settings-dicenumber').value = dice.getDiceNumber() || 5;
		setTimeout(function(){
			$.Dom.id('settings-dicenumber').select();
		}, 250);
	});
	
	// Settings done
	$.Dom.addEvent('settings-done', 'click', function(){
		dice.setDiceNumber(parseInt($.Dom.id('settings-dicenumber').value) || 5);
	});
	
	// Dice number input
	// Avoid non numbers
	//$.Dom.addEvent('settings-dicenumber', 'keydown', function(event){
	//	// Allow: backspace, tab, enter, escape, delete, end/home, arrows, F1/.../F12
	//	if ([8, 9, 13, 27, 46, 110, 35, 36, 37, 38, 39, 40, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123].indexOf(event.keyCode) != -1) {
	//		return;
	//	}
	//	// Allow Ctrl+A: select all
	//	if (event.keyCode == 65 && event.ctrlKey === true) {
	//		return;
	//	}
	//	// Prevent typing non numbers
	//	if (event.shiftKey && (event.keyCode < 96 || event.keyCode > 105) || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
	//		event.preventDefault();
	//	}
	//});
	
	// Watch tutorial again
	$.Dom.addEvent('settings-tutorial', 'click', function(){
		// $.Storage.set('tutorial', false);
		// location.reload();
		$.Each($.Dom.children('index', 'div', 'tutorial'), function(item){
			$.Dom.removeClass(item, 'hidden');
		});
	});
	
	// Load Storage.tutorial
	var tutorial = $.Storage.get('tutorial');
	
	$.Each($.Dom.children('index', 'div', 'tutorial'), function(item){
		if (!tutorial) {
			$.Dom.removeClass(item, 'hidden');
		}
		$.Dom.addEvent(item, 'click', function(event){
			$.Dom.addClass(event.currentTarget, 'hidden');
		});
	});
	
	$.Storage.set('tutorial', true);
	
	// Data ready
	document.body.setAttribute('data-ready', 'true');
});
