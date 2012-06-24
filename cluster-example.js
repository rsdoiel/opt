//
// cluster-example.js - demo of using opt module for configuration when
// using the cluster module.
//
"use strict";

/*jslint devel: true, node: true */
/*global fs, opt */
/*properties
    argv, basename, configSync, consume, cpus, create, error, exit, extname,
    fork, host, isMaster, join, length, log, numChildren, on, parse, pid, port,
    process, readFileSync, set, setup, stringify, toFixed, toString, trim,
    usage, readFileSync, writeFileSync, configSync
*/

var fs = require("fs"),
    path = require("path"),
    cluster = require("cluster"),
    os = require("os"),
    opt = require("./opt").create(),
    config = {
        port: 80,
        host: "localhost",
        numChildren: (os.cpus().length || 2)
    },
    config_name = path.basename(process.argv[1],
            path.extname(process.argv[1])) + ".conf";

config = opt.configSync(config, [
    config_name,
    path.join("/usr", "local", "etc", config_name),
    path.join("/usr", "etc", config_name),
    path.join("/etc", config_name)
]);

opt.setup("USAGE node " + path.basename(process.argv[1]),
    "SYNOPSIS:\n\tdemo of using opt and cluster module together\n\n " +
    "OPTIONS",
    "Copyright notice would go here.");

opt.set(["-t", "--threads"], function (param) {
    if (Number(param).toFixed(0) > 2) {
        config.numChildren = Number(param).toFixed(0);
    } else {
        opt.usage("threads must be number greater then two.", 1);
    }
}, "Set the number of service threads to run.");

opt.set(["-H", "--host"], function (param) {
    if (param.trim()) {
        config.host = param.trim();
        opt.consume(param);
    }
}, "Set the hostname to listen for.");

opt.set(["-p", "--port"], function (param) {
    if (Number(param).toFixed(0) > 0) {
        config.port = Number(param).toFixed(0);
        opt.consume(param);
    } else {
        console.error("ERROR:", param, "is not a valid port number");
    }
}, "Set the port to listen on.");

opt.set(["-c", "--config"], function (param) {
    if (param.trim()) {
        config = JSON.parse(fs.readFileSync(param).toString());
    }
}, "Set the JSON configuration file to use.");

opt.set(["-g", "--generate"], function (param) {
    if (param !== undefined && param.trim()) {
        fs.writeFileSync(param, JSON.stringify(config));
    } else {
        console.log(JSON.stringify(config));
    }
    opt.consume(param);
    process.exit(0);
}, "Generate a configuration file from current command line options. This should be the last option specified.");

opt.set(['-h', '--help'], function () {
    opt.usage();
}, "This help document.");

opt.parse(process.argv);


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
};


var childProcess = function (config) {
    console.log("CHILD CONFIG:", config);
    process.on("message", function (msg) {
        console.log("CHILD:", msg);
    });
};

//
// Main
// 
if (cluster.isMaster === true) {
    parentProcess(config);
} else {
    childProcess(config);
}
