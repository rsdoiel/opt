[![build status](https://secure.travis-ci.org/rsdoiel/opt.png)](http://travis-ci.org/rsdoiel/opt)
opt
===


### Why another command line argument processor?

There are three reasons I created opt.js

* I wanted to simplify the boilerplate I used with JSON based configuration files including handling a set of search paths (e.g. look sequentially in a list of paths for a configuration file)
* I wanted a very simple command line option parser that included automatically generate a help page (I'm forgetful about updating docs outside of my code)
* I wanted a simple http route library that generate docs like I used for the command line

That was my itch.  There are many fine existing options parsing libraries in Node but they didn't quite scratch the itch I had.


# Overview

opt is a toolkit for building command line programs and RESTful
web services. It uses a common idiom for setting up and processing
JSON based configuration files, command line options parsing and 
defining a RESTful API calls.

Use the module by invoking opt's constructor Opt() or
opt.create() method..


```javascript
	var options = require("opt"),
	    opt = new options.Opt();
```

```javascript
	var options = require("opt"),
		opt = options.create();
```


It is available from github at https://github.com/rsdoiel/opt and
can be installed using npm

```shell
	npm install opt
```


# Examples Code

The following examples build by topics

* configuration processing
* command line option processing
* a RESTful Hello World API

## Config Example

This is the synchronous version.

```javascript
	/*jslint node: true */
	"use strict";

	var path = require("path"),
	    opt = require("opt").create();

	    var config = { name: "fred", email: "fred@example.com" },
	    	search_paths = [ "config-example-1.conf",
			path.join(process.env.HOME, ".config-examplerc"),
			"/usr/local/etc/config-example.conf",
			"/usr/etc/config-example.conf",
			"/etc/config-example.conf" ];

	console.log("Unprocessed config:", config);
	opt.config(config, search_paths);

	opt.on("ready", function (config) {
		// config should now hold the merge configuration
		// from default_config and the first configuration file 
		// found in the search path list.
		console.log("Processed config: ", config);
	});
```

## Adding Option processing

Display a help message with -h and --help on the command line.

```javascript
	/*jslint node: true */
	"use strict";
	
	var path = require("path"),
		opt = require("opt").create();
	
	var config = { name: "fred", email: "fred@example.com" },
		search_paths = [ "config-example-1.conf",
				path.join(process.env.HOME, ".config-examplerc"),
				"/usr/local/etc/config-example.conf",
				"/usr/etc/config-example.conf",
				"/etc/config-example.conf" ];
	
	console.log("Unprocessed config:", config);
	opt.config(config, search_paths);
	
	opt.optionHelp("USAGE node " + path.basename(process.argv[1]),
		"SYNOPSIS: Demonstrate how opt works to parse command line options.\n\n\t\t node " + path.basename(process.argv[1]) + " --help",
		"OPTIONS:",
		" copyright (c) 2012 all rights reserved\n" +
		" Released under New the BSD License.\n" +
		" See: http://opensource.org/licenses/bsd-license.php\n");
	
	
	opt.on("ready", function (config) {
		opt.option(["-n", "--name"], function (param) {
			if (param.trim()) {
				config.name = param.trim();
			}
		}, "Set the name parameter");
	
		opt.option(["-e", "--email"], function (param) {
			if (param.trim()) {
				config.email = param.trim();
			}
		}, "Set the email parameter");
		
		opt.option(["-g", "--generate"], function (param) {
			if (param.trim()) {
				fs.writeFile(param.trim(), JSON.stringify(config));
			} else {
				console.log(JSON.stringify(config));
			}
			process.exit(0);
		}, "Generate a configuration file");
		
		opt.option(["-h", "--help"], function () {
			opt.usage();
		}, "This help document.");
	
		opt.optionWith(process.argv);
	
		// config should now hold the merge configuration
		// from default_config and the first configuration file 
		// found in the search path list.
		console.log("Processed config: ", config);
	});
```

## A simple web server API

```javascript
	// Importing some modules
	var util = require("util"),
		http = require("http"),
		path = require("path"),
		// import and create the opt object
		opt = require("opt").create();
	
	// Define your configuration defaults and load your local configuration
	// file or it.
	opt.config({ host: "localhost", port: 8080, name: "John Doe"},
		[ "/etc/helloworld.json", path.join(process.env.HOME, "etc/helloworld.json") ]);
	
	// When your configuration is "ready" parse the command lines
	// and setup your RESTful hello world web service
	opt.on("ready", function (config) {
		// Setup how your help page will look
		opt.optionHelp("USAGE node " + path.basename(process.argv[1]),
			"SYNOPSIS:\n\tThis is a simple hello world web service.",
			"OPTIONS:",
			"this is an opt demo");
	
		// Define your command line options
		opt.option(["-H", "--host"], function (hostname) {
			config.host = hostname.trim();
		});
		opt.option(["-p", "--port"], function (portname) {
			config.port = Number(portname.trim());
		});
		opt.option(["-n", "--name"], function (name) {
			config.name = name.trim();
		});
		opt.option(["-h", "--help"], function () {
			opt.usage();
		});
	
		// Define you restful service
		var helloworld = function (req, res, matching, rule_no) {
			res.writeHead(200, {"content-type": "text/plain"});
			res.end("Hello " + config.name + ".\nThis is what I found: " + util.inspect(matching) + "\nRule No.:" + rule_no);
		};
		opt.rest("get", new RegExp("^$|^/$|^/index.html|^/helloworld.html"), helloworld);
	
		var status404 = function (req, res) {
			res.writeHead(404, {"content-type": "text/plain"});
			res.end("File not found. " + req.url);
		};
		opt.rest("get", new RegExp("^/*"), status404);
	
		// Process your command line args.
		opt.optionWith(process.argv);
	
		// Process your restful requets
		console.log("Configuration:", config);
		http.createServer(function (req, res) {
			console.log("request:", req.url);
			opt.restWith(req, res);
		}).listen(config.port, config.host);
		console.log("Web server listening on " + config.host + ":" + config.port);
	});
```


# Simple webserve example

This example sets up a simple hello web server.

```JavaScript
	var fs = require("fs"),
		path = require("path"),
		http = require("http"),
		url = require("url"),
		opt = require("opt").create(),
		TBone = require("tbone"),
		H = new TBone.HTML(),
		config_filename = false,
		config = {
			port: 8123,
			host: "localhost"
		};
	
	opt.optionHelp(
		"USAGE node " + path.basename(process.argv[1]),
		"SYNOPSIS: Demonstrate how opt works to parse command line options.\n" +
		"\n\t\t node " + path.basename(process.argv[1]) + " --help",
		"OPTIONS:",
		"ACME Gelatin Company"
	);
	
	opt.consume(true);
	opt.option(["-p", "--port"], function (arg) {
		try {
			config.port = Number(arg);
		} catch (err0) {
			console.error(err0);
			process.exit(1);
		}
		opt.consume(arg);
	}, "Set the port to listen on.");
	
	opt.option(["-c", "--config"], function (arg) {
		config_filename = arg;
		option.consume(arg);
	}, "Set the configuration file to use.");
	
	opt.option(["-h", "--help"], function (arg) {
		opt.usage();
	}, "This help page.");
	
	opt.optionWith(process.argv);
	
	if (config_filename) {
		config = JSON.parse(fs.readFileSync(config_filename).toString());
	}
	
	http.createServer(function (request, response) {
		console.log("request:", request.url);
		response.writeHead(200, "text/html");
		response.end(H.html(
			H.head(
				H.title("Hello World")
			),
			H.body(
				H.h1("Hello World")
			)
		).attr({lang: "en"}));
	}).listen(config.port);
```
