//
// opt-mdb.js - A wrapper for the opt.js to use with MongoDB shell.
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.3d
//
process = {};
opt = {};
(function () {
	var self = this, dbname = db.getName();

	exports = {};
	load("opt.js");
	self.opt = exports;

	self.process.dbname = db.getName();
	db = db.getSiblingDB("admin"); // Switch to admin
	self.process.server = (db.runCommand({getCmdLineOpts : 1}));
	db = db.getSiblingDB(dbname); // Switch back to dbname
	self.process.hostname = hostname();
	self.process.cwd = pwd;
	// How do I re-create process.exit()?
	return self;
}());
