"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var debug = require("debug")("mongoose-organizer");

var defaultOptions = {
    toJSON: { virtual: true },
    toObject: { virtuals: true }
};

/**
 * Option Values may be set explicitly or using a path that is require()d
 * @param config The raw configuration object
 * @param explicitKey The explicit configuration key
 * @param pathKey The config path key
 * @param defaultValue The default value
 * @returns {*} The resolved configuration value.
 */
var determineOptionValue = function (config, explicitKey, pathKey, defaultValue) {
    if (config[explicitKey]) {
        return config[explicitKey];
    } else if (config[pathKey]) {
        try {
            return require(config[pathKey]);
        } catch (err) {
            debug("caught error when requiring " + pathKey + '('+ config[pathKey] + "). Using default configuration value");
            return defaultValue;
        }
    } else {
        return defaultValue;
    }
};

var SchemaConfiguration = function SchemaConfiguration(config) {
    _classCallCheck(this, SchemaConfiguration);

    if (!config) {
        throw new Error("config parameter must be defined");
    }
    this.name = config.name;
    this.definition = determineOptionValue(config, "definition", "definitionPath", {});
    this.options = determineOptionValue(config, "options", "optionsPath", defaultOptions);
    this.plugins = determineOptionValue(config, "plugins", "pluginsPath", []);
    this.methods = determineOptionValue(config, "methods", "methodsPath", {});
    this.statics = determineOptionValue(config, "statics", "staticsPath", {});
    this.virtuals = determineOptionValue(config, "virtuals", "virtualsPath", []);
    this.handlers = determineOptionValue(config, "handlers", "handlersPath", []);
    this.mongoose = config.mongoose || require("mongoose");
};

module.exports = SchemaConfiguration;
