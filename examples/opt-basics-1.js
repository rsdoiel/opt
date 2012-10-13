//
// Putting it all together.
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

// Importing some modules
var util = require("util"),
    http = require("http"),
    path = require("path"),
    // import and create the opt object
    opt = require("../opt").create();

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

