//
// opt.js - a very simple command line option parser and RESTful parse for NodeJS projects.
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under the Simplified BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.10
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

var fs = require("fs"),
	events = require("events"),
	util = require("util"),
	url = require("url"),
	querystring = require("querystring");


// option = set an option to be parsed on the command line.
// arguments are options (e.g. a string or array of command line flags like -h, 
// --help), a callback and help string. Callback's are passed a single 
// parameter containing the option's passed value or true if option 
// takes no parameters.
// @param options {array} a list of options (e.g. -h, --help)
// @param callback {function} a function to call when option is discovered
// @param help_message {string} an explanation of the option
// @return {boolean} true on success, throw exception otherwise
var option = function (options, callback, help_message) {
	var i = 0;
	if (typeof options !== "string" && options.join === undefined) {
		throw ("Options should be a string or have a join method like array.");
	}
	if (typeof callback !== "function") {
		throw ("Callback must be a function");
	}
	if (help_message === undefined) {
		help_message = "Option is not documented";
	}

	if (typeof options === "object" && options.length) {
		for (i = 0; i < options.length; i += 1) {
			this.opts[options[i]] = callback;
		}
		this.option_messages[options.join(", ")] = help_message;
	} else {
		console.error("No options defined. Must be an array.");
		return false;
	}
	return true;
};


// consume - removing an argument from the processed argument returned
// by opt.parse().
var consume = function (arg) {
	this.consumable.push(arg);
};

// helpText - build simple plain text versions of "Help" from the options
// defined by opt.option().
var helpText = function (msg) {
	var self = this,
		lines = [];
	
	if (this.heading !== undefined) {
		lines.push(" " + self.heading + "\n");
	}

	if (this.synopsis !== undefined) {
		lines.push(" " + self.synopsis + "\n");
	}

	if (this.options !== undefined) {
		lines.push(" " + self.options + "\n");
	}

	Object.keys(self.option_messages).forEach(function (ky) {
		lines.push("\t" + ky + "\t\t" + self.option_messages[ky].trim() + "\n");
	});
	lines.push("\n");

	if (msg !== undefined) {
		lines.push(" " + msg + "\n");
	}

	if (this.copyright !== undefined) {
		lines.push(" " + this.copyright + "\n");
	}
	return lines.join("");
};


// optionWith the options provided. It does not alter process.argv
// @param argv {object} usually process.argv
// @return {object} or {boolean} return true if successful or the modified argv is consumable is used.
var optionWith = function (argv) {
	var self = this, i = 0, output_argv = [], parts;

	if (argv === undefined) {
		argv = process.argv;
	}
	// loop through command line and process args with callbacks.
	for (i = 0; i < argv.length; i += 1) {
		parts = argv[i].split("=");
		if (typeof this.opts[parts[0]] === "function") {
			// Check to see if we need split at = or pass next arg.
			if (parts.length === 2) {
				if (parts[1][0] === '"' || parts[1][0] === "'") {
					this.opts[parts[0]](parts[1].substring(1, parts[1].length - 1));
				} else {
					this.opts[parts[0]](parts[1]);
				}
			} else if ((i + 1) < argv.length && argv[i + 1] !== undefined) {
				this.opts[parts[0]](argv[i + 1]);
			} else {
				this.opts[parts[0]]();
			}
		}
	}

	if (self.consumable.length > 0) {
		argv.forEach(function (arg) {
			if (arg.indexOf("-") !== 0 && self.consumable.indexOf(arg) === -1) {
				output_argv.push(arg);
			}
		});
		return output_argv;
	}
	return true;
};


// setup how opt with build the basic command line text description.
// @param heading {string} The heading block as text
// @param synopsis {string} The synopsis block as text
// @param options {string} The prefix to the options block as text.
// @param copyright {string} The copyright or credits block as text.
var optionHelp = function (heading, synopsis, options, copyright) {
	// Now apply the options
	this.heading = heading;
	if (synopsis !== undefined) {
		this.synopsis = synopsis;
	}
	if (options !== undefined) {
		this.options = options;
	}
	if (copyright !== undefined) {
		this.copyright = copyright;
	}
	return true;
};


