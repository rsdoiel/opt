//
// example-2.js - more realistic simple example of command line option processing with opt.
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */
"use strict";
var util = require("util"),
	path = require("path"),
	opt = require("../opt").create(),
	config = {},
	today = new Date();

opt.optionHelp("USAGE:  node " + path.basename(process.argv[1]) + " --help",
	"SYNOPSIS: demo a realistic example of using opt.\n\n\t\tnode " + path.basename(process.argv[1]) + "  --first-name=john \\ \n\t\t\t --last-name=doe \\ \n\t\t\t--start=\"2011-01-01\" --end=\"now\"",
	"OPTIONS:",
	" copyright (c) 2011 all rights reserved\n" +
	" Released under New the BSD License.\n" +
	" See: http://opensource.org/licenses/bsd-license.php\n");
opt.option(["-h", "--help"], function () {
    opt.usage();
}, "This help document.");

opt.option(["-f", "--first-name"], function (first_name) {
	config.first_name = first_name;
}, "Set the first name column contents. E.g. John");

opt.option(["-l", "--last-name"], function (last_name) {
    config.last_name = last_name;
}, "Set the last name column contents. E.g. Doe");


opt.option(["-s", "--start"], function (start_date) {
	config.start = start_date;
}, "Set the start date for reporting in YYYY-MM-DD format.");

opt.option(["-e", "--end"], function (end_date) {
	if (end_date.length === 10 &&
			end_date.match(/20[0-2][0-9]-[0-3][0-9]-[0-3][0-9]/)) {
		config.end = end_date;
	} else {
		config.end = today.getFullYear() + "-" +
			String("0" + (today.getMonth() + 1)).substr(-2) + "-" +
			String("0" + (today.getDate())).substr(-2);
	}
}, "Set the last date for reporting.  Usually a date in YYYY-MM-DD format or \"now\".");

// Parse the command line options
if (process.argv.length < 3) {
	console.log("Try using a command line option for demo:\n" + opt.usage());
	process.exit(1);
} else {
	opt.optionWith(process.argv);
}
console.log("\nConfig object properties set by opt: ");
console.log(util.inspect(config));
