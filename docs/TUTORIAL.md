opt
===

# Tutorial

## Overview

opt.js is a NodeJS module to make it easier to write command line programs and RESTful web services.  The basic idea is to define settings and configuration,
process those options and if this is a web application define restful requests then process those requests.


## Examples Code

The following examples are grouped by topic.

* examples of processinf JSON based configuration files
* examples of processing command line options
* examples of rendering a RESTful API with opt

### Config Example 1

This is the synchronous version.

```javascript
	//
	// Demo a simple configuration processing
	//
	/*jslint node:true */
	
	var path = require("path"),
		opt = require("../opt").create();
	
	var config = { name: "fred", "email": "fred@example.com" },
		search_paths = [ "config-example-1.conf",
				path.join(process.env.HOME, ".fredrc"),
				"/usr/local/etc/fred.conf",
				"/usr/etc/fred.conf",
				"/etc/fred.conf" ];
	
	console.log("Unprocessed config:", config);
	config = opt.configSync(config, search_paths);
	
	// config should now hold the merge configuration
	// from default_config and the first configuration file 
	// found in the search path list.
	console.log("Processed config: ", config);
```

### Config Example 2

This is the asynchronous version

```javascript
	//
	// Demo a simple asynchronous configuration processing
	//
	/*jslint node: true */
	"use strict";
	
	var path = require("path"),
		opt = require("../opt").create();
	
	var config = { name: "fred", "email": "fred@example.com" },
		search_paths = [ "config-example-1.conf",
				path.join(process.env.HOME, ".fredrc"),
				"/usr/local/etc/fred.conf",
				"/usr/etc/fred.conf",
				"/etc/fred.conf" ];
	
	console.log("Unprocessed config:", config);
	config = opt.config(config, search_paths, function (err, config) {
		// config should now hold the merge configuration
		// from default_config and the first configuration file 
		// found in the search path list.
		console.log("Processed config: ", config);
	});
```

### Config Example 3

This is an asynchronous version using a ready event.

```javascript
	//
	// Demo a simple asynchronous configuration processing
	// using a ready event.
	//
	/*jslint node: true */
	"use strict";
	
	var path = require("path"),
		opt = require("../opt").create();
	
	var config = { name: "fred", "email": "fred@example.com" },
		search_paths = [ "config-example-1.conf",
				path.join(process.env.HOME, ".fredrc"),
				"/usr/local/etc/fred.conf",
				"/usr/etc/fred.conf",
				"/etc/fred.conf" ];
	
	console.log("Unprocessed config:", config);
	opt.config(config, search_paths);
	
	opt.on("ready", function (config) {
		// config should now hold the merge configuration
		// from default_config and the first configuration file 
		// found in the search path list.
		console.log("Processed config: ", config);
	});
```

### Options Examples 1

Display a help message with -h and --help on the command line.

```javascript
	//
	// example-1.js - a simple example of using opt.
	//
	// @author: R. S. Doiel, <rsdoiel@gmail.com>
	// copyright (c) 2012 all rights reserved
	//
	// Released under New the BSD License.
	// See: http://opensource.org/licenses/bsd-license.php
	//
	/*jslint node: true */
	"use strict";
	
	var util = require("util"),
		opt = require("../opt").create();
	
	opt.optionHelp("USAGE node example-1.js.",
		"SYNOPSIS: Demonstrate how opt works.\n\n\t\t node example-1.js --help",
		"OPTIONS:",
		" copyright (c) 2012 all rights reserved\n" +
		" Released under New the BSD License.\n" +
		" See: http://opensource.org/licenses/bsd-license.php\n");
	
	opt.option(["-h", "--help"], function () {
		opt.usage();
	}, "This help document.");
	
	// Parse the command line options
	if (process.argv.length < 3) {
		console.log("Try using a command line option for demo:\n" + opt.usage());
	} else {
		opt.optionWith(process.argv);
	}
```

### Options Example 2

