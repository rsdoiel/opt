//
// opt_test.js - software tests for opt.js
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.6
//

var fs = require("fs"),
	util = require("util"),
	assert = require("assert"),
	opt = require("./opt");

var help_has_args = false, 
	test_args = [ { args : ["testme", "-h", "something else"], help_has_args : true, r : "something else" },
		{ args : ["testme", "--help", "something else"], help_has_args : true, r : "something else" },
		{ args : ["testme", "--help=\"something else\""], help_has_args : true, r : "something else" },
		{ args : ["testme", "--help='something else'"], help_has_args : true, r : "something else" },
		{ args : ["testme", "--help=something_else"], help_has_args : true, r : "something_else" },
		{ args : ["testme", "-h"], help_has_args : false, r : false },
		{ args : ["testme", "--help"], help_has_args : false, r : false }
	],
	test_no = 0,
	package_json = fs.readFileSync("package.json").toString(),
	package_obj = JSON.parse(package_json);

var doTest = function (test_name, func, time_for_test) {
	var self = this;
	
	if (self.Tests === undefined) {
		console.log("Creating Tests = {}");
		self.Tests = {};
	}
	if (self.TestsTimeout === undefined) {
		self.TestsTimeout = 0;
	}
	if (time_for_test === undefined) {
		time_for_test = 0;
	}

	self.TestsTimeout = self.TestsTimeout + time_for_test;
	self.Tests[test_name] = func;
	console.log("Starting", test_name);
	func(test_name);
};

var completedTest = function (test_name) {
	var self = this;

	if (self.Tests === undefined) {
		throw("self.Tests does not exist.");
	};
	console.log("Completed:", test_name);
	delete self.Tests[test_name];
};

var monitorTests = function () {
	var self = this, test_remaining, 
		timeout;

	if (self.Tests === undefined) {
		throw("self.Tests does not exist.");
	}
	if (self.TestsTimeout === undefined) {
		self.TestsTimeout = 0;
	}
	
	// Wait for all the tests to run because deciding on success.
	timeout = Number(self.TestsTimeout).toFixed(0);
	setInterval(function () {
		test_remaining = Object.keys(self.Tests);
		if (test_remaining.length === 0) {
			console.log("Success! ", Date());
			process.exit(0);
		} else if (timeout < 1) {
			console.error("Failed, timed out. Incomplete tests", test_remaining, Date());
			process.exit(1);
		} else {
			console.log("Tests remaining:", test_remaining, "maximum time remaining", timeout, "seconds");
		}
		timeout -= 1;
	}, 1000);
};

console.log("Starting (opt_test.js) ... " + new Date());

doTest("opt creation", function (test_name) {
	assert.equal(typeof opt.set, "function", "Should see an exported set()");
	assert.equal(typeof opt.parse, "function", "Should see an exported parse()");
	completedTest(test_name);
});

doTest("param processing and help()", function (test_name) {
	help = function(next_arg) {
		if (next_arg) {
			help_has_args = true;
			assert.equal(next_arg, test_args[test_no].r, next_arg + " != " + test_args[test_no].r + " for " + JSON.stringify(test_args[test_no]));
		}
	};
	
	assert.ok(opt.set(["-h", "--help"], help, "Show the help document."), "set() should return true.");
	for (i = 0; i < test_args.length; i += 1) {
		test_no = i;
		help_has_args = false;
		assert.ok(opt.parse(test_args[i].args), "Should return true on successful parse(). for args: " + JSON.stringify(test_args[i]));
		assert.equal(help_has_args, test_args[i].help_has_args, "Should have updated help_has_args to " + test_args[i].help_has_args.toString() + " for args: " + JSON.stringify(test_args[i]));
	}
	completedTest(test_name);
});


doTest("Consumables", function (test_name) {
	var test_consumable = ["testme", "--database=mydb", "my_rpt"], 
		test_result,
		test_database_name = false;
	
	// Test consumable args and returning an argv array from parse.
	assert.ok(opt.setup("This is a test"), "Run setup to clear previous opt use.");
	assert.ok(opt.set(["-d", "--database"], function (param) {
		test_database_name = param;
		opt.consume(param);
	}, "Should set the database name."), "Should set the database name and consume the arg");
	test_result = opt.parse(test_consumable);
	assert.equal(test_result[0], "testme", "Should find testme as test_result[0].");
	assert.equal(test_result[1], "my_rpt", "Should find my_rpt as test_result[1]." + util.inspect(test_result));
	assert.equal(test_database_name, "mydb", "Should find mydb as test_database_name.");
	
	
	test_consumable = ["node", "load-data.js", "--database=mydb", "--collection=mycol", "some-data.txt"];
	opt.setup("This is second test.");
	opt.set(["-d", "--database"], function (param) {
		opt.consume(param);
	}, "Set DB name.");
	opt.set(["-c", "--collection"], function (param) {
		opt.consume(param);
	}, "Set Collection name.");
	test_result = opt.parse(test_consumable);
	assert.equal(test_result[0], "node", "Should have node as test_result[0]");
	assert.equal(test_result[1], "load-data.js", "Should have load-data.js as test_result[1]" + util.inspect(test_result));
	assert.equal(test_result[2], "some-data.txt", "Should have some-data.txt as test_result[2]");
	
	// node myproj.js some-data.txt -d mydb -c mycol
	test_consumable = ["node", "load-data.js", "some-data.txt", "-d", "mydb", "-c", "mycol"];
	opt.setup("This is the third test.");
	opt.set(["-d", "--database"], function (param) {
		opt.consume(param);
	}, "Set DB name.");
	opt.set(["-c", "--collection"], function (param) {
		opt.consume(param);
	}, "Set Collection name.");
	test_result = opt.parse(test_consumable);
	assert.equal(test_result[0], "node", "Should have node as test_result[0]");
	assert.equal(test_result[1], "load-data.js", "Should have load-data.js as test_result[1]" + util.inspect(test_result));
	assert.equal(test_result[2], "some-data.txt", "Should have some-data.txt as test_result[2]");
	assert.equal(test_result.length, 3, "Should only have three args." + util.inspect(test_result));
	completedTest(test_name);
});

