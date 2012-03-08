opt
===
revision 0.0.2
--------------

# Overview

A very simple options module for NodeJS command line apps.

# Examples

Source code example-1.js

	var util = require('util'),
		opt = require('./opt');
	
	opt.setup("USAGE node example-1.js.",
		"SYNOPSIS\n\n\t\tDemon straight how opt works: node example-1.js --help",
		"OPTIONS");
	opt.set(['-h','--help'], opt.usage, "This help document.");
		
	// Parse the command line options
	if (process.argv.length < 3) {
		console.log("Try using a command line option for demo:\n" + opt.usage());
	} else {
		opt.parse(process.argv);
	}

Source code example-2.js

	var util = require('util'),
		path = require('path'),
		opt = require('./opt'),
		config = {},
		today = new Date();
	
	opt.setup("USAGE:  node " + path.basename(process.argv[1]) + " --help",
		"SYNOPSIS: demo a realistic example of using opt.\n\n\t\tnode " + path.basename(process.argv[1]) + "  --first-name=john \\ \n\t\t\t --last-name=doe \\ \n\t\t\t--start=\"2011-01-01\" --end=\"now\"",
		"OPTIONS",
		" copyright (c) 2011 all rights reserved\n" +
		" Released under New the BSD License.\n" +
		" See: http://opensource.org/licenses/bsd-license.php\n");
	opt.set(['-h','--help'], opt.usage, "This help document.");
	
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
		console.log("Try using a command line option for demo:\n" + opt.usage());
		process.exit(1);
	} else {
		opt.parse(process.argv);
	}
	console.log("\nConfig object properties set by opt: ");
	console.log(util.inspect(config));

Source code json2sh.js

	var fs = require('fs'),
		path = require('path'),
		opt = require('opt'),
		input = '',
		output = '', fields = {}, buf;
	
	opt.setup("USAGE: node " + path.basename(process.argv[1]) + " --input=JSON_FILENAME --output=BASH_FILENAME",
		"SYNOPSIS: Report processsed urls in the database generate by " + path.basename(process.argv[1]) + ".\n",
		"OPTIONS:",
		" by R. S. Doiel " +
		" copyright (c) 2012 all rights reserved " +
		" Released under New the BSD License. " + 
		" See: http://opensource.org/licenses/bsd-license.php"
	);
	
	opt.set(['-h', '--help'], opt.usage, "This help page.");
	opt.set(['-i', '--input'], function (param) {
		input = param;
	}, "Set the name of the JSON file to read.");
	opt.set(['-o', '--output'], function (param) {
		output = param;
	}, "Set the name of the JSON file to read.");
	opt.parse(process.argv);
	
	fields = JSON.parse(fs.readFileSync(input).toString());
	buf = [
		"#",
		"# generated with " + path.basename(process.argv[1]),
		"# from " + input,
		"#"
	];
	Object.keys(fields).forEach(function (ky) {
		buf.push(String(ky).toUpperCase() + "=\"" + fields[ky].trim() + "\"");
	});
	buf.push("\n");
	fs.writeFileSync(output, buf.join("\n"));
