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
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var entry = _step.value;

                var methodName = entry,
                    method = configuration.methods[entry];
                debug("Instance method " + configuration.name + "." + methodName);
                NewSchema.methods[methodName] = method;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    };

    var populateSchemaStatics = function () {
        var entries = Object.keys(configuration.statics);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var entry = _step.value;

                var staticName = entry,
                    staticMethod = configuration.statics[entry];
                debug("Static method " + configuration.name + "." + staticName);
                NewSchema.statics[staticName] = staticMethod;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    };

    var populateSchemaPlugins = function () {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = configuration.plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var plugin = _step.value;

                debug("installing plugin " + configuration.name + " " + plugin.name);
                NewSchema.plugin(plugin.method, plugin.options);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    };

    var populateSchemaHandlers = function () {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = configuration.handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var handler = _step.value;

                debug("installing " + configuration.name + " " + handler.type + "-" + handler.event + " handler \"" + handler.description + "\"");
                NewSchema[handler.type](handler.event, handler.handler);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    };

    var populateSchemaVirtuals = function () {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = configuration.virtuals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var virtual = _step.value;

                debug("installing virtual " + configuration.name + " - " + virtual.name);
                var virtDef = NewSchema.virtual(virtual.name, virtual.options);
                if (virtual.get) {
                    virtDef.get(virtual.get);
                }
                if (virtual.set) {
                    virtDef.set(virtual.set);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
			console.log(_iteratorError);
                    //throw _iteratorError;
                }
            }
        }
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
