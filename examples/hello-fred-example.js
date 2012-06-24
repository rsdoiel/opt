//
// hello-fred-example.js - demonstrate supporting a configuration file
// with command line overrides.
//
"use strict";

/*
Fred's Problem:

	Fred wants a command line tool to say hello and optionally remind him
	of his email address. Fred likes configuration files but sometimes he
	stores them in different places (e.g. $HOME/fred.cnf,
	/usr/etc/fred.cnf, and /etc/fred.cnf).  Fred make lots of typos so he
	would like to setup the configuration with this program and generate a
	valid JSON file based in it.
*/

var fs = require("fs"),
	path = require("path"),
	opt = require("opt").create(),
	default_config = {
        name: "fred",
        email: "fred@example.com",
		show_email: false
    },
	config = {},
	config_only = false,
	config_filename = "";

// Check a search path and pickup the first configuration file found
config = opt.configSync(default_config, [
	path.join(process.env.HOME, "fred.cnf"),
	"/usr/etc/fred.cnf",
	"/etc/fred.cnf"
]);

// Setup some helpful command line info	
opt.setup("USAGE node " + path.basename(process.argv[1]),
		"SYNOPSIS: Demonstrate how opt works.\n\n\t\t node " +
				path.basename(process.argv[1]) + " --email",
		"OPTIONS",
		" copyright (c) 2012 all rights reserved\n" +
		" Released under New the BSD License.\n" +
		" See: http://opensource.org/licenses/bsd-license.php\n");

// Use a specific configuration file
opt.set(["-c", "--config"], function (config_filename) {
	if (config_filename) {
		config = opt.configSync(default_config, [config_filename]);
		opt.consume(config_filename);
	}
}, "Use a specific configuration file");

// Optionally show Fred's email address
opt.set(["-e", "--email"], function () {
	config.show_email = true;
}, "Show the email address.");

opt.set(["-E", "--no-email"], function () {
	config.show_email = false;
}, "Don't show the email address.");

// Generate and write a configuration file.
opt.set(["-g", "--generate"], function (param) {
	config_only = true;
	if (param !== undefined && param.trim() !== "") {
		config_filename = param.trim();
	}
	opt.consume(param);
}, "Generate a configuration JSON expression. Optionally save it to a file.");

opt.set(["-h", "--help"], function () {
    opt.usage();
}, "This help document.");

// Process the command line arguments
opt.parse(process.argv);

//
// Now that everything is configured do what Fred wants.
//
if (config_only === true) {
	if (config_filename === "") {
		console.log(JSON.stringify(config));
	} else {
		fs.writeFile(config_filename, JSON.stringify(config),
			function (err) {
				if (err) {
					console.error("ERROR: can't write", config_filename);
					process.exit(1);
				}
				console.log("Wrote configuration to", config_filename);
				process.exit(0);
			});
	}
} else {
	process.stdout.write("\nHello " + config.name);
	if (config.show_email === true) {
		process.stdout.write(",\n\n\tYour email address is " +
				config.email + "\n\n");
	} else {
		process.stdout.write("\n\n");
	}
}
