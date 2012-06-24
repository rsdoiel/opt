opt changes
===========


# version 0.0.6 to 0.0.7

## Declaration changes

When invoking the opt module. You need to create a new opt object. 

### 0.0.6 and earlier

	opt = require("opt");

### 0.0.7 and later

	opt = require("opt").create();

## Changes in referencing help message.

### 0.0.6 and earlier

	opt.set(["-h","--help"], opt.usage, "This is the help message");

### 0.0.7 and later

	opt.set(["-h","--help"], function () {
		opt.usage();
	}, "This is the help message");
