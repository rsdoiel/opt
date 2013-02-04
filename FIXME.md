Things to fix
=============

# Version 0.2.0-pre

* optionsWith() - should take a second parameter that is a sanity check function.
* optionsHelp()/restHelp() - should take a template
* restHelp() - needs to set a default route of /help
* rest() - should allow defining a route by both pathname and mime type accepted (e.g. /api/thing for mime-type application/json)
* If opt is called from with in YUI then use Y.log() instead of console.log()


# Version 0.0.9

* optionsHelp() is named ambiguously; Think of a better name, depreciate old name
* Need to do a sanity check on depreciated method calls. They should throw a warning so legacy code failures are clear
* Need to remove older versions of opt from npm repository
* Need to remove package dependency caused by example code (e.g. markdown)
 