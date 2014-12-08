
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

/**
 * Manages asyncronous processes
 * requires: Timeout
 */

$.Async = {
	/**
	 * Store different processes
	 */
	'_ids': {},
	
	/**
	 * This function is called at each timeout and calls the callback function of the process
	 * param id: id of the process
	 */
	'_loop': function(id){
		var stop = false;
		if ($.Async._ids[id].runtime.run) {
			stop = $.Async._ids[id].callback($.Async._ids[id].data, $.Async._ids[id].runtime, $.Async._ids[id].options) === false;
			$.Async._ids[id].runtime.step++;
			$.Async._ids[id].runtime.elapsed = Date.now() - $.Async._ids[id].runtime.start;
			
		}
		
		if (!stop && $.Async._ids[id].options.recall($.Async._ids[id].data, $.Async._ids[id].runtime, $.Async._ids[id].options)) {
			$.Timeout.set(id, function(){$.Async._loop(id);}, $.Async._ids[id].options.delay);
		}
		else {
			$.Async._ids[id].runtime.run = false;
		}
	},
	
	/**
	 * Start an asyncronous process
	 * param id: id of the process to start
	 * param callback: the asyncornous process function `function(data, runtime, options){ ... }`
	 *
	 *	runtime: {
	 *		'run': true,
	 * 		'start': Date.now(),
	 * 		'step': 0,
	 * 	}
	 * 
	 * param data: data that will be passed to the callback function
	 * param options: process options
	 *
	 * 	{
	 * 		'delay': 0,
	 * 		'onStop': function(){},
	 * 		'recall': function(){return true;}
	 * 	}
	 *
	 * requires: Each, Timeout
	 */
	'start': function(id, callback, data, options) {
		var _options = {
			'delay': 0,
			'onStop': function(){},
			'recall': function(){return true;}
		};
		$.Each(options, function(value, id){
			_options[id] = value;
		});
		
		if (!$.Async._ids[id]) {
			$.Async._ids[id] = {
				'callback': callback,
				'data': data,
				'options': _options,
				'runtime': {
					'run': true,
					'start': Date.now(),
					'step': 0,
				}
			};
			$.Timeout.set(id, function(){$.Async._loop(id);}, options.delay);
		}
		else if (!$.Async._ids[id].runtime.run) {
			$.Async._ids[id].runtime.run = true;
			$.Timeout.set(id, function(){$.Async._loop(id);}, options.delay);
		}
	},
	
	/**
	 * Stop an active process withoud deleteing it
	 * param id: id of the process to be stopped
	 * requires: Timeout
	 */
	'stop': function(id) {
		$.Timeout.clear(id);
		$.Async._ids[id].runtime.run = false;
	},
	
	/**
	 * Delete an active process
	 * param id: id of the process to be deleted
	 * requires: Timeout
	 */
	'delete': function(id) {
		$.Timeout.clear(id);
		delete($.Async._ids[id]);
	}
};

/**
 * Manage Dom Nodes
 */

