//
// example-1.js - a simple example of using opt.
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2012 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */
"use strict";

var util = require("util"),
	path = require("path"),
	opt = require("../opt").create(),
	program_name = path.basename(process.argv[1]),
	message,
	args;

opt.optionHelp("USAGE node " + program_name,
	"SYNOPSIS: Demonstrate how opt works.\n\n\t\t node " +
		program_name +
		" --help",
	"OPTIONS:",
	" copyright (c) 2012 all rights reserved\n" +
	" Released under New the BSD License.\n" +
	" See: http://opensource.org/licenses/bsd-license.php\n");

opt.option(["-m", "--message"], function (param) {
	message = param;
	opt.consume(param);
}, "message to display");
opt.option(["-h", "--help"], function () {
    opt.usage();
}, "This help document.");

// Parse the command line options
args = opt.optionWith(process.argv);
if (message) {
	console.log(message);
} else {
	opt.usage("Try using a command line option for demo:\n", 1);
}
