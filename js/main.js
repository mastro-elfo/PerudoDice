
// TODO: add to dollar
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
	var self = this;
	$.Dom.addEvent(element, 'mousedown', function(event){
		event.preventDefault();
		event.stopPropagation();
		self.start.x = event.clientX;
		self.start.y = event.clientY;
		$.Timeout.set(self.options.id, function(){
			self.start.x = null;
			self.start.y = null;
		}, self.options.delay);
	});
	$.Dom.addEvent(element, 'mousemove', function(event){
		event.preventDefault();
		event.stopPropagation();
		if (self.start.x !== null && self.start.y !== null) {
			var delta = {
				x: event.clientX - self.start.x,
				y: event.clientY - self.start.y
			};
			delta.ax = Math.abs(delta.x);
			delta.ay = Math.abs(delta.y);
			if (delta.ax > delta.ay && delta.ax > self.options.length) {
				if (delta.ay /2 < self.options.acceptance) {
					$.Dom.fireEvent(self.element, 'swipe', {
						dir: delta.x > 0? 'right': 'left',
						target: event.target
					});
				}
			}
			else if (delta.ay > self.options.length){
				if (delta.ax /2 < self.options.acceptance) {
					$.Dom.fireEvent(self.element, 'swipe', {
						dir: delta.y > 0? 'down': 'up',
						target: event.target
					});
				}
			}
		}
	});
	$.Dom.addEvent(element, 'mouseup', function(event){
		event.preventDefault();
		event.stopPropagation();
		self.start.x = null;
		self.start.y = null;
		$.Timeout.clear(self.options.id);
	});
	$.Dom.addEvent(element, 'mouseleave', function(event){
		event.preventDefault();
		event.stopPropagation();
		self.start.x = null;
		self.start.y = null;
		$.Timeout.clear(self.options.id);
	});
}

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
	$.Gesture.swipe(document.body);
	$.Dom.addEvent(document.body, 'swipe', function(event){
		dice.scramble(event.detail.dir);
	});
	/*(function(){
		var start = {
			x: null,
			y: null
		};
		var prc = 0.60;
		window.innerHeight
		$.Dom.addEvent(document.body, 'mousedown', function(event){
			start.x = event.pageX;
			start.y = event.pageY;
		});
		$.Dom.addEvent(document.body, 'mouseup', function(event){
			if (window.innerHeight *prc < Math.abs(event.pageY - start.y) || window.innerWidth *prc < Math.abs(event.pageX - start.x)) {
				dice.scramble();
			}
		});
	})();*/
	
	
	// Long press
	(function(){
		var timeout = 'longpress';
		var delay = 750;
		$.Dom.addEvent(document.body, 'mousedown', function(event){
			dice.setRemove(event, timeout);
			$.Timeout.set(timeout, function(){
				dice.remove(event);
				dice.setRemove();
			}, delay);
		});
		$.Dom.addEvent(document.body, 'mouseup', function(event){
			$.Timeout.clear(timeout);
			dice.setRemove();
		});
	})()
	
	// Reload settings on settings open
	$.Dom.addEvent('index-settings', 'click', function(){
		$.Dom.id('settings-dicenumber').value = dice.getDiceNumber();
	});
	
	// Settings done
	$.Dom.addEvent('settings-done', 'click', function(){
		dice.setDiceNumber($.Dom.id('settings-dicenumber').value);
	});
	
	document.body.setAttribute('data-ready', 'true');
});
