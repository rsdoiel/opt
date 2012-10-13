//
// md-server.js - demo of using opt module to create a RESTful markdown web page server
// 
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2012 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

var fs = require("fs"),
    path = require("path"),
    cluster = require("cluster"),
    os = require("os"),
    http = require("http"),
    ghm = require("github-flavored-markdown"),
    tbone = require("tbone"),
    opt = require("../opt").create(),
    default_config = {
        port: 8080,
        host: "localhost",
        numChildren: (os.cpus().length || 2),
        docs: ""
    },
    config_name = path.basename(process.argv[1],
            path.extname(process.argv[1])) + ".conf";

var config = opt.configSync(default_config, [
    config_name,
    path.join("/usr", "local", "etc", config_name),
    path.join("/usr", "etc", config_name),
    path.join("/etc", config_name)
]);

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

// Now define event handlers for opt.
var homepage = function (request, response, matching, rule_no) {
    // Process the home page request
    var h = new tbone.HTML();

    console.log("Home page request", matching, "matching rule", rule_no);
    response.end(h.html(
    	h.head(
    		h.title("md-sever.js, an opt web example.")
    	),
    	h.body(
    		h.h1("md-server.js example"),
    		h.dl(
    			h.dt("Requested URL"),
    			h.dd(request.url),
    			h.dt("Matching"),
    			h.dd(String(matching)),
    			h.dt("Rule No."),
    			h.dd(rule_no)
    		)
    	)
    ));
};

var markdown_page = function (request, response, matching, rule_no) {
	var h = new tbone.HTML(),
		filename = request.url;

    console.log("Markdown page, url, ", request.url, " rule", rule_no, "matching", matching);
	fs.readFile(path.join(config.docs, filename), function (err, buf) {
		var content;
		if (err) {
			content = err;
		} else if (buf) {
			content = ghm.parse(buf.toString());
		} else {
			content = "No content"
		}
		
		// Process the markdown file if it exists
		response.end(h.html(
			h.head(
				h.title(filename)
			),
			h.body(
				h.header(
					h.h1(filename)
				),
				h.article(content),
				h.footer("Example common footer")
			)
		));
	});
};


var help =  function (request, response) {
    console.log("Help page");
    response.end(opt.restHelp());
};

var status404 = function (request, response, matching, rule_no) {
    // Process the home page request
    var h = new tbone.HTML();

    console.log("404 page", matching, "matching rule", rule_no);
    response.end(h.html(
    	h.head(
    		h.title("404, File not found")
    	),
    	h.body(
    		h.h1("404 File not found"),
    		h.dl(
    			h.dt("Requested URL"),
    			h.dd(request.url),
    			h.dt("Matching"),
    			h.dd(String(matching)),
    			h.dt("Rule No."),
    			h.dd(rule_no)
    		)
    	)
    ));
};
    
// Bind them to some RESTful requests

// Now define a rule for the markdown page
opt.rest("get", new RegExp("\.md$"), markdown_page,
	"Display a markdown page.");

// Handle the homepage request
opt.rest("get", new RegExp("^(|\/|\/index\.html)$"), homepage,
	"Show server homepage. List the Markdown files available for viewing.");

// Handle the help page request.
opt.rest("get", new RegExp("^/help$", "i"), help,
	"Show help documentation for server.");

// Handle 404 errors
opt.rest("get", new RegExp("^/*"), status404,
	"Show the 404 Page.");


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
        console.log("PARENT forked pid:", worker.pid);
    }
};


var childProcess = function (config) {
	console.log("CHILD's pid:", process.pid);
    console.log("CHILD CONFIG:", config);
    process.on("message", function (msg) {
        console.log("CHILD:", msg);
    });

    // Process the http requests, server markdown files or 404.
    // Spawn the http server
    http.createServer(function (request, response) {
		console.log("processing", request.url);
        opt.restWith(request, response);
    }).listen(config.port, config.host);
};

// Setup command line arg processing
opt.optionHelp("USAGE node md-server.js" + path.basename(process.argv[1]),
	"SYNOPSIS:\n\tdemo of using opt and cluster module together\n\n ",
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
	if (param !== undefined && param.trim()) {
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
	if (param !== undefined && param.trim()) {
		config = JSON.parse(fs.readFileSync(param).toString());
	}
}, "Set the JSON configuration file to use.");

opt.option(["-d", "--documents"], function (param) {
	if (param === undefined) {
		opt.usage("--documents expects an argument", 1);
	}
	config.docs = param;
	opt.consume(param);
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

// Process the command line arguments
opt.optionWith(process.argv);

//
// Main
//
if (!config.docs) {
	opt.usage("You must set a document root. Try --documents", 1);
}
if (!config.port) {
	opt.usage("You must set a port number listen on. Try --port", 1);
}

// Launch the web server
if (cluster.isMaster === true) {
	parentProcess(config);
} else {
	childProcess(config);
}
