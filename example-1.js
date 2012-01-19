//
// example-1.js - a simple example of using opt.
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2012 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.2c
//
var util = require('util'),
	opt = require('./opt');

opt.setup("USAGE node example-1.js.",
	"SYNOPSIS: Demonstrate how opt works.\n\n\t\t node example-1.js --help",
	"OPTIONS",
	" copyright (c) 2012 all rights reserved\n" +
	" Released under New the BSD License.\n" +
	" See: http://opensource.org/licenses/bsd-license.php\n");
opt.set(['-h','--help'], opt.usage, "This help document.");
	
// Parse the command line options
if (process.argv.length < 3) {
	console.log("Try using a command line option for demo:\n" + opt.usage());
} else {
	opt.parse(process.argv);
}