$['Dom'] = {
	/**
	 * Alias of `document.getElementById`
	 * param id: id of the node to get
	 */
	'id': function(id) {
		return document.getElementById(id);
	},
	
	/**
	 * Returns an array of elements, children of a given one
	 * param element: element or id
	 * param tag: tagName of the children to get
	 * param a_class: class attribute to match
	 * return: array
	 * requires: Dom.id, Each, Dom.hasClass
	 */
	'children': function(element, tag, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		a_class = typeof(a_class) != 'undefined' ? a_class : false;
		// tag = tag.toUpperCase(); // ??
		
		var list = element.getElementsByTagName(tag);
		var elements = [];
		$.Each(list, function(item){
			if (!a_class || $.Dom.hasClass(item, a_class)) {
				elements.push(item);
			}
		});
		return elements;
	},
	
	/**
	 * Returns an array of elements, parents of a given one
	 * param element: element or id
	 * param tag: tagName of the children to get
	 * param a_class: class attribute to match
	 * return: array
	 * requires: Dom.id, Dom.hasClass
	 */
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
	
	/**
	 * Alias of document.querySelectorAll
	 * param selector: selector
	 */
	'select': function(selector) {
		return document.querySelectorAll(selector);
	},
	
	/**
	 * Return `true` if the given element has `a_class` in its `class` attribute, `false` otherwise
	 * param element: element or id
	 * param a_class: a class name
	 * return boolean
	 * requires: Dom.id
	 */
	'hasClass': function(element, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		return element.className.split(' ').indexOf(a_class) != -1;
	},
	
	/**
	 * Add a class to an element
	 * param element: element or id
	 * param a_class: a class name
	 * requires: Dom.id, Dom.hasClass
	 */
	'addClass': function(element, a_class) {
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		if (!$.Dom.hasClass(element, a_class)) {
			element.className += ' '+a_class;
		}
	},
	
	/**
	 * Remove a class from an element
	 * param element: element or id
	 * param a_class: a class name
	 * requires: Dom.id, Each
	 */
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
	
	/**
	 * Add an event to an element
	 * param element: element or id
	 * param event: the event name
	 * param fn: the callback function
	 * requires: Dom.id
	 */
	'addEvent': function(element, event, fn){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		element.addEventListener(event, fn);
	},
	
	/**
	 * Remove an event from an element
	 * param element: element or id
	 * param event: an event name
	 * param fn: a callback function
	 * requires: Dom.id
	 */
	'removeEvent': function(element, event, fn){
		if (typeof element == 'string') {
			element = $.Dom.id(element);
		}
		element.removeEventListener(event, fn);
	},
	
	/**
	 * Fire an event
	 * param element: element or id
	 * param event_name: the event name
	 * param data: data that will be passed to callback functions
	 * requires: Dom.id
	 */
	'fireEvent': function(element, event_name, data) {
		if(typeof element == 'string') {
			element = $.Dom.id(element);
		}
		var event = new CustomEvent(event_name, {'detail': data});
		element.dispatchEvent(event);
	},
	
	/**
	 * Create a new DOM element
	 * param tag: the tag name
	 * param attributes: attributes
	 * param content: innerHTML
	 * param events: event to be attached to this element
	 * return the new element
	 * requires: Each, Dom.addEvent
	 */
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
	
	/**
	 * Inject an element into the DOM
	 * param element: the element to be injected
	 * param container: an element or id of the container or reference element
	 * param where: ''|'first'|'before'|'after'
	 * * ''|default: append the element into container
	 * * 'first': inject element as first child of container
	 * * 'before': inject element before container
	 * * 'after': inject element after container
	 *
	 * requires: Dom.id
	 */
	'inject': function(element, container, where) {
		typeof container == 'string'? container = $.Dom.id(container) : 0;
		typeof where == 'undefined'? where = 'append' : 0;
		switch(where) {
			default:
				// Append element into container
				container.appendChild(element);
				break;
			case 'first':
				// Insert element into container in the first position
				if (container.childNodes[0]) {
					container.insertBefore(element, container.childNodes[0]);
				}
				else {
					container.appendChild(element);
				}
				break;
			case 'before':
				// Insert element before container
				container.parentNode.insertBefore(element, container);
				break;
			case 'after':
				// Insert element after container
				if (container.nextSibling) {
					container.parentNode.insertBefore(element, container.nextSibling);
				}
				else {
					container.parentNode.appendChild(element);
				}
				break;
		}
	},
	
	/**
	 * Destroy an element
	 * param element: element or id
	 * param container: element container (don't use it)
	 * requires: Dom.id
	 */
	'destroy': function(element, container) {
		if(typeof element == 'string') {
			element = $.Dom.id(element);
		}
		typeof container == 'undefined' ? container = element.parentNode : 0;
		container.removeChild(element);
	},
	
	/**
	 * Set element style
	 * param element: element or id
	 * param css_property: a property name or an object like {property_name: property_value, ...}
	 * param value: a property value if css_property is a string, ignored otherwise
	 * requires: Dom.id, Each
	 */
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

/**
 * Iterate over objects and apply a given function
 *
 * Correctly iterate objects, arrays, XPathResult and single values
 * requires: Typeof
 * param list: a list to iterate
 * param callback: callback function called at each iteration
 *
 * 	function(item, key, flags) {}
 *
 * * item: an item in the list
 * * key: the key associated to item
 * * flags: {'first': true|false, 'last': true|false}
 */

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
	/**
	 * Decode a JSON string
	 * 
	 * It uses `JSON.parse`
	 * param string: the string to be parsed
	 */
	'decode': function(string) {
		try { // if parse fails it rises an exception
			return JSON.parse(string);
		}
		catch(e) {
			return null;
		}
	},
	
	/**
	 * Encode data to JSON
	 *
	 * It uses `JSON.stringify`
	 * param data: data to be encoded
	 */
	'encode': function(data) {
		return JSON.stringify(data)
	}
};

/**
 * Localization module to translate in different languages
 */


