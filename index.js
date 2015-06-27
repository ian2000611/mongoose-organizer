"use strict";
var _ = require("lodash"),
    debug = require("debug")("mongoose-organizer"),
    SchemaConfiguration = require("./schema_configuration"),
    path = require("path");

/**
 * Creates a schema using the given configuration object.
 */
var makeSchema = function (conf) {
    var configuration = new SchemaConfiguration(conf);
    var mongoose = configuration.mongoose;
	debug("creating " + configuration.name + " schema");
    var NewSchema = new mongoose.Schema(configuration.definition, configuration.options);

    var populateSchemaMethods = function () {
        var entries = Object.keys(configuration.methods);

             entries.forEach(function(key) {
                var entry = entries[key];

                var methodName = entry,
                    method = configuration.methods[entry];
                debug("Instance method " + configuration.name + "." + methodName);
                NewSchema.methods[methodName] = method;
            });
    };

    var populateSchemaStatics = function () {
        var entries = Object.keys(configuration.statics);
             entries.forEach(function(key) {
                var entry = entries[key];

                var staticName = entry,
                    staticMethod = configuration.statics[entry];
                debug("Static method " + configuration.name + "." + staticName);
                NewSchema.statics[staticName] = staticMethod;
            });
    };

    var populateSchemaPlugins = function () {
            configuration.plugins.forEach(function(value) {
                var plugin = value;

                debug("installing plugin " + configuration.name + " " + plugin.name);
                NewSchema.plugin(plugin.method, plugin.options);
            });
    };

    var populateSchemaHandlers = function () {
        configuration.handlers.forEach(function(value) {
                var handler = value;

                debug("installing " + configuration.name + " " + handler.type + "-" + handler.event + " handler \"" + handler.description + "\"");
                NewSchema[handler.type](handler.event, handler.handler);
         });
    };

    var populateSchemaVirtuals = function () {
            configuration.virtuals.forEach(function(value) {
                var virtual = value;

                debug("installing virtual " + configuration.name + " - " + virtual.name);
                var virtDef = NewSchema.virtual(virtual.name, virtual.options);
                if (virtual.get) {
                    virtDef.get(virtual.get);
                }
                if (virtual.set) {
                    virtDef.set(virtual.set);
                }
            });
    };

    populateSchemaPlugins();
    populateSchemaMethods();
    populateSchemaStatics();
    populateSchemaHandlers();
    populateSchemaVirtuals();
    debug(configuration.name + " schema created");
    return NewSchema;
};

var autowire = function (dir) {
    var optionOverrides = arguments[2] === undefined ? {} : arguments[2];

    var schemaOptions = {
        name: path.basename(dir),
        definitionPath: path.join(dir,  "definition"),
        methodsPath: path.join(dir, "methods"),
        pluginsPath: path.join(dir, "plugins"),
        staticsPath: path.join(dir, "statics"),
        handlersPath: path.join(dir, "handlers"),
        virtualsPath: path.join(dir, "virtuals")
    };
    _.assign(schemaOptions, optionOverrides);
    var configuration = new SchemaConfiguration(schemaOptions);
    var schema = makeSchema(schemaOptions);
    var model = configuration.mongoose.model(schemaOptions.name, schema);
    return model;
};

module.exports = {
    makeSchema: makeSchema,
    autowire: autowire
};
