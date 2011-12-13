//
// example-1.js - simple example of command line option processing with opt.
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.1
//


var util = require('util'),
	opt = require('./opt'),
	config = {},
	USAGE = function () {
        return "\n\n node example-1.js -- demo options.\n\n SYNOPSIS\n\n\t\tnode example-1.js  --firstname=john \\ \n\t\t\t --last-name=doe \\ \n\t\t\t--start=\"2011-01-01\" --end=\"now\" ";
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

opt.set(['-f', '--first-name'], function (first_name) {
        config.first_name = first_name;
}, "Set the first name column contents. E.g. John");

opt.set(['-l', '--last-name'], function (last_name) {
    config.last_name = last_name;
}, "Set the last name column contents. E.g. Doe");


opt.set(['-s','--start'], function(start_date) {
        config.start = start_date;
}, "Set the start date for reporting in YYYY-MM-DD format.");

opt.set(['-e','--end'], function(end_date) {
        if (end_date.length == 10 &&
                end_date.match(/20[0-2][0-9]-[0-3][0-9]-[0-3][0-9]/)) {
                config.end = end_date;
        } else {
                config.end = today.getFullYear() + '-' + 
                        String("0" + (today.getMonth() + 1)).substr(-2) + '-' +
                        String("0" + (today.getDate())).substr(-2);
        }
}, "Set the last date for reporting.  Usually a date in YYYY-MM-DD format or 'now'.");

// Parse the command line options
if (process.argv.length < 3) {
	console.log("Try using a command line option for demo:\n" + USAGE());
	process.exit(1);
} else {
	opt.parse(process.argv);
}
console.log("\nConfig object properties set by opt: ");
console.log(util.inspect(config));
