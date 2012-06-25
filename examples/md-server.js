//
// md-server.js - demo of using opt module to create a RESTful markdown web page server
// 
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2012 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true */
/*global fs, opt */

"use strict";

var fs = require("fs"),
    path = require("path"),
    cluster = require("cluster"),
    os = require("os"),
    http = require("http"),
    opt = require("opt").create(),
    config = {
        port: 80,
        host: "localhost",
        numChildren: (os.cpus().length || 2)
    },
    config_name = path.basename(process.argv[1],
            path.extname(process.argv[1])) + ".conf";

var toBoolean = function (value) {
    if (typeof value === "string") {
        value = value.toLowerCase();
    }
    switch (value) {
    case "true":
    case "1":
    case true:
    case "false":
    case "0":
    case false:
        return true;
    default:
        return false;
    }
};

opt.config(config, [
    config_name,
    path.join("/usr", "local", "etc", config_name),
    path.join("/usr", "etc", config_name),
    path.join("/etc", config_name)
]);

opt.optionHelp("USAGE node " + path.basename(process.argv[1]),
    "SYNOPSIS:\n\tdemo of using opt and cluster module together\n\n " +
    "OPTIONS",
    "Copyright notice would go here.");

opt.option(["-t", "--threads"], function (param) {
    if (Number(param).toFixed(0) > 2) {
        config.numChildren = Number(param).toFixed(0);
    } else {
        opt.usage("threads must be number greater then two.", 1);
    }
}, "Set the number of service threads to run.");

opt.option(["-H", "--host"], function (param) {
    if (param.trim()) {
        config.host = param.trim();
        opt.consume(param);
    }
}, "Set the hostname to listen for.");

opt.option(["-p", "--port"], function (param) {
    if (Number(param).toFixed(0) > 0) {
        config.port = Number(param).toFixed(0);
        opt.consume(param);
    } else {
        console.error("ERROR:", param, "is not a valid port number");
    }
}, "Set the port to listen on.");

opt.option(["-c", "--config"], function (param) {
    if (param.trim()) {
        config = JSON.parse(fs.readFileSync(param).toString());
    }
}, "Set the JSON configuration file to use.");

opt.option(["-d", "--documents"], function (param) {
    if (param.trim()) {
        config.docs = param.trim();
    }
}, "Set the document root to server the Markdown files from.");

opt.option(["-g", "--generate"], function (param) {
    if (param !== undefined && param.trim()) {
        fs.writeFileSync(param, JSON.stringify(config));
    } else {
        console.log(JSON.stringify(config));
    }
    opt.consume(param);
    process.exit(0);
}, "Generate a configuration file from current command line options. This should be the last option specified.");

opt.option(['-h', '--help'], function () {
    opt.usage();
}, "This help document.");


// Now define event handlers for opt.
var homepage = function (request, response, matching, rule_no) {
    // Process the home page request
    console.log("Rule", rule_no, "matching", matching);
};

var markdown_page = function (request, response, matching, rule_no) {
    // Process the markdown file if it exists
    console.log("Rule", rule_no, "matching", matching);
};

    
// define some RESTful requests to events.
opt.rest("get", new RegExp("^(|\/)$"), {asMarkdown: toBoolean}, homepage, "Show server homepage. List the Markdown files available for viewing.");

opt.rest("get", new RegExp("^\/help$", "i"), {asMarkdown: toBoolean}, function (request, response) {
    console.log("Help page");
    response.end(opt.restHelp("html"));
}, "Show help documentation for server.");

// Now define a default rule (i.e. everything else)
opt.rest("get", new RegExp("*"), {asMarkdown: toBoolean}, markdown_page, "Display a markdown pageL.");


var parentProcess = function (config) {
    var child_processes = {}, i, worker, restart_process;

    restart_process = function (worker) {
        var new_worker, old_pid = worker.pid;

        // Prune the old worker
        delete child_processes[old_pid];

        console.log("Restarted worker", old_pid, "as", new_worker.pid);

        new_worker = cluster.fork().process;
        child_processes[new_worker.pid] = new_worker;
    };

    console.log("PARENT CONFIG:", config);
    for (i = 0; i < config.numChildren; i += 1) {
        worker = cluster.fork().process;
        child_processes[worker.pid] = worker;
        child_processes[worker.pid].on("death", restart_process);
        console.log("PARENT pid:", worker.pid);
    }
    // Spawn the http server
    http.createServer(function (request, response) {
        if (opt.restWith(request, response)) {
            console.log("processing", request.url);
        } else {
            console.error("Not found", request.url);
            response.statusCode = 404;
            response.end("Not Found");
        }
    });
};


var childProcess = function (config) {
    console.log("CHILD CONFIG:", config);
    process.on("message", function (msg) {
        console.log("CHILD:", msg);
    });
    // Process the http requests, server markdown files or 404.
};

//
// Main
//
opt.on("ready", function (config) {
    opt.optionWith(process.argv);
    if (cluster.isMaster === true) {
        parentProcess(config);
    } else {
        childProcess(config);
    }
});
