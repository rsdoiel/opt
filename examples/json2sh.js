// json2sh.js - Convert a JSON blob into set of Bash variable assignments
// 
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint node: true */
"use strict";

var fs = require("fs"),
    path = require("path"),
    opt = require("opt").create(),
    input = "",
    output = "",
    fields = {},
    buf;

opt.optionHelp("USAGE: node " + path.basename(process.argv[1]) + " --input=JSON_FILENAME --output=BASH_FILENAME",
    "SYNOPSIS: Report processsed urls in the database generate by " + path.basename(process.argv[1]) + ".\n",
    "OPTIONS:",
    " by R. S. Doiel " +
    " copyright (c) 2012 all rights reserved " +
    " Released under New the BSD License. " +
    " See: http://opensource.org/licenses/bsd-license.php"
	);

opt.option(["-h", "--help"], function () {
    opt.usage();
}, "This help page.");
opt.opton(["-i", "--input"], function (param) {
    input = param;
}, "Set the name of the JSON file to read.");
opt.option(["-o", "--output"], function (param) {
    output = param;
}, "Set the name of the JSON file to read.");
opt.optionWith(process.argv);

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
