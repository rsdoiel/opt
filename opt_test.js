//
// opt_test.js - software tests for opt.js
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.2d
//

var	util = require("util"),
	assert = require("assert"),
	opt = require("./opt");

var help_has_args = false, 
	test_args = [ { args : ['testme', '-h', 'something else'], help_has_args : true, r : 'something else' },
		{ args : ['testme', '--help', 'something else'], help_has_args : true, r : 'something else' },
		{ args : ['testme', '--help="something else"'], help_has_args : true, r : 'something else' },
		{ args : ['testme', "--help='something else'"], help_has_args : true, r : 'something else' },
		{ args : ['testme', '--help=something_else'], help_has_args : true, r : 'something_else' },
		{ args : ['testme', '-h'], help_has_args : false, r : false },
		{ args : ['testme', '--help'], help_has_args : false, r : false },
	],
	test_no = 0;

console.log("Starting (opt_test.js) ... " + new Date());

assert.equal(typeof opt.set,'function', "Should see an exported set()");
assert.equal(typeof opt.parse, 'function', "Should see an exported parse()");

help = function(next_arg) {
	if (next_arg) {
		help_has_args = true;
		assert.equal(next_arg, test_args[test_no].r, next_arg + " != " + test_args[test_no].r + " for " + JSON.stringify(test_args[test_no]));
	}
};

assert.ok(opt.set(['-h','--help'], help, "Show the help document."), "set() should return true.");

for (i = 0; i < test_args.length; i += 1) {
	test_no = i;
	help_has_args = false;
	assert.ok(opt.parse(test_args[i].args), "Should return true on successful parse(). for args: " + JSON.stringify(test_args[i]));
	assert.equal(help_has_args, test_args[i].help_has_args, "Should have updated help_has_args to " + test_args[i].help_has_args.toString() + " for args: " + JSON.stringify(test_args[i]));
}
console.log("Success! " + new Date());
