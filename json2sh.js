//
// json2sh.js - Convert a JSON blob into set of Bash variable assignments
//

var fs = require('fs'),
	path = require('path'),
	opt = require('opt'),
	input = '',
	output = '', fields = {}, buf;

opt.setup("USAGE: node " + path.basename(process.argv[1]) + " --input=JSON_FILENAME --output=BASH_FILENAME",
	"SYNOPSIS: Report processsed urls in the database generate by " + path.basename(process.argv[1]) + ".\n",
	"OPTIONS:",
	" University of Southern California\n" +
	" copyright (c) 2012 all rights reserved");

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