// Render opt's usage text and exit with an error level
// @param msg {string} optional message to include in the usage text rendered
// @param error_level {number} an integer, 0 is no error, greater then zero is an OS level error level.
var usage = function (msg, error_level) {
	var self = this, ky, println = console.log;

	if (error_level === undefined || error_level === 0) {
		error_level = 0;
		println = console.log;
	} else {
		println = console.error;
	}

	if (this.heading) {
		println(" " + this.heading + "\n");
	}

	if (this.synopsis) {
		println(" " + this.synopsis + "\n");
	}

	if (this.options) {
		println(" " + this.options + "\n");
	}

	Object.keys(this.option_messages).forEach(function (ky) {
		println("\t" + ky + "\t\t" + self.option_messages[ky].trim() + "\n");
	});

	if (msg !== undefined) {
		println(" " + msg + "\n");
	}

	if (this.copyright) {
		println(" " + this.copyright + "\n");
	}
	process.exit(error_level);
};


// Given a default configuration, search the search paths
// for JSON file on disc with custom configuration.
// return a resulting configuration object.	
// default_config: is an Object
// search_paths: is an array of search paths
// @param default_config {object} the default configuration to build from
// @param search_paths {array} a list of search path to read a configuration file from
// @return {object} the resolved configuration file
var configSync = function (default_config, search_paths) {
	var custom_config = {}, fname, src;

	if (search_paths !== undefined && search_paths.shift !== undefined) {
		fname = search_paths.shift();
	} else {
		fname = false;
	}
	while (fname) {
		try {
			src = fs.readFileSync(fname).toString();
		} catch (err) {
			src = "";
		}
		if (src) {
			fname = false;
			custom_config = JSON.parse(src);
		} else {
			fname = search_paths.shift();
		}
	}

	if (src) {
		// Override the default config with the custom configuration
		Object.keys(default_config).forEach(function (ky) {
			if (custom_config[ky] === undefined) {
				custom_config[ky] = default_config[ky];
			}
		});
	} else {
		custom_config = default_config;
	}

	return custom_config;
};


// Given a default configuration, search the search paths
// for JSON file on disc with custom configuration.
// return a resulting configuration object.	
// default_config: is an Object
// search_paths: is an array of search paths
// @param default_config {object} the default configuration to build from
// @param search_paths {array} a list of search path to read a configuration file from
// @param callback {function} the callbakc to execute after configuration is resolve. 
// the argument passed the callback is the resolved configuration object.
var config = function (default_config, search_paths, callback) {
	var self = this, scanPaths, processPath;

	// Recursive attempt to read the configuration
	processPath = function (fname, remaining_paths, callback) {
		fs.readFile(fname, function (err, buf) {
			var custom_config;
			if (err || buf.length === 0) {
				scanPaths(remaining_paths, callback);
				return;
			}
			try {
				custom_config = JSON.parse(buf.toString());
			} catch (json_error) {
				// We've found a config file, but there's an problem.
				if (callback) {
					callback({fname: fname, error_msg: json_error}, null);
				} else {
					self.emit("error", {fname: fname, error_msg: json_error});
				}
				return;
			}
			Object.keys(default_config).forEach(function (ky) {
				if (custom_config[ky] === undefined) {
					custom_config[ky] = default_config[ky];
				}
			});
			if (callback) {
				callback(null, custom_config);
			} else {
				self.emit("ready", custom_config);
			}
		});
	};

	scanPaths = function (remaining_paths, callback) {
		var fname;

		if (remaining_paths.length > 0) {
			fname = remaining_paths.shift();
			processPath(fname, remaining_paths, callback);
		} else {
			// we've search everywhere so
			// return the default config.
			if (callback) {
				callback(null, default_config);
			} else {
				self.emit("ready", default_config);
			}
		}
	};

	// Scan the path list until we have a config
	// or have exhausted our search.
	scanPaths(search_paths, callback);
};


