opt
===
revision 0.0.6
--------------

# Overview

A very simple options module for NodeJS command line apps. Version 0.0.4
adds support with a new configSync() method to load and merge in a default
configuration file.

# Config Example 1

This is the synchronous version

	var path = require('path'),
		opt = require('./opt');
	
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


# Config Example 2

This is the asynchronous version

	var path = require('path'),
		opt = require('./opt');
	
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


# Examples 1

Display a help message with -h and --help on the command line.

Source code example-1.js

	var util = require('util'),
		opt = require('./opt');
	
	opt.setup("USAGE node example-1.js.",
		"SYNOPSIS\n\n\t\tDemon straight how opt works: node example-1.js --help",
		"OPTIONS");
	opt.set(['-h','--help'], opt.usage, "This help document.");
		
	// Parse the command line options
	if (process.argv.length < 3) {
		console.log("Try using a command line option for demo:\n" + opt.usage());
	} else {
		opt.parse(process.argv);
	}

# Example 2

Source code example-2.js

	var util = require('util'),
		path = require('path'),
		opt = require('./opt'),
		config = {},
		today = new Date();
	
	opt.setup("USAGE:  node " + path.basename(process.argv[1]) + " --help",
		"SYNOPSIS: demo a realistic example of using opt.\n\n\t\tnode " + path.basename(process.argv[1]) + "  --first-name=john \\ \n\t\t\t --last-name=doe \\ \n\t\t\t--start=\"2011-01-01\" --end=\"now\"",
		"OPTIONS",
		" copyright (c) 2011 all rights reserved\n" +
		" Released under New the BSD License.\n" +
		" See: http://opensource.org/licenses/bsd-license.php\n");
	opt.set(['-h','--help'], opt.usage, "This help document.");
	
	opt.set(['-f', '--first-name'], function (first_name) {
			config.first_name = first_name;
	}, "Set the first name column contents. E.g. John");
	
	opt.set(['-l', '--last-name'], function (last_name) {
		config.last_name = last_name;
	}, "Set the last name column contents. E.g. Doe");
	
	
	opt.set(['-s','--start'], function(start_date) {
			config.start = start_date;
	}, "Set the start date for reporting in YYYY-MM-DD format.");
	
	opt.set(['-e','--end'], function(end_date) {
			if (end_date.length == 10 &&
					end_date.match(/20[0-2][0-9]-[0-3][0-9]-[0-3][0-9]/)) {
					config.end = end_date;
			} else {
					config.end = today.getFullYear() + '-' + 
							String("0" + (today.getMonth() + 1)).substr(-2) + '-' +
							String("0" + (today.getDate())).substr(-2);
			}
	}, "Set the last date for reporting.  Usually a date in YYYY-MM-DD format or 'now'.");
	
	// Parse the command line options
	if (process.argv.length < 3) {
		console.log("Try using a command line option for demo:\n" + opt.usage());
		process.exit(1);
	} else {
		opt.parse(process.argv);
	}
	console.log("\nConfig object properties set by opt: ");
	console.log(util.inspect(config));

# Example, json blob to Shell script file

Source code json2sh.js

	var fs = require('fs'),
		path = require('path'),
		opt = require('opt'),
		input = '',
		output = '', fields = {}, buf;
	
	opt.setup("USAGE: node " + path.basename(process.argv[1]) + " --input=JSON_FILENAME --output=BASH_FILENAME",
		"SYNOPSIS: Report processsed urls in the database generate by " + path.basename(process.argv[1]) + ".\n",
		"OPTIONS:",
		" by R. S. Doiel " +
		" copyright (c) 2012 all rights reserved " +
		" Released under New the BSD License. " + 
		" See: http://opensource.org/licenses/bsd-license.php"
	);
	
	opt.set(['-h', '--help'], opt.usage, "This help page.");
	opt.set(['-i', '--input'], function (param) {
		input = param;
	}, "Set the name of the JSON file to read.");
	opt.set(['-o', '--output'], function (param) {
		output = param;
	}, "Set the name of the JSON file to read.");
	opt.parse(process.argv);
	
	fields = JSON.parse(fs.readFileSync(input).toString());
	buf = [
		"#",
		"# generated with " + path.basename(process.argv[1]),
		"# from " + input,
		"#"
	];
	Object.keys(fields).forEach(function (ky) {
		buf.push(String(ky).toUpperCase() + "=\"" + fields[ky].trim() + "\"");
	});
	buf.push("\n");
	fs.writeFileSync(output, buf.join("\n"));

# Example 3, handing options and resolving argv

Source code: example-3.js

	var util = require("util"),
			path = require("path"),
			opt = require("./opt"),
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
	opt.set(["-h", "--help"], opt.usage, "This help page.");
	
	new_args = opt.parse(process.argv);
	if (new_args[1] !== undefined) {
			input_name = new_args[1];
	}
	if (new_args[2] !== undefined) {
			output_name = new_args[2];
	}
	console.log("New args: " + util.inspect(new_args));
	console.log("Input name:", input_name);

# Example 4, converting a csv file to JSON blob file

