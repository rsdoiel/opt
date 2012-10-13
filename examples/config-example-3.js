//
// Demo a simple asynchronous configuration processing
// using a ready event.
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */
"use strict";

var path = require("path"),
	opt = require("../opt").create();

var config = { name: "fred", "email": "fred@example.com" },
	search_paths = [ "config-example-1.conf",
			path.join(process.env.HOME, ".fredrc"),
			"/usr/local/etc/fred.conf",
			"/usr/etc/fred.conf",
			"/etc/fred.conf" ];

console.log("Unprocessed config:", config);
opt.config(config, search_paths);

opt.on("ready", function (config) {
	// config should now hold the merge configuration
	// from default_config and the first configuration file 
	// found in the search path list.
	console.log("Processed config: ", config);
});