// rest - define a restful interaction
// @param method {string} this type of method being defined (e.g. GET, POST, DELETE, PUT)
// @param path_expression {RegExp} a regular expression expression describing the RESTful path
// @param callback_or_event_name {function|string} the function to respond to the http request with.
// @param help_message - short documentation string for RESTful help page.
// @return {object} containing the method type and rule number in that method list.
var rest = function (method, path_expression, callback_or_event_name, help_message) {
	var re, callback = false, event_name = false, rule_no;
	
	if (typeof path_expression === "string") {
		try {
			re = new RegExp(path_expression);
		} catch (err) {
			console.error(path_expression, err);
		}
	} else {
		re = path_expression;
	}
	// defined the method list if not previously defined
	if (this.restful[method.toLowerCase()] === undefined) {
		this.restful[method.toLowerCase()] = [];
	}
	
	if (typeof callback_or_event_name === "function") {
		callback = callback_or_event_name;
	} else {
		event_name = callback_or_event_name;
	}
	// Now add the RegExp, etc. to the method list
	this.restful[method].push({
		re: re,
		callback: callback,
		event_name: event_name
	});
	rule_no = this.restful[method].length - 1;
	return {method: method, rule_no: rule_no};
};

// restWith - process the request and response provided by http.server() against the rest interactions defined.
var restWith = function (request, response) {
	var self = this, i, method, url_parts = url.parse(request.url),
		re_found = false, matching = false;
	
	// Get the method requested
	if (this.restful[request.method.toLowerCase()] !== undefined) {
		method = this.restful[request.method.toLowerCase()];
	} else {
		method = [];
	}

	// Check if path expression has been defined for that
	for (i = 0; i < method.length && re_found === false; i += 1) {
		matching = request.url.match(method[i].re);
		if (matching !== null) {
			// Process and trigger event or make callback.
			if (method[i].callback !== false) {
				method[i].callback(request, response, matching, i);
			} else if (method[i].event_name !== false) {
				this.emit(method[i].event_name, {request: request, response: response, matching: matching, rule_no: i});
			}
			re_found = true;
		}
	}
	if (re_found === false) {
		response.writeHead(404, "text/plain");
		response.end("File not found.");
	}
	return re_found;
};
	
// unrest = Remove a RESTful rule from processing by restWith();
// ENHANCEMENT: need a method to dynamic remove rules if needed.

// restHelp - generate documentation on the API invoked by restWith().
// @return {string}
var restHelp = function () {
	return this.helpText();
};

// A constructor to created an EventEmitter
// version of opt. 
// @constructor
// @return {object} a new instance of the Opt object
var Opt = function () {
	this.opts = {};
	this.option_messages = {};
	this.restful = {};
	this.restful_messages = {};
	this.consumable = [];
	this.heading = false;
	this.synopsis = false;
	this.options = false;
	this.copyright = false;
	this.consumable = [];
	
	events.EventEmitter.call(this);
};
util.inherits(Opt, events.EventEmitter);

Opt.prototype.consume = consume;
Opt.prototype.usage = usage;
Opt.prototype.helpText = helpText;
Opt.prototype.configSync = configSync;
Opt.prototype.config = config;
	
Opt.prototype.option = option;
Opt.prototype.optionWith = optionWith;
Opt.prototype.optionHelp = optionHelp;

Opt.prototype.rest = rest;
Opt.prototype.restWith = restWith;
Opt.prototype.restHelp = restHelp;

var create = function () {
	return new Opt();
};

exports.Opt = Opt;
exports.create = create;
exports.helpText = helpText;
exports.consume = consume;
exports.usage = usage;
exports.configSync = configSync;
exports.config = config;

exports.option = option;
exports.optionWith = optionWith;
exports.optionHelp = optionHelp;

exports.rest = rest;
exports.restWith = restWith;
exports.restHelp = restHelp;

