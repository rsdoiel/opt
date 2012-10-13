//
// rest-example-1.js - a simple example of using opt to create a web service.
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2012 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

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

