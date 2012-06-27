opt
===
revision 0.0.9
--------------

# Overview

opt is a toolkit for building either command line programs or RESTful
web services. It uses a common pattern for setting up and processing
JSON based configuration files, command line options and RESTful API
calls.

Using the module is usually invoked by

```javascript
var opt = require("opt").create();
```
It is available from github at https://github.com/rsdoiel/opt and
can be installed using npm

```sh
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
	opt = require("../opt").create();

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
	opt = require("../opt").create();

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

    opt.optionWith(process.argv[1]);

    // config should now hold the merge configuration
    // from default_config and the first configuration file 
    // found in the search path list.
    console.log("Processed config: ", config);
});
```

## A simple web server API

```javascript
```

