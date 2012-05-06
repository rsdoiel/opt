//
// Example program using opt
// csv2json.js - Convert a CSV file into JSON blob file suitable for 
// importing into MongoDB or Dirty DB.
// 
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2012 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//

var fs = require("fs"),
	path = require("path"),
	opt = require("opt");
	
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
	csv_filename = "-";
}

if (json_filename === false && args.length > 3) {
	json_filename = args[3].trim();
} else if (json_filename === false) {
	json_filename = "-";
}


// Main processing function
(function (csv_filename, json_filename) {
	var input = [], output = [];

	var fromCSV = function (i, line) {
		var row;
		try {
			row = JSON.parse("[" + line + "]");
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
		if (json_filename === "-") {
			console.log(toBlobs(structure, buf));
		} else {
			fs.writeFile(json_filename, toBlobs(structure, buf), "UTF-8");
		}
	};

	if (csv_filename === "-") {
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