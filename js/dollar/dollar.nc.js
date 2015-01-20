/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 mastro-elfo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
var $ = {};
$['Dom'] = {
	'id': function(id) {
		return document.getElementById(id);
	},
	'children': function(element, tag, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		a_class = typeof(a_class) != 'undefined' ? a_class : false;
		var list = element.getElementsByTagName(tag);
		var elements = [];
		$.Each(list, function(item){
			if (!a_class || $.Dom.hasClass(item, a_class)) {
				elements.push(item);
			}
		});
		return elements;
	},
	'parents': function(element, tag, a_class){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		a_class = typeof(a_class) != 'undefined' ? a_class : false;
		tag = tag.toUpperCase();
		var parents = [];
		var parent = element.parentNode;
		while(parent && parent.tagName) {
			if (parent.tagName == tag && (!a_class || $.Dom.hasClass(parent, a_class))) {
				parents.push(parent);
			}
			parent = parent.parentNode;
		}
		return parents;
	},
	'select': function(selector) {
		return document.querySelectorAll(selector);
	},
	'hasClass': function(element, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		return element.className.split(' ').indexOf(a_class) != -1;
	},
	'addClass': function(element, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		if (!$.Dom.hasClass(element, a_class)) {
			element.className += ' '+a_class;
		}
	},
	'removeClass': function(element, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		var classes = element.className.split(' ');
		var idx = 0;
		while((idx = classes.indexOf(a_class)) != -1) {
			classes.splice(idx, 1);
		}
		element.className = '';
		$.Each(classes, function(item){
			element.className += ' '+item;
		});
	},
	'addEvent': function(element, event, fn){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		element.addEventListener(event, fn);
	},
	'removeEvent': function(element, event, fn){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		element.removeEventListener(event, fn);
	},
	'fireEvent': function(element, event_name, data) {
		if(typeof element == 'string') {
			element = $.Dom.id(element);
		}
		var event = new CustomEvent(event_name, {'detail': data});
		element.dispatchEvent(event);
	},
	'element': function(tag, attributes, content, events) {
		typeof attributes == 'undefined' ? attributes = {} : 0;
		typeof content == 'undefined' ? content = '' : 0;
		typeof events == 'undefined' ? events = {} : 0;
		var element = document.createElement(tag);
		$.Each(attributes, function(value, key){
			element.setAttribute(key, value);
		});
		$.Each(events, function(value, key){
			$.Dom.addEvent(element, key, value);
		});
		element.innerHTML = content;
		return element;
	},
	'inject': function(element, container, where) {
		typeof container == 'string'? container = $.Dom.id(container) : 0;
		typeof where == 'undefined'? where = 'append' : 0;
		switch(where) {
			default:
				container.appendChild(element);
				break;
			case 'first':
				if (container.childNodes[0]) {
					container.insertBefore(element, container.childNodes[0]);
				}
				else {
					container.appendChild(element);
				}
				break;
			case 'before':
				container.parentNode.insertBefore(element, container);
				break;
			case 'after':
				if (container.nextSibling) {
					container.parentNode.insertBefore(element, container.nextSibling);
				}
				else {
					container.parentNode.appendChild(element);
				}
				break;
		}
	},
	'destroy': function(element, container) {
		if(typeof element == 'string') {
			element = $.Dom.id(element);
		}
		typeof container == 'undefined' ? container = element.parentNode : 0;
		container.removeChild(element);
	},
	'style': function(element, css_property, value){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		var _foo = function(key, value){
			key = key.replace(/(\-)([a-z])/, function(a){return a[1].toUpperCase();});
			element.style[key] = value;
		}
		if (typeof css_property == 'object') {
			$.Each(css_property, function(value, key){
				_foo(key, value);
			});
		}
		else {
			_foo(css_property, value);
		}
	}
};
$['Each'] = function(list, callback) {
	var flags = {
		'first': true,
		'last': false
	};
	var type = $.Typeof(list);
	if (type == 'array') {
		for(var i=0; i<list.length; i++) {
			flags = {
				'first': i==0,
				'last': i==list.length -1
			};
			if (callback(list[i], i, flags) === false) {
				break;
			}
		}
	}
	else if (typeof list.iterateNext != 'undefined') {
		var node = list.iterateNext();
		var i=0;
		flags.last = null;
		while(node) {
			if (callback(node, i, flags) === false) {
				break;
			}
			flags.first = false;
			node = list.iterateNext();
		}
	}
	else if (type == 'object') {
		var size = 0;
		for(var i in list) {
			size++;
		}
		var count = 0;
		for(var i in list) {
			flags = {
				'first': count==0,
				'last': count==size -1
			};
			if (callback(list[i], i, flags) === false) {
				break;
			}
			count++;
		}
	}
	else {
		callback(list, 0, {
			'first': true,
			'last': true
		});
	}
};
$['Json'] = {
	'decode': function(string) {
		try { 
			return JSON.parse(string);
		}
		catch(e) {
			return null;
		}
	},
	'encode': function(data) {
		return JSON.stringify(data)
	}
};
$.L10n = {
	_language: '',
	_strings: {},
	setLanguage: function(language) {
		this._language = language;
	},
	sniff: function(){
		return navigator.language || navigator.userLanguage;
	},
	translate: function(string, language) {
		language = language ? language : this._language;
		return  this._strings[language] ? (this._strings[language][string] || null) : null;
	},
	translateAll: function() {
		var self = this;
		$.Each(document.body.querySelectorAll('[data-l10n]'), function(item){
			var translation = self.translate(item.getAttribute('data-l10n'));
			if (translation) {
				if (typeof translation == 'string') {
					item.innerHTML = translation;
				}
				else {
					$.Each(translation, function(value, key){
						if (key == 'html') {
							item.innerHTML = value;
						}
						else {
							item.setAttribute(key, value);
						}
					});
				}
			}
		});
	}
};
$['Storage'] = {
	'get': function(key) {
		return $.Json.decode(localStorage[key]);
	},
	'set': function(key, value) {
		if (typeof key == 'object') {
			$.Each(key, function(value, key){
				localStorage[key] = $.Json.encode(value);
			});
		}
		else {
			localStorage[key] = $.Json.encode(value);
		}
	}
};
$['Timeout'] = {
	'_id': {},
	'clear': function(id) {
		if ($.Timeout._id[id]) {
			clearTimeout($.Timeout._id[id]);
		}
	},
	'set': function(id, fn, delay) {
		$.Timeout.clear(id);
		$.Timeout._id[id] = setTimeout(function(){fn();}, delay);
	}
};
$['Typeof'] = function(obj) {
	var type = typeof(obj);
	if (obj == null) {
		return 'undefined';
	}
	else if (type == 'object') {
		return !!obj.length || obj.length == 0 ? 'array' : 'object';
	}
	else {
		return type;
	}
};