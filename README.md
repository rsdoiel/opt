opt
===
revision 0.0.1
--------------

# Overview

A very simple options module for NodeJS command line apps.

# Example

Source code example-1.js

	var util = require('util'),
		opt = require('./opt'),
		config = {},
		USAGE = function () {
			return "\n\nUSAGE node example-1.js -- demo options.\n\n SYNOPSIS\n\n\t\tnode example-1.js --help ";
		};
	
	opt.set(['-h','--help'], function () {
			var help = opt.help(), ky;
	
			console.log(USAGE() + "\n\n OPTIONS\n");
			for (ky in help) {
					console.log("\t" + ky + "\t\t" + help[ky]);     
			}
			console.log("\n\n");
			process.exit(0);
	}, "This help document.");
		
	// Parse the command line options
	if (process.argv.length < 3) {
		console.log("Try using a command line option for demo:\n" + USAGE());
	} else {
		opt.parse(process.argv);
	}
	console.log("\nConfig object properties set by opt: ");
	console.log(util.inspect(config));
