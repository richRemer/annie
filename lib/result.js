var Promise = require("es6-promise").Promise;

/**
 * Request result.  A Result is a Promise which fulfilles as an annie Response
 * object or rejects with an Error or an unhandled annie Response object.
 * @constructor
 */
function Result() {
    var result = this,
        context;

    Promise.call(this);

    // clear the context whenever "then" or "catch" are called
    ["then", "catch"].forEach(function(method) {
        result[method] = function() {
            context = null;
            Promise[method].apply(result, arguments);
        };
    });

    /**
     * Add a handler for responses which pass a filter function (which must
     * return true when the response passes).
     * @param {function} filter
     * @param {function} handler
     */
    this.filter = function(filter, handler) {
        var storedContext;

        // if there's no result context, create a new one and add a resolution
        // handler for the new context
        if (!context) {
            storedContext = context = [];
            this.then(function(res) {
                var handled = false;
                storedContext.forEach(function(rule) {
                    if (rule[0](res)) rule[1](res), handled = true;
                });
                if (!handled) throw res;
            });
        }

        // add this rule to the context
        context.push([filter, handler]);
    };
}

/**
 * @extends {Promise}
 */
Result.prototype = Object.create(Promise.prototype);

/**
 * Add a status code filtered handler.  The handler will only receive responses
 * which match the provided status.
 * @param {number} status
 * @param {function} handler
 */
Result.prototype.status = function(status, handler) {
    this.filter(function(res) {return res.status === status;}, handler);
};

/**
 * Add an information status filtered handler.  The handler will only receive
 * responses which are informational (1xx).
 * @param {function} handler
 */
Result.prototype.information = function(handler) {
    var filter = function(res) {return res.status >= 100 && res.status < 200;};
    this.filter(filter, handler);
};

/**
 * Add a success status filtered handler.  The handler will only receive
 * responses which are successful (2xx).
 * @param {function} handler
 */
Result.prototype.success = function(handler) {
    var filter = function(res) {return res.status >= 200 && res.status < 300;};
    this.filter(filter, handler);
};

/**
 * Add a redirect status filtered handler.  The handler will only receive
 * responses which are redirections (3xx).
 * @param {function} handler
 */
Result.prototype.redirect = function(handler) {
    var filter = function(res) {return res.status >= 300 && res.status < 400;};
    this.filter(filter, handler);
};

/**
 * Add a client error status filtered handler.  The handler will only receive
 * responses which are client errors (4xx).
 * @param {function} handler
 */
Result.prototype.clientError = function(handler) {
    var filter = function(res) {return res.status >= 400 && res.status < 500;};
    this.filter(filter, handler);
};

/**
 * Add a server error status filtered handler.  The handler will only receive
 * responses which are server errors (5xx).
 * @param {function} handler
 */
Result.prototype.serverError = function(handler) {
    var filter = function(res) {return res.status >= 500 && res.status < 600;};
    this.filter(filter, handler);
};

/**
 * Add an error status filtered handler.  The handler will only receive
 * responses which are errors (4xx/5xx).
 * @param {function} handler
 */
Result.prototype.error = function(handler) {
    var filter = function(res) {return res.status >= 400 && res.status < 600;};
    this.filter(filter, handler);
};

/** export the Result class */
module.exports = Result;
