//
// opt_test.js - software tests for opt.js
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under the Simplified BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.7
//

/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

var fs = require("fs"),
    path = require("path"),
    util = require("util"),
    assert = require("assert"),
    harness = require("../lib/harness"),
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


harness.push({callback: function () {
    var opt = OPT.create(), i, help;

    assert.equal(typeof opt.option, "function", "Should see an exported set()");
    assert.equal(typeof opt.optionWith, "function", "Should see an exported parse()");

    help = function (next_arg) {
        if (next_arg) {
            help_has_args = true;
            assert.equal(next_arg, test_args[test_no].r, next_arg + " != " + test_args[test_no].r + " for " + JSON.stringify(test_args[test_no]));
        }
    };

    assert.ok(opt.option(["-h", "--help"], help, "Show the help document."), "set() should return true.");
    for (i = 0; i < test_args.length; i += 1) {
        test_no = i;
        help_has_args = false;
        assert.ok(opt.optionWith(test_args[i].args), "Should return true on successful parse(). for args: " + JSON.stringify(test_args[i]));
        assert.equal(help_has_args, test_args[i].help_has_args, "Should have updated help_has_args to " + test_args[i].help_has_args.toString() + " for args: " + JSON.stringify(test_args[i]));
    }
}, label: "Testing initialization, object creation and help."});


harness.push({callback: function () {
    var opt = OPT.create(),
        test_consumable = ["testme", "--database=mydb", "my_rpt"],
        test_result,
        test_database_name = false;

    // Test consumable args and returning an argv array from parse.
    assert.ok(opt.optionHelp("This is a test"), "Run setup to clear previous opt use.");
    assert.ok(opt.option(["-d", "--database"], function (param) {
        test_database_name = param;
        opt.consume(param);
    }, "Should set the database name."), "Should set the database name and consume the arg");
    test_result = opt.optionWith(test_consumable);
    assert.equal(test_result[0], "testme", "Should find testme as test_result[0].");
    assert.equal(test_result[1], "my_rpt", "Should find my_rpt as test_result[1]." + util.inspect(test_result));
    assert.equal(test_database_name, "mydb", "Should find mydb as test_database_name.");

    test_consumable = ["node", "load-data.js", "--database=mydb", "--collection=mycol", "some-data.txt"];
    opt.optionHelp("This is second test.");
    opt.option(["-d", "--database"], function (param) {
        opt.consume(param);
    }, "Set DB name.");
    opt.option(["-c", "--collection"], function (param) {
        opt.consume(param);
    }, "Set Collection name.");
    test_result = opt.optionWith(test_consumable);
    assert.equal(test_result[0], "node", "Should have node as test_result[0]");
    assert.equal(test_result[1], "load-data.js", "Should have load-data.js as test_result[1]" + util.inspect(test_result));
    assert.equal(test_result[2], "some-data.txt", "Should have some-data.txt as test_result[2]");

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
    assert.equal(test_result[0], "node", "Should have node as test_result[0]");
    assert.equal(test_result[1], "load-data.js", "Should have load-data.js as test_result[1]" + util.inspect(test_result));
    assert.equal(test_result[2], "some-data.txt", "Should have some-data.txt as test_result[2]");
    assert.equal(test_result.length, 3, "Should only have three args." + util.inspect(test_result));
}, label: "Testing Consumables"});

harness.push({callback: function () {
    var opt = OPT.create(), test_config = { name: "opt", version: "0.0.1" },
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
            msg
        ].join(" ");
    }("Version should not match.")));

    Object.keys(package_obj).forEach(function (ky) {
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
}, label: "Testing configSync()"});

// Process non-Blocking config
harness.push({callback: function () {
    var opt = OPT.create(), test_config = { name: "opt", version: "0.0.1" },
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

        Object.keys(package_obj).forEach(function (ky) {
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

    // Should complete within 15 seconds
}, label: "Process non-Blocking config"});


harness.push({callback: function (test_name) {
    var opt = OPT.create();

    opt.config({}, ["examples/config-example-1.conf"]);
    opt.on("ready", function (args) {
        assert.equal(args.greetings, "Hello", "Should have a args.greetings of hello" + util.inspect(args));
    });
},label: "configEvents"});


if (require.main === module) {
    harness.RunIt(path.basename(module.filename), 10, true);
} else {
    exports.RunIt = harness.RunIt;
}