```javascript
	//
	// example-2.js - more realistic simple example of command line option processing with opt.
	//
	// @author: R. S. Doiel, <rsdoiel@gmail.com>
	// copyright (c) 2011 all rights reserved
	//
	// Released under New the BSD License.
	// See: http://opensource.org/licenses/bsd-license.php
	//
	"use strict";
	var util = require("util"),
		path = require("path"),
		opt = require("../opt").create(),
		config = {},
		today = new Date();
	
	opt.setup("USAGE:  node " + path.basename(process.argv[1]) + " --help",
		"SYNOPSIS: demo a realistic example of using opt.\n\n\t\tnode " + path.basename(process.argv[1]) + "  --first-name=john \\ \n\t\t\t --last-name=doe \\ \n\t\t\t--start=\"2011-01-01\" --end=\"now\"",
		"OPTIONS:",
		" copyright (c) 2011 all rights reserved\n" +
		" Released under New the BSD License.\n" +
		" See: http://opensource.org/licenses/bsd-license.php\n");
	opt.set(["-h", "--help"], function () {
		opt.usage();
	}, "This help document.");
	
	opt.set(["-f", "--first-name"], function (first_name) {
		config.first_name = first_name;
	}, "Set the first name column contents. E.g. John");
	
	opt.set(["-l", "--last-name"], function (last_name) {
		config.last_name = last_name;
	}, "Set the last name column contents. E.g. Doe");
	
	
	opt.set(["-s", "--start"], function (start_date) {
		config.start = start_date;
	}, "Set the start date for reporting in YYYY-MM-DD format.");
	
	opt.set(["-e", "--end"], function (end_date) {
		if (end_date.length === 10 &&
				end_date.match(/20[0-2][0-9]-[0-3][0-9]-[0-3][0-9]/)) {
			config.end = end_date;
		} else {
			config.end = today.getFullYear() + "-" +
				String("0" + (today.getMonth() + 1)).substr(-2) + "-" +
				String("0" + (today.getDate())).substr(-2);
		}
	}, "Set the last date for reporting.  Usually a date in YYYY-MM-DD format or \"now\".");
	
	// Parse the command line options
	if (process.argv.length < 3) {
		console.log("Try using a command line option for demo:\n" + opt.usage());
		process.exit(1);
	} else {
		opt.parse(process.argv);
	}
	console.log("\nConfig object properties set by opt: ");
	console.log(util.inspect(config));
```


### Options Example 3, handing options and resolving argv

```javascript
	//
	// Show the use of consumable args and rendering a resulting
	// argv from opt.parse(process.argv).
	//
	/*jslint node: true */
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
```


### RESTful Example 1

This is a simple web server demonstrating how to define action for a given path and http method.

```JavaScript
	var fs = require('fs'),
		path = require("path"),
		http = require('http'),
		opt = require("../opt").create();
	
	var config = { name: "fred", email: "fred@example.com", host: "localhost", port: 8080 },
		search_paths = [ "config-example-1.conf",
				path.join(process.env.HOME, ".config-examplerc"),
				"/usr/local/etc/config-example.conf",
				"/usr/etc/config-example.conf",
				"/etc/config-example.conf" ];
	
	opt.config(config, search_paths);
	
	opt.optionHelp("USAGE node " + path.basename(process.argv[1]),
		"SYNOPSIS: Demonstrate how opt works with web services.\n\n\t\t node " + path.basename(process.argv[1]) + " --help",
		"OPTIONS:",
		" copyright (c) 2012 all rights reserved\n" +
		" Released under New the BSD License.\n" +
		" See: http://opensource.org/licenses/bsd-license.php\n");
	
	
	// Bind some paths to events.
	// Setup some event handlers to process the web requests
	opt.rest("get", /^(\/$|\/index\.html)/, function (request, response, matching, rule_no) {
		var page = "<!DOCTYPE html>\n<html><body><a href=\"/hello\">Hello</a></body></html>";
		console.log("homepage:", matching, rule_no);
		response.writeHead(200, {
			'Content-Type': 'text/html',
			'Content-Length': page.length
		});
		response.end(page);
	});
	
	opt.rest("get", "/hello", function (request, response, matching, rule_no) {
		console.log("/hello:", matching, rule_no);
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.end("<DOCTYPE html>\n<html><body>Hello World</html>");
	});
	
	// Default catch all path. Assume if another rule didn't catch it then we have a 404
	opt.rest("get", new RegExp("^/*"), function (request, response, matching, rule_no) {
		console.log("status404", matching, rule_no);
		response.writeHead(404, {'Content-Type': 'text/html'});
		response.end("<DOCTYPE html>\n<html><body>404, File not found</body></html>");
	});
	
	
	opt.on("ready", function (config) {
	
		opt.option(["-n", "--name"], function (param) {
			if (param && param.trim()) {
				config.name = param.trim();
			}
		}, "Set the name parameter");
	
		opt.option(["-e", "--email"], function (param) {
			if (param && param.trim()) {
				config.email = param.trim();
			}
		}, "Set the email parameter");
	
		opt.option(["-G", "--greeting"], function (param) {
			if (param && param.trim()) {
				config.greeting = param.trim();
			}
		}, "Set the greeting.");
	
		opt.option(["-H", "--host"], function (param) {
			if (param && param.trim()) {
				config.host = param.trim();
			}
		}, "Set the hostname to listen for.");
	
		opt.option(["-p", "--port"], function (param) {
			if (param && Number(param) !== false) {
				config.port = param.trim();
			} else {
				opt.usage("Port must be an integer.", 1);
			}
		}, "Set the hostname to listen for.");
	
		opt.option(["-g", "--generate"], function (param) {
			if (param.trim()) {
				fs.writeFile(param.trim(), JSON.stringify(config));
			} else {
				console.log(JSON.stringify(config));
			}
			process.exit(0);
		}, "Generate a configuration file");
	
		opt.option(["-h", "--help"], function () {
			opt.usage("", 0);
		}, "This help document.");
	
		opt.optionWith(process.argv);
	
		console.log("Starting web server", config.host + ":" + config.port);
		http.createServer(function (request, response) {
			console.log("req:", request.url);
			opt.restWith(request, response);
		}).listen(config.port, config.host);
	});
```
