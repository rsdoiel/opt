//
// opt_test.js - software tests for opt.js
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under the Simplified BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.9
//

/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

var fs = require("fs"),
    path = require("path"),
    util = require("util"),
    Y = require("yui/test"),
    assert = Y.Assert,
    OPT = require("../opt");

var help_has_args = false,
	test_args = [
		{ args : ["testme", "-h", "something else"], help_has_args : true, r : "something else" },
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

var basicTests = new Y.Test.Case({
    name: "Basic Tests",
    "Should initialize object creation and help." : function () {
        var opt = OPT.create(), i, help;
        assert.areEqual(typeof opt.option, "function", "Should see an exported set()");
        assert.areEqual(typeof opt.optionWith, "function", "Should see an exported parse()");
    
        help = function (next_arg) {
            if (next_arg) {
                help_has_args = true;
                assert.areEqual(next_arg, test_args[test_no].r, next_arg + " != " + test_args[test_no].r + " for " + JSON.stringify(test_args[test_no]));
            }
        };
    
        Y.assert(opt.option(["-h", "--help"], help, "Show the help document."), "set() should return true.");
        for (i = 0; i < test_args.length; i += 1) {
            test_no = i;
            help_has_args = false;
            Y.assert(opt.optionWith(test_args[i].args), "Should return true on successful parse(). for args: " + JSON.stringify(test_args[i]));
            assert.areEqual(help_has_args, test_args[i].help_has_args, "Should have updated help_has_args to " + test_args[i].help_has_args.toString() + " for args: " + JSON.stringify(test_args[i]));
        }
    },

    "Should have consumables": function () {
        var opt = OPT.create(),
            test_consumable = ["testme", "--database=mydb", "my_rpt"],
            test_result,
            test_database_name = false;
    
        // Test consumable args and returning an argv array from parse.
        Y.assert(opt.optionHelp("This is a test"), "Run setup to clear previous opt use.");
        Y.assert(opt.option(["-d", "--database"], function (param) {
            test_database_name = param;
            opt.consume(param);
        }, "Should set the database name."), "Should set the database name and consume the arg");
        test_result = opt.optionWith(test_consumable);
        assert.areEqual(test_result[0], "testme", "Should find testme as test_result[0].");
        assert.areEqual(test_result[1], "my_rpt", "Should find my_rpt as test_result[1]." + util.inspect(test_result));
        assert.areEqual(test_database_name, "mydb", "Should find mydb as test_database_name.");
    
        test_consumable = ["node", "load-data.js", "--database=mydb", "--collection=mycol", "some-data.txt"];
        opt.optionHelp("This is second test.");
        opt.option(["-d", "--database"], function (param) {
            opt.consume(param);
        }, "Set DB name.");
        opt.option(["-c", "--collection"], function (param) {
            opt.consume(param);
        }, "Set Collection name.");
        test_result = opt.optionWith(test_consumable);
        assert.areEqual(test_result[0], "node", "Should have node as test_result[0]");
        assert.areEqual(test_result[1], "load-data.js", "Should have load-data.js as test_result[1]" + util.inspect(test_result));
        assert.areEqual(test_result[2], "some-data.txt", "Should have some-data.txt as test_result[2]");
    
        // node myproj.js some-data.txt -d mydb -c mycol
        test_consumable = ["node", "load-data.js", "some-data.txt", "-d", "mydb", "-c", "mycol"];
        opt.optionHelp("This is the third test.");
        opt.option(["-d", "--database"], function (param) {
            opt.consume(param);
        }, "Set DB name.");
        opt.option(["-c", "--collection"], function (param) {
            opt.consume(param);
        }, "Set Collection name.");
        test_result = opt.optionWith(test_consumable);
        assert.areEqual(test_result[0], "node", "Should have node as test_result[0]");
        assert.areEqual(test_result[1], "load-data.js", "Should have load-data.js as test_result[1]" + util.inspect(test_result));
        assert.areEqual(test_result[2], "some-data.txt", "Should have some-data.txt as test_result[2]");
        assert.areEqual(test_result.length, 3, "Should only have three args." + util.inspect(test_result));
    }, 

    "Should have working configSync()": function () {
        var opt = OPT.create(), test_config = { name: "opt", version: "0.0.1" },
            test_paths = ["package.json"],
            result_config = {},
            package_json = fs.readFileSync("package.json").toString(),
            package_obj = JSON.parse(package_json);
    
        result_config = opt.configSync(test_config, test_paths);
        assert.areEqual(result_config.name, test_config.name, "Should have name matching.");
        assert.areNotEqual(result_config.version, test_config.version, (function (msg) {
            return [
                "Result Config:",
                JSON.stringify(result_config),
                "Test Config:",
                JSON.stringify(test_config),
                msg
            ].join(" ");
        }("Version should not match.")));
    
        Object.keys(package_obj).forEach(function (ky) {
            Y.assert(result_config[ky], "Should have " + ky + " in result_config.");
            switch (typeof package_obj[ky]) {
            case "string":
                assert.areEqual(result_config[ky], package_obj[ky], "Should have matching values for " + ky);
                break;
            case "object":
                Object.keys(package_obj[ky]).forEach(function (subky) {
                    if (typeof package_obj[ky][subky] === "string") {
                        Y.assert(result_config[ky][subky], "Should have [" + ky + "][" + subky + "] in result_config.");
                        assert.areEqual(result_config[ky][subky], package_obj[ky][subky], "Should have matching values for [" + ky + "][" + subky + "]");
                    }
                });
                break;
            }
        });
    
        // Process when missing search paths.
        result_config = opt.configSync(test_config);
        Object.keys(test_config).forEach(function (ky) {
            assert.areEqual(result_config[ky], test_config[ky], ky + " should match");
        });
        Object.keys(result_config).forEach(function (ky) {
            assert.areEqual(result_config[ky], test_config[ky], ky + " should match");
        });
    
        // Process when missing any config file.
        result_config = opt.configSync(test_config, ["missing-file.conf"]);
        Object.keys(test_config).forEach(function (ky) {
            assert.areEqual(result_config[ky], test_config[ky], ky + " should match");
        });
        Object.keys(result_config).forEach(function (ky) {
            assert.areEqual(result_config[ky], test_config[ky], ky + " should match");
        });
    },

    // Process non-Blocking config
    "Process non-Blocking config" : function () {
        var opt = OPT.create(), test_config = { name: "opt", version: "0.0.1" },
            test_paths = ["package.json"];
    
        opt.config(test_config, test_paths, function (err, result_config) {
            assert.areEqual(result_config.name, test_config.name, "Should have name matching.");
            assert.areNotEqual(result_config.version, test_config.version, (function (msg) {
                return [
                    "Result Config:",
                    JSON.stringify(result_config),
                    "Test Config:",
                    JSON.stringify(test_config),
                    msg].join(" ");
            }("Version should not match.")));
    
            Object.keys(package_obj).forEach(function (ky) {
                Y.assert(result_config[ky], "Should have " + ky + " in result_config.");
                switch (typeof package_obj[ky]) {
                case "string":
                    assert.areEqual(result_config[ky], package_obj[ky], "Should have matching values for " + ky);
                    break;
                case "object":
                    Object.keys(package_obj[ky]).forEach(function (subky) {
                        if (typeof package_obj[ky][subky] === "string") {
                            Y.assert(result_config[ky][subky], "Should have [" + ky + "][" + subky + "] in result_config.");
                            assert.areEqual(result_config[ky][subky], package_obj[ky][subky], "Should have matching values for [" + ky + "][" + subky + "]");
                        }
                    });
                    break;
                }
            });
        });
    
        // Process when missing search paths.
        opt.config(test_config, test_paths, function (err, result_config) {
            Object.keys(test_config).forEach(function (ky) {
                assert.areEqual(result_config[ky], test_config[ky], ky + " should match");
            });
            Object.keys(result_config).forEach(function (ky) {
                assert.areEqual(result_config[ky], test_config[ky], ky + " should match");
            });
        });
    
        // Process when missing any config file.
        opt.config(test_config, ["missing-file.conf"], function (err, result_config) {
            Object.keys(test_config).forEach(function (ky) {
                assert.areEqual(result_config[ky], test_config[ky], ky + " should match");
            });
            Object.keys(result_config).forEach(function (ky) {
                assert.areEqual(result_config[ky], test_config[ky], ky + " should match");
            });
        });
    
    },

    "Should find helpText": function () {
    	var opt = OPT.create(), msg;
    	
    	// Setup command line arg processing
    	opt.optionHelp("USAGE node " + path.basename(process.argv[1]),
    		"SYNOPSIS:\n\tdemo of using opt and cluster module together\n\n ",
    		"OPTIONS",
    		"Copyright notice would go here.");
    	Y.assert(opt.heading, "Should have a page heading now");
    	Y.assert(opt.synopsis, "Should have a synopsis section now");
    	Y.assert(opt.options, "Should have a options heading now");
    	Y.assert(opt.copyright, "Should have copyright set now.");
    	
    	opt.option(["-h", "--help"], function (param) {
    		console.log("defined help.");
    	}, "This help test.");
    	msg = opt.helpText();
    	Y.assert(msg, "Should have opt.helpText() output:" + opt.helpText());
    }, 
    
    
    "configEvents": function () {
    	var opt = OPT.create();
    
        opt.config({}, ["examples/config-example-1.conf"]);
        opt.on("ready", function (args) {
            assert.areEqual(args.greetings, "Hello", "Should have a args.greetings of hello" + util.inspect(args));
        });
    },
    
    "configEventsAndOptions": function () {
    	var opt = OPT.create();
    
        opt.config({}, ["examples/config-example-1.conf"]);
        opt.on("ready", function (config) {
    	// Setup command line arg processing
    		opt.optionHelp("USAGE node " + path.basename(process.argv[1]),
    			"SYNOPSIS:\n\tdemo of using opt and cluster module together\n\n ",
    			"OPTIONS",
    			"Copyright notice would go here.");
    		Y.assert(opt.heading, "Should have a page heading now");
    		Y.assert(opt.synopsis, "Should have a synopsis section now");
    		Y.assert(opt.options, "Should have a options heading now");
    		Y.assert(opt.copyright, "Should have copyright set now.");
    		
    		opt.option(["-T"], function (param) {
    			assert.areEqual(param, "'hello world'", "Should have param set to 'hello world'" + util.inspect(param));
    			config.help = param;
    		});
    
    		opt.optionWith(["-T", "'hello world'"]);
            assert.areEqual(config.greetings, "Hello",
    			"Should have a args.greetings of hello" + util.inspect(config));
            assert.areEqual(config.help, "'hello world'",
    			"Should have -H set." + util.inspect(config));
        });
    },
    
    "Test quoted params": function () {
    	var opt = OPT.create(),
    		argv = [];
    	
    	argv = [
    		'node',
    		'/usr/local/bin/test.js',
    		'-q',
    		'-m',
    		'2012-12-01 01:01:01'
    	];
    	opt.consume(true);
    	opt.option(["-m", "--modified"], function (param) {
    		assert.areEqual("2012-12-01 01:01:01", param, "Param should be '2012-12-01 01:01:01': " + param);
    	});
    	opt.optionWith(argv);
    
    	opt = OPT.create();
    	argv = [
    		'/usr/local/bin/node',
    		'/Users/rsdoiel/NoBackup/git-repos/news-search/wp-sync.js',
    		'-q',
    		'--modified=2012-12-06 06:00:00'
    	];
    	opt.consume(true);
    	opt.option(["-m", "--modified"], function (param) {
    		assert.areEqual("2012-12-06 06:00:00", param, "Param should be '2012-12-06 06:00:00': " + param);
    	});
    	opt.optionWith(argv);
    
    	opt = OPT.create();
    	argv = [
    		'/usr/local/bin/node',
    		'/Users/rsdoiel/NoBackup/git-repos/news-search/wp-sync.js',
    		'-q',
    		'-m',
    		'2012-12-06 06:00:00'
    	];
    	opt.consume(true);
    	opt.option(["-m", "--modified"], function (param) {
    		assert.areEqual("2012-12-06 06:00:00", param, "Param should be '2012-12-06 06:00:00': " + param);
    	});
    	opt.optionWith(argv);
    
    	opt = OPT.create();
    	argv = [
    		'/usr/local/bin/node',
    		'/Users/rsdoiel/NoBackup/git-repos/news-search/wp-sync.js',
    		'-q',
    		'--modified="2012-12-06 06:00:00"'
    	];
    	opt.consume(true);
    	opt.option(["-m", "--modified"], function (param) {
    		assert.areEqual("2012-12-06 06:00:00", param, "Param should be '2012-12-06 06:00:00': " + param);
    	});
    	opt.optionWith(argv);
    }
}); 

Y.Test.Runner.add(basicTests);
Y.Test.Runner.run();