Source Code: csv2json.js

	var fs = require('fs'),
		path = require('path'),
		opt = require('opt');
		
	var csv_filename = false, 
		json_filename = false,
		structure = {},
		lines = [],
		args = [];
	
	opt.setup("USAGE: node " + path.basename(process.argv[1]) + " [options] CSVFILE JSONFILE",
			"SYNOPSIS: Read a CSV file, generate a stream of JSON blobs suitable\n" +
			" into for dirty db or MongoDB.",
			"OPTIONS:",
			" by R. S. Doiel]\n" +
			" copyright (c) 2012 all rights reserved\n" +
			" Released under New the BSD License.\n" + 
			" See: http://opensource.org/licenses/bsd-license.php"
	);
	
	opt.consume(true);
	opt.set(["-i", "--input", "--csv"], function (param) {
			csv_filename = param;
			opt.consume(param);
	}, "Set the name of the CSV file to read in. If name is - then read from standard input.");
	
	opt.set(["-o", "--output", "--json"], function (param) {
			json_filename = param;
			opt.consume(param);
	}, "Set the of the JSON blob file to output. If name is - then write to standard output.");
	opt.set(["-h", "--help"], opt.usage, "This help page.");
	
	args = opt.parse(process.argv);
	
	if (args === true &&
		csv_filename === false &&
		json_filename === false) {
		opt.usage("\n\tTry --help", 1);
	}
	
	if (csv_filename === false && args.length > 2) {
		csv_filename = args[2].trim();
	} else if (csv_filename === false) {
		csv_filename = '-';
	}
	
	if (json_filename === false && args.length > 3) {
		json_filename = args[3].trim();
	} else if (json_filename === false) {
		json_filename = '-';
	}
	
	
	// Main processing function
	(function (csv_filename, json_filename) {
		var input = [], output = [];
	
		var fromCSV = function (i, line) {
			var row;
			try {
				row = JSON.parse('[' + line + ']');
			} catch (err) {
				console.error("ERROR: Invalid CSV file at line", i);
				console.error("\t", line);
				process.exit(1);
			}
			return row;
		};
		
		var toBlobs = function (structure, lines) {
			var output = [];
			
			var toBlob = function (line, i) {
				var blob = {};
				line.forEach(function (cell, j) {
					if (structure[j] !== undefined) {
						blob[structure[j]] = cell;
					} else {
						blob["field_" + j] = cell;
					}
				});
				output.push(JSON.stringify(blob));
				return blob;
			};
			
			lines.forEach(toBlob);
			return output.join("\n");
		};
	
		var csv2json = function (lines, json_filename) {
			var structure, row, buf = [];
	
			lines.split("\n").forEach(function (line, i) {
				if (line.trim().length > 0) {
					if (i === 0) {
						structure = fromCSV(i, line);
					} else {
						buf.push(fromCSV(i, line));
					}
				}
			});
			if (json_filename === '-') {
				console.log(toBlobs(structure, buf));
			} else {
				fs.writeFile(json_filename, toBlobs(structure, buf), "UTF-8");
			}
		};
	
		if (csv_filename === '-') {
			(function () {
				var buf = [], interval_id;
				process.stdin.resume();
				process.stdin.on("data", function (chunk) {
					buf.push(chunk.toString());
				});
				
				process.stdin.on("end", function () {
					csv2json(buf.join(""), json_filename);
				});
			}());
		} else {
			fs.readFile(csv_filename, function (err, buf) {
				if (err) {
					console.error("Can't read", csv_filename);
					process.exit(1);
				}
				csv2json(buf.toString(), json_filename);
			});
		}
	}(csv_filename, json_filename));


# Putting it all together

Using opt with the cluster module to configure parent and children.

	var fs = require("fs"),
		path = require("path"),
		cluster = require("cluster"),
		os = require("os");
	
	var opt = require("opt");
		
	var config = { port: 80, host: "localhost", numChildren: (os.cpus().length || 2) },
		config_name = path.basename(process.argv[1], 
				path.extname(process.argv[1])) + ".conf";
	
	config = opt.configSync(config, [
			config_name,
			path.join("/usr", "local", "etc", config_name),
			path.join("/usr", "etc", config_name),
			path.join("/etc", config_name)
		]);
	
	opt.setup("USAGE node " + path.basename(process.argv[1]),
		"SYNOPSIS: demo of using opt and cluster module together\n" +
		"OPTIONS",
		"Copyright notice would go here.");
	
	opt.set(["-t", "--threads"], function (param) {
		if (Number(param).toFixed(0) > 2) {
			config.numChildren = Number(param).toFixed(0);
		} else {
			opt.usage("threads must be number greater then two.", 1);
		}
	}, "Set the number of web server threads to run.");
	
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
	
	opt.set(['-h', '--help'], opt.usage, "This help document.");
	
	opt.parse(process.argv);
	
	
	var parentProcess = function (config) {
		var child_process = {}, i, worker;
		
		console.log("PARENT CONFIG:",config);
		for (i = 0; i < config.numChildren; i += 1) {
			worker = cluster.fork();
			child_process[worker.pid] = worker;
			child_process[worker.pid].on("death", function (worker) {
				var new_worker, old_pid = worker.pid;
	
				// Prune the old worker
				delete child_processes[old_pid];
	
				console.log("Restarted worker", old_pid, "as", new_worker.pid);			
				new_worker = cluster.fork();
				child_processes[new_worker.pid] = new_worker;
			});
			console.log("PARENT pid:", worker.pid);
		}
	};
	
	
	var childProcess = function (config) {
		console.log("CHILD CONFIG:",config);
		process.on("message", function (msg) {
			console.log("CHILD:", msg);
		});
		http.createServer(function (req, res) {
			res.writeHead(200, {"content-type": "text/plain"});
			res.end("Hello World! from pid:" + process.pid);
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

