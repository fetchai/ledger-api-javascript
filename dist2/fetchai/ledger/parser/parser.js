"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../errors");
var address_1 = require("../crypto/address");
var FUNC = /function ([\s\S]*?)endfunction/;
var FUNC_NAME_WITH_ANNOTATION = /@[a-z0-9]+[\s]{0,}(function)+[\s]{0,}[a-z0-9]{1,}/;
var PERSISTENT_STATEMENT = /persistent([\s\S]*?);/;
var FUNC_NAME = /(?<=function)([\s\S]*?)(?=\()/;
var USE_STATEMENT = /use([\s\S]*?);/;
var USE_STATEMENT_WITH_SQUARE_BRACKETS_NAME = /(?<=\use).+?(?=\[)/;
var BETWEEN_SQUARE_BRACKETS = /(?<=\[).+?(?=\])/;
var BETWEEN_ROUND_BRACKETS = /(?<=\().+?(?=\))/;
var SINGLE_LINE_COMMENT = /\/\/.*/;
var MULTI_LINE_COMMENT = /\/\*([\s\S]*?)\*\//;
var Parser = /** @class */ (function () {
    function Parser() {
    }
    Parser.remove_comments = function (source) {
        var regexp = RegExp(SINGLE_LINE_COMMENT, 'g');
        var regexp2 = RegExp(MULTI_LINE_COMMENT, 'g');
        source = source.replace(regexp, '');
        return source.replace(regexp2, '');
    };
    Parser.get_functions = function (source) {
        source = Parser.remove_comments(source);
        var regexp = RegExp(FUNC, 'g');
        var temp = __spread(source.matchAll(regexp));
        var temp2 = temp.map(function (arr) { return arr[0]; });
        return temp2;
    };
    Parser.get_sharded_use_names = function (source) {
        var sharded_len = 'sharded'.length;
        source = Parser.remove_comments(source);
        var regexp_func = RegExp(FUNC, 'g');
        // we don't want to look inside functions, so we remove them.
        source = source.replace(regexp_func, '');
        var regexp_persistent = RegExp(PERSISTENT_STATEMENT, 'g');
        var array = __spread(source.matchAll(regexp_persistent));
        var sharded_funcs = [];
        for (var i = 0; i < array.length; i++) {
            // let s = array[i].slice(persistent_len).trim()
            if (array[i][1].includes('sharded')) {
                var s = array[i][1].trim().slice(sharded_len);
                s = s.trim();
                var func_name = s.substr(0, s.indexOf(' '));
                sharded_funcs.push(func_name);
            }
        }
        return sharded_funcs;
    };
    Parser.get_annotations = function (source) {
        source = Parser.remove_comments(source);
        var regexp = RegExp(FUNC_NAME_WITH_ANNOTATION, 'g');
        var array = __spread(source.matchAll(regexp));
        var annotations = {};
        for (var i = 0; i < array.length; i++) {
            var split = array[i][0].split('function');
            var annotation = split[0].trim();
            var func_name = split[1].trim();
            if (typeof annotations[annotation] === 'undefined') {
                annotations[annotation] = [];
            }
            annotations[annotation].push(func_name);
        }
        return annotations;
    };
    Parser.get_func_params = function (func_source) {
        var func_params = BETWEEN_ROUND_BRACKETS.exec(func_source);
        var ret = [];
        // we start by coding only for funcs with params
        if (func_params == null)
            return ret;
        var func_params_arr = func_params[0].split(',');
        // assumes that func param names must be unique, delete when verified this is true
        // we create an object of with function param identifiers as the keys, adn type as values
        for (var i = 0; i < func_params_arr.length; i++) {
            var _a = __read(func_params_arr[i].split(':'), 2), identifier = _a[0], param_type = _a[1];
            ret.push({ identifier: identifier.trim(), type: param_type.trim() });
        }
        return ret;
    };
    Parser.parse_use_statements = function (source) {
        var regexp = RegExp(USE_STATEMENT, 'g');
        var use_statements = __spread(source.matchAll(regexp));
        var ret = [];
        if (use_statements === null)
            return ret;
        for (var i = 0; i < use_statements.length; i++) {
            // if it has square brackets this should match, else it is a use without
            var use_name = USE_STATEMENT_WITH_SQUARE_BRACKETS_NAME.exec(use_statements[i]);
            var obj = {};
            // if null then use statement has no params, so we deal with it differently.
            if (use_name === null) {
                var non_paramaterized_use_name = /(?<=use)([\s\S]*?)(?=;)/;
                var identifier = non_paramaterized_use_name.exec(use_statements[i]);
                obj.sharded = false;
                obj.identifier = identifier[0].trim();
                ret.push(obj);
                continue;
            }
            // all use statements with params should be sharded.
            obj.sharded = true;
            obj.identifier = use_name[0].trim();
            var use_params = BETWEEN_SQUARE_BRACKETS.exec(use_statements[i]);
            obj.params = use_params[0].split(',').map(function (param) { return param.trim(); });
            ret.push(obj);
        }
        return ret;
    };
    Parser.get_resource_addresses = function (source, func_name, ordered_args) {
        var sharded_use_names = Parser.get_sharded_use_names(source);
        // we get all functions including bodies
        var funcs = Parser.get_functions(source);
        var resource_addresses = [];
        var func;
        for (var i = 0; i < funcs.length; i++) {
            var name_1 = FUNC_NAME.exec(funcs[i])[0].trim();
            // we get the whole function from the function name
            if (name_1 == func_name) {
                func = funcs[i];
                break;
            }
        }
        if (typeof func === 'undefined') {
            throw new errors_1.ValidationError("named function " + func_name + " was not found in contract");
        }
        var func_params = Parser.get_func_params(func);
        var use_statements = Parser.parse_use_statements(func);
        // we only bother with first match of use statement within each func - delete this comment if this is correct usage.
        // will mod to ad to work on all use statements
        var valid_perisistent_statements = use_statements.filter(function (obj) { return (obj.sharded === true); }).every(function (obj) { return (sharded_use_names.includes(obj.identifier)); });
        if (!valid_perisistent_statements) {
            // at least one of our parameterized use statements doesn't have an associated use statement
            throw new errors_1.ValidationError('All parameterized use statements must have an associated Persistent statement stating that they are sharded ');
        }
        for (var i = 0; i < use_statements.length; i++) {
            if (!use_statements[i].sharded) {
                resource_addresses.push(use_statements[i].identifier);
                continue;
            }
            for (var j = 0; j < use_statements[i].params.length; j++) {
                if (use_statements[i].params[j].startsWith('"')) {
                    // string we just add the name
                    resource_addresses.push(use_statements[i].identifier + '.' + use_statements[i].params[j].substring(1, use_statements[i].params[j].length - 1));
                }
                else {
                    for (var k = 0; k < func_params.length; k++) {
                        if (use_statements[i].params[j] == func_params[k].identifier) {
                            if (func_params[k].type !== 'Address' && func_params[k].type !== 'String') {
                                throw new errors_1.ValidationError("named function " + func_name + " params referenced by use statements must be of type Address or String: found type " + func_params[k].type);
                            }
                            // if it is an address we take the display.
                            if (ordered_args[k] instanceof address_1.Address) {
                                resource_addresses.push(use_statements[i].identifier + '.' + ordered_args[k].toString());
                            }
                            else {
                                resource_addresses.push(use_statements[i].identifier + '.' + ordered_args[k]);
                            }
                        }
                    }
                }
            }
        }
        return resource_addresses;
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map