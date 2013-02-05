// json2sh.js - Convert a JSON blob into set of Bash variable assignments
// 
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */
"use strict";

var fs = require("fs"),
    path = require("path"),
    opt = require("../opt").create(),
    input = "",
    output = "",
    fields = {},
    buf;

opt.optionHelp({
	heading: "USAGE: node " + path.basename(process.argv[1]) + " --input=JSON_FILENAME --output=BASH_FILENAME",
    sysnopsis: "SYNOPSIS: Report processsed urls in the database generate by " + path.basename(process.argv[1]) + ".\n",
    options: "OPTIONS:",
    copyright: " by R. S. Doiel\n" +
	    " copyright (c) 2012 all rights reserved\n" +
	    " Released under New the BSD License.\n" +
	    " See: http://opensource.org/licenses/bsd-license.php"
});

opt.option(["-h", "--help"], function () {
    opt.usage();
}, "This help page.");

opt.option(["-i", "--input"], function (param) {
    input = param;
}, "Set the name of the JSON file to read.");

opt.option(["-o", "--output"], function (param) {
    output = param;
}, "Set the name of the JSON file to read.");

opt.optionWith(process.argv, function () {
	if (input === "") {
	    opt.usage("\n\tTry --help", 1);
	}
});


fields = JSON.parse(fs.readFileSync(input).toString());
buf = [
    "#",
    "# generated with " + path.basename(process.argv[1]),
    "# from " + input,
    "#"
];
Object.keys(fields).forEach(function (ky) {
    buf.push(String(ky).toUpperCase() + "=\"" + fields[ky].toString().trim() + "\"");
});
buf.push("\n");
if (output !== "") {
    fs.writeFileSync(output, buf.join("\n"));
} else {
    console.log(buf.join("\n"));
}
