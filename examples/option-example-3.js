//
// Show the use of consumable args and rendering a resulting
// argv from opt.parse(process.argv).
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */
"use strict";

/* Example output:

example.com:  node example-3.js one two
New args: [ 'node', 'one', 'two' ]
Input name: one
Output name: one
Database name: false
Collection name: false

example.com:  node example-3.js one two
New args: [ 'node', 'one', 'two' ]
Input name: one
Output name: one
Database name: false
Collection name: false

example.com:  node example-3.js one two
New args: [ 'node', 'one', 'two' ]
Input name: one
Output name: two
Database name: false
Collection name: false

example.com:  node example-3.js one two -d one-db -c two-collection
New args: [ 'node', 'one', 'two' ]
Input name: one
Output name: two
Database name: one-db
Collection name: two-collection

example.com:  node example-3.js -o one -i two -d one-db -c two-collection
New args: [ 'node', 'one', 'two' ]
Input name: one
Output name: two
Database name: one-db
Collection name: two-collection
*/

var util = require("util"),
	path = require("path"),
	opt = require("../opt").create(),
	input_name = false,
	output_name = false,
	database_name = false,
	collection_name = false,
	new_args = [];

opt.setup("USAGE: node " + path.basename(process.argv[1]) + " [options] input_name output_name",
        "SYNOPSIS: Show how you can make a simple command line program using consumable args.",
        "OPTIONS:",
        " Example Organization Name here\n" +
        " Some copyright statement here.");

opt.consume(true);// Turn on argument consumption
opt.set(["-d", "--database"], function (param) {
	database_name = param;
	opt.consume(param);
}, "Set the database name.");
opt.set(["-c", "--collection"], function (param) {
	collection_name = param;
	opt.consume(param);
}, "Set the collection name.");
opt.set(["-i", "--input"], function (param) {
	input_name = param;
	opt.consume(param);
});
opt.set(["-o", "--output"], function (param) {
}, "Set the output name.");
opt.set(["-h", "--help"], function () {
    opt.usage();
}, "This help page.");

new_args = opt.parse(process.argv);
if (new_args[1] !== undefined) {
	input_name = new_args[1];
}
if (new_args[2] !== undefined) {
	output_name = new_args[2];
}
console.log("New args: " + util.inspect(new_args));
console.log("Input name:", input_name);
console.log("Output name:", output_name);
console.log("Database name:", database_name);
console.log("Collection name:", collection_name);
