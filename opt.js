//
// opt.js - a very simple command line option parser for NodeJS projects.
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.2e
//
var	self = {
		opts : {},
		help : {},
		heading : false,
		synopsis : false,
		options: false,
		copyright: false
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
var parse = function (argv) {
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

var help = function () {
	return self.help;
};

var setup = function (heading, synopsis, options, copyright) {
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
};

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

exports.set = set;
exports.parse = parse;
exports.help = help;
exports.setup = setup;
exports.usage = usage;
