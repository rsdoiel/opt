//
// opt.js - a very simple command line option parser for NodeJS projects.
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.1
//

var	self = {
		opts : {},
		help : {}
	};

// setOption = setup an option to be parsed on the command line.
// arguments are options (e.g. a string or array of command line flags like -h, 
// --help), a callback and help string. Callback's are passed a single 
// parameter containing the option's passed value or true if option 
// takes no parameters.
set = function(options, callback, help) {
	var i = 0;
	if (typeof options !== "string" && options.join === undefined) {
		throw ("Options should be a string or have a join method like array.");
	}
	if (typeof callback !== 'function') {
		throw ("Callback must be a function");
	}
	if (help === undefined) { help = "Option is not documented"; }

	if (typeof options !== 'string') {
		for (i = 0; i < options.length; i += 1) {
			self.opts[options[i]] = callback;
		}
		self.help[options.join(',')] = help;
	} else {
		self.opts[options] = callback;
		self.help[options] = help;
	}
	return true;
};

// Parse the options provided. It does not alter process.argv
parse = function (argv) {
	var i = 0;
	
	if (argv === undefined) {
		argv = process.argv;
	}

	// loop through command line and process args with callbacks.
	for (i = 0; i < argv.length; i += 1) {
		parts = argv[i].split('\=');
		if (typeof self.opts[parts[0]] === 'function') {
			// Check to see if we need split at = or pass next arg.
                        if (parts.length === 2) {
                        	if (parts[1][0] == '"' || parts[1][0] == "'") {
        	                        self.opts[parts[0]](parts[1].substring(1,parts[1].length - 1));
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
	return true;
};

help = function () {
	return self.help;
};

exports.set = set;
exports.parse = parse;
exports.help = help;
