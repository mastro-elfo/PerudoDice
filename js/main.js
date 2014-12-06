
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
	
	var dice = new PerudoDice();
	
	// Swipe
	(function(){
		var start = {
			x: null,
			y: null
		};
		var prc = 0.75;
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
	})();
	
	
	// Long press
	(function(){
		var timeout = 'longpress';
		var delay = 750;
		$.Dom.addEvent(document.body, 'mousedown', function(event){
			$.Timeout.set(timeout, function(){
				dice.remove(event);
			}, delay);
		});
		$.Dom.addEvent(document.body, 'mouseup', function(event){
			$.Timeout.clear(timeout);
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
