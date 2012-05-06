//
// opt.js - a very simple command line option parser for NodeJS projects.
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.6
//

(function () {
	var fs = require("fs");

	var	self = {
			opts: {}, 
			help: {}, 
			consumable: [], 
			heading : false, 
			synopsis : false, 
			options: false, 
			copyright: false, 
			configuration: {}
		};
	
	// setOption = setup an option to be parsed on the command line.
	// arguments are options (e.g. a string or array of command line flags like -h, 
	// --help), a callback and help string. Callback's are passed a single 
	// parameter containing the option's passed value or true if option 
	// takes no parameters.
	var set = function(options, callback, help) {
		var i = 0;
		if (typeof options !== "string" && options.join === undefined) {
			throw ("Options should be a string or have a join method like array.");
		}
		if (typeof callback !== "function") {
			throw ("Callback must be a function");
		}
		if (help === undefined) { help = "Option is not documented"; }
	
		if (typeof options !== "string") {
			for (i = 0; i < options.length; i += 1) {
				self.opts[options[i]] = callback;
			}
			self.help[options.join(", ")] = help;
		} else {
			self.opts[options] = callback;
			self.help[options] = help;
		}
		return true;
	};
	
	// consume - removing an argument from the processed argument returned
	// by self.parse().
	var consume = function (arg) {
		self.consumable.push(arg);
	};
	
	
	// Parse the options provided. It does not alter process.argv
	var parse = function (argv) {
		var i = 0, output_argv = [];
		
		if (argv === undefined) {
			argv = process.argv;
		}
	
		// loop through command line and process args with callbacks.
		for (i = 0; i < argv.length; i += 1) {
			parts = argv[i].split("\=");
			if (typeof self.opts[parts[0]] === "function") {
				// Check to see if we need split at = or pass next arg.
				if (parts.length === 2) {
					if (parts[1][0] == '"' || parts[1][0] == "'") {
							self.opts[parts[0]](parts[1].substring(1, parts[1].length - 1));
					} else {
							self.opts[parts[0]](parts[1]);
					}
				} else if ((i + 1) < argv.length && self.opts[argv[i + 1]] === undefined) {
					self.opts[parts[0]](argv[i + 1]);
				} else {
					self.opts[parts[0]]();
				}
			}
		}
		
		if (self.consumable.length > 0) {
			argv.forEach(function (arg) {
				if (arg.indexOf("-") !== 0 &&
					self.consumable.indexOf(arg) === -1) {
					output_argv.push(arg);
				}
			});
			return output_argv;
		}
		return true;
	};
	
	// Return the aggregated help information.
	var help = function () {
		return self.help;
	};
	
	// Compose the basic command line text description
	var setup = function (heading, synopsis, options, copyright) {
		// Reset to defaults
		self.opts = {};
		self.help = {};
		self.consumable = [];
		self.heading = false;
		self.synopsis = false;
		self.options = false;
		self.copyright = false;
		self.consumable = [];
		// Now apply the options
		self.heading = heading;
		if (synopsis !== undefined) {
			self.synopsis = synopsis;
		}
		if (options !== undefined) {
			self.options = options;
		}
		if (copyright !== undefined) {
			self.copyright = copyright;
		}
		return true;
	};
	
	// Render opt's setup and exit with an error level
	var usage = function (msg, error_level) {
		var ky, headings = [];
		
		if (self.heading) {
			headings.push("\n " + self.heading);
		}
	
		if (error_level !== undefined) {
			console.error(headings.join("\n\n "));
			if (self.copyright) {
				console.error(self.copyright);
			}
			if (msg !== undefined) {
				console.error(" " + msg + "\n");
			} else {
				console.error("ERROR: process exited with an error " + error_level);
			}
			process.exit(error_level);
		}
	
		if (self.synopsis) {
			headings.push(self.synopsis);
		}
		if (self.options) {
			headings.push(self.options);
		}
	
		console.log(headings.join("\n\n "));
		for (ky in self.help) {
			console.log("\t" + ky + "\t\t" + self.help[ky]);     
		}
		console.log("\n\n");
		if (msg !== undefined) {
			console.log(" " + msg + "\n");
		}
	
		if (self.copyright) {
			console.log(self.copyright);
		}
		process.exit(0);
	};

	// Given a default configuration, search the search paths
	// for JSON file on disc with custom configuration.
	// return a resulting configuration object.	
	// default_config: is an Object
	// search_paths: is an array of search paths
	var configSync = function (default_config, search_paths) {
		var custom_config = {}, fname, src;
	
		if (search_paths !== undefined && 
			search_paths.shift !== undefined) {
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
		var scanPaths, processPath;
		
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
				} catch(json_error) {
					// We've found a config file, but there's an problem.
					callback({fname: fname, error_msg: json_error}, null);
					return;
				}
				Object.keys(default_config).forEach(function (ky) {
					if (custom_config[ky] === undefined) {
						custom_config[ky] = default_config[ky];
					}
				});
				callback(null, custom_config);
			});
		};	
	
		scanPaths = function (remaining_paths, callback) {
			var custom_config = {}, fname, src;
			
			if (remaining_paths.length > 0) {
				fname = remaining_paths.shift();
				processPath(fname, remaining_paths, callback); 
			} else {
				// we've search everyone where so
				// return the default config.
				callback(null, default_config);
			}
		};
	
		// Scan the path list until we have a config
		// or have exhausted our search.
		scanPaths(search_paths, callback);
	};
	
	if (exports === undefined) {
		exports = this;
	}

	exports.set = set;
	exports.consume = consume;
	exports.parse = parse;
	exports.help = help;
	exports.setup = setup;
	exports.usage = usage;
	exports.configSync = configSync;
	exports.config = config;
}());
