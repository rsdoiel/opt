opt changes
===========

# version 0.0.7 to 0.0.8

This following functions have been depreciated.

* opt.set(...) has been depreciated in favor of opt.option(...)
* opt.parse(...) has been depreciated in favor of opt.optionWith(...)
* opt.setup(...) has been depreciated in favor of opt.optionHelp(...)

This following functions have been added.

* opt.rest(...) has been added for defining RESTful request processing
* opt.restWith(...) has been addded to process http.ServerRequest and http.ServerResponse based on the rules defined with opt.rest(...)
* opt.restHelp(...) has been added to produce HTML from markdown help message strings


The following were removed.

* opt.help() - There are separate help message trees for command line options and restful options

# version 0.0.6 to 0.0.7

## Declaration changes

When invoking the opt module. You need to create a new opt object. 

### 0.0.6 and earlier

```JavaScript
	opt = require("opt");
```

### 0.0.7

```JavaScript
	opt = require("opt").create();
```

## Changes in referencing help message.

### 0.0.6 and earlier

```JavaScript
	opt.set(["-h", "--help"], opt.usage, "This is the help message");
```

### 0.0.7

```JavaScript
	opt.set(["-h", "--help"], function () {
		opt.usage();
	}, "This is the help message");
```