$.L10n = {
	/**
	 * Actual language, set with setLanguage()
	 */
	_language: '',
	
	/**
	 * Translation strings
	 *
	 * 		_strings: {
	 * 			<language>: {
	 * 				<data-l10n>: <some string for innerHTML>,
	 * 				<data-l10n>: {
	 * 					'html': <some string for innerTML>,
	 * 					<attribute>: <some string for attribute>,
	 * 					...
	 * 				},
	 * 				...
	 * 			},
	 * 			...
	 * 		}
	 */
	_strings: {},
	
	/**
	 * Set the actual language
	 */
	setLanguage: function(language) {
		this._language = language;
	},
	
	/**
	 * Sniff browser language
	 */
	sniff: function(){
		return navigator.language || navigator.userLanguage;
	},
	
	/**
	 * Translate a single string in the given language or the default one
	 * return null if translation is not found
	 */
	translate: function(string, language) {
		language = language ? language : this._language;
		return  this._strings[language] ? (this._strings[language][string] || null) : null;
	},
	
	/**
	 * Apply translation in the default language
	 */
	translateAll: function() {
		var self = this;
		
		// Get all elements in Dom with 'data-l10n' attribute
		$.Each(document.body.querySelectorAll('[data-l10n]'), function(item){
			// Get the translation in the default language for the identifier given by 'data-l10n' value
			var translation = self.translate(item.getAttribute('data-l10n'));
			if (translation) {
				if (typeof translation == 'string') {
					// Translation for html
					item.innerHTML = translation;
				}
				else {
					$.Each(translation, function(value, key){
						if (key == 'html') {
							// Translation for html
							item.innerHTML = value;
						}
						else {
							// Translation for attribute
							item.setAttribute(key, value);
						}
					});
				}
			}
		});
	}
};

/**
 * Manages browser local storage
 *
 * Uses browser localStorage object
 */

$['Storage'] = {
	/**
	 * Get a value with a given key
	 * param key: a key
	 * requires: Json.decode
	 */
	'get': function(key) {
		return $.Json.decode(localStorage[key]);
	},
	
	/**
	 * Get a value with given namespace and key
	 * param namespace: a namespace
	 * param key: a key
	 * requires: Storage.get
	 */
	'getns': function(namespace, key) {
		var out = $.Storage.get(namespace);
		if (!out || typeof out[key] == 'undefined') {
			return null;
		}
		else {
			return out[key];
		}
	},
	
	/**
	 * requires: Each, Storage.set, Storage.get
	 */
	'load': function(defaults) {
		if (typeof defaults == 'undefined') {
			return;
		}
		$.Each(defaults, function(value, key){
			if ($.Storage.get(key) === null) {
				$.Storage.set(key, value);
			}
		});
	},
	
	/**
	 * Set a value with a give key
	 * param key: a key
	 * param value: a value
	 * requires: Each, Json.encode
	 */
	'set': function(key, value) {
		if (typeof key == 'object') {
			$.Each(key, function(value, key){
				localStorage[key] = $.Json.encode(value);
			});
		}
		else {
			localStorage[key] = $.Json.encode(value);
		}
	},
	
	/**
	 * Set a value with given namespace and key
	 * param namespace: a namespace
	 * param key: a key
	 * param value: a value
	 * requires: Storage.get, Typeof, Each, Storage.set
	 */
	'setns': function (namespace, key, value) {
		var obj = $.Storage.get(namespace);
		if ($.Typeof(obj) != 'object') {
			obj = {};
		}
		
		if (typeof key == 'object') {
			$.Each(key, function(value, key){
				obj[key] = value;
			});
		}
		else {
			obj[key] = value;
		}
		
		$.Storage.set(namespace, obj);
	}
};

/**
 * Manage timeouts
 */

$['Timeout'] = {
	/**
	 *
	 */
	'_id': {},
	
	/**
	 * Clear a timeout
	 * param id: timeout id to be cleared
	 */
	'clear': function(id) {
		if ($.Timeout._id[id]) {
			clearTimeout($.Timeout._id[id]);
		}
	},
	
	/**
	 * Set a new timeout
	 *
	 * If timeout already exists it will be cleared
	 * param id: the timeout id
	 * param fn: the callback function
	 * param delay: the timeout delay
	 * requires: Timeout.clear
	 */
	'set': function(id, fn, delay) {
		$.Timeout.clear(id);
		$.Timeout._id[id] = setTimeout(function(){fn();}, delay);
	}
};

/**
 * Extends javascript typeof function
 * param obj: obj test
 */

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