doTest("Testing configSync()", function (test_name) {
	var test_config = { name: "opt", version: "0.0.1" }, 
		test_paths = ["package.json"],
		result_config = {},
		package_json = fs.readFileSync("package.json").toString(),
		package_obj = JSON.parse(package_json);
	
	result_config = opt.configSync(test_config, test_paths);
	assert.equal(result_config.name, test_config.name, "Should have name matching.");
	assert.notEqual(result_config.version, test_config.version, (function (msg) {
		return [
			"Result Config:",
			JSON.stringify(result_config),
			"Test Config:",
			JSON.stringify(test_config),
			msg].join(" ");
	}("Version should not match.")));
	
	Object.keys(package_obj).forEach(function(ky) {
		assert.ok(result_config[ky], "Should have " + ky + " in result_config.");
		switch (typeof package_obj[ky]) {
		case "string":
			assert.equal(result_config[ky], package_obj[ky], "Should have matching values for " + ky);
			break;
		case "object":
			Object.keys(package_obj[ky]).forEach(function (subky) {
				if (typeof package_obj[ky][subky] === "string") {
					assert.ok(result_config[ky][subky], "Should have [" + ky + "][" + subky + "] in result_config.");
					assert.equal(result_config[ky][subky], package_obj[ky][subky], "Should have matching values for [" + ky + "][" + subky + "]");			
				}
			});
			break;
		}
	});

	// Process when missing search paths.
	result_config = opt.configSync(test_config);
	Object.keys(test_config).forEach(function (ky) {
		assert.equal(result_config[ky], test_config[ky], ky + " should match");
	});
	Object.keys(result_config).forEach(function (ky) {
		assert.equal(result_config[ky], test_config[ky], ky + " should match");
	});

	// Process when missing any config file.
	result_config = opt.configSync(test_config, ["missing-file.conf"]);
	Object.keys(test_config).forEach(function (ky) {
		assert.equal(result_config[ky], test_config[ky], ky + " should match");
	});
	Object.keys(result_config).forEach(function (ky) {
		assert.equal(result_config[ky], test_config[ky], ky + " should match");
	});

	completedTest(test_name);
});

// Process non-Blocking config
doTest("Testing config()", function (test_name) {
	var test_config = { name: "opt", version: "0.0.1" }, 
		test_paths = ["package.json"];

	opt.config(test_config, test_paths, function (err, result_config) {
		assert.equal(result_config.name, test_config.name, "Should have name matching.");
		assert.notEqual(result_config.version, test_config.version, (function (msg) {
			return [
				"Result Config:",
				JSON.stringify(result_config),
				"Test Config:",
				JSON.stringify(test_config),
				msg].join(" ");
		}("Version should not match.")));

		Object.keys(package_obj).forEach(function(ky) {
			assert.ok(result_config[ky], "Should have " + ky + " in result_config.");
			switch (typeof package_obj[ky]) {
			case "string":
				assert.equal(result_config[ky], package_obj[ky], "Should have matching values for " + ky);
				break;
			case "object":
				Object.keys(package_obj[ky]).forEach(function (subky) {
					if (typeof package_obj[ky][subky] === "string") {
						assert.ok(result_config[ky][subky], "Should have [" + ky + "][" + subky + "] in result_config.");
						assert.equal(result_config[ky][subky], package_obj[ky][subky], "Should have matching values for [" + ky + "][" + subky + "]");			
					}
				});
				break;
			}
		});
	});

	// Process when missing search paths.
	opt.config(test_config, test_paths, function (err, result_config) {
		Object.keys(test_config).forEach(function (ky) {
			assert.equal(result_config[ky], test_config[ky], ky + " should match");
		});
		Object.keys(result_config).forEach(function (ky) {
			assert.equal(result_config[ky], test_config[ky], ky + " should match");
		});
	});

	// Process when missing any config file.
	opt.config(test_config, ["missing-file.conf"], function (err, result_config) {
		Object.keys(test_config).forEach(function (ky) {
			assert.equal(result_config[ky], test_config[ky], ky + " should match");
		});
		Object.keys(result_config).forEach(function (ky) {
			assert.equal(result_config[ky], test_config[ky], ky + " should match");
		});
	});

	completedTest(test_name);
}, 15);

monitorTests();
