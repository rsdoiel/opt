//
// opt.js - a very simple command line option parser for NodeJS projects.
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.8
//

/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true, stupid: true */

var fs = require("fs"),
	events = require("events"),
	util = require("util");


// option = setup an option to be parsed on the command line.
// arguments are options (e.g. a string or array of command line flags like -h, 
// --help), a callback and help string. Callback's are passed a single 
// parameter containing the option's passed value or true if option 
// takes no parameters.
var set = function (options, callback, help_message) {
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

	if (typeof options !== "string") {
		for (i = 0; i < options.length; i += 1) {
			this.opts[options[i]] = callback;
		}
		this.help_messages[options.join(", ")] = help_message;
	} else {
		this.opts[options] = callback;
		this.help_messages[options] = help_message;
	}
	return true;
};

// consume - removing an argument from the processed argument returned
// by opt.parse().
var consume = function (arg) {
	this.consumable.push(arg);
};


// Parse the options provided. It does not alter process.argv
var parse = function (argv) {
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
			} else if ((i + 1) < argv.length && this.opts[argv[i + 1]] === undefined) {
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

// Compose the basic command line text description
var setup = function (heading, synopsis, options, copyright) {
	// Reset to defaults
	this.opts = {};
	this.help_messages = {};
	this.consumable = [];
	this.heading = false;
	this.synopsis = false;
	this.options = false;
	this.copyright = false;
	this.consumable = [];
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

// Render opt's setup and exit with an error level
var usage = function (msg, error_level) {
	var self = this, ky, headings = [];

	if (error_level !== undefined) {
		if (self.heading) {
			console.error("\n " + self.heading + "\n");
		}
	
		if (this.synopsis) {
			console.error("\n " + this.synopsis + "\n");
		}
	
		if (this.options) {
			console.error("\n " + this.options + "\n");
		}

		if (this.copyright) {
			console.error("\n " + this.copyright + "\n");
		}

		if (msg !== undefined) {
			console.error("\n " + msg + "\n");
		} else {
			console.error("ERROR: process exited with an error " + error_level);
		}
		process.exit(error_level);
	} else {
		if (self.heading) {
			console.log("\n " + self.heading + "\n");
		}
	
		if (this.synopsis) {
			console.log("\n " + this.synopsis + "\n");
		}
	
		if (this.options) {
			console.log("\n " + this.options + "\n");
		}

		if (this.copyright) {
			console.log("\n " + this.copyright + "\n");
		}
		console.log(headings.join("\n\n "));
		Object.keys(self.help_messages).forEach(function (ky) {
			console.log("\t" + ky + "\t\t" + self.help_messages[ky]);
		});
		console.log("\n\n");
		if (msg !== undefined) {
			console.log(" " + msg + "\n");
		}
	
		if (self.copyright) {
			console.log(self.copyright);
		}
		process.exit(0);
	}
};

// Given a default configuration, search the search paths
// for JSON file on disc with custom configuration.
// return a resulting configuration object.	
// default_config: is an Object
// search_paths: is an array of search paths
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


// Return the aggregated help information.
var help = function () {
	return this.help_messages;
};


// A constructor to created an EventEmitter
// version of opt. 
var create = function () {
    var Opt = function () {
        this.opts = {};
        this.help_messages = {};
        this.consumable = [];
        this.heading = false;
        this.synopsis = false;
        this.options = false;
        this.copyright = false;
        this.configuration = {};
    
        this.set = set;
        this.consume = consume;
        this.parse = parse;
        this.help = help;
        this.setup = setup;
        this.usage = usage;
        this.configSync = configSync;
        this.config = config;
        events.EventEmitter.call(this);
    };
    util.inherits(Opt, events.EventEmitter);
    
	return new Opt();
};

exports.create = create;
exports.set = set;
exports.consume = consume;
exports.parse = parse;
exports.help = help;
exports.setup = setup;
exports.usage = usage;
exports.configSync = configSync;
exports.config = config;
