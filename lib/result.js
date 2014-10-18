var prop = require("propertize"),
    Promise = require("es6-promise").Promise,
    Response = require("./response");

/**
 * Request result.  Result extends Promise and adds convenience methods for
 * handling Response objects.
 * @param {function} resolver
 * @param {string} label
 * @constructor
 */
function Result(resolver, label) {
    var result = this,
        rules = [],
        proxyPromise,
        chained;

    Promise.call(this, resolver, label);

    // setup a proxy promise to filter fulfillments
    proxyPromise = Promise.prototype.then.call(this, function(res) {
        // if there are no rules, resolve to the response
        if (rules.length === 0) return res;
        
        // otherwise, resolve to result of first matching rule handler
        for (var i in rules) {
            if (rules[i].filter(res)) {
                return rules[i].handler(res);
            }
        }

        // no rule was matched, throw unhandled response
        throw res;
    });
    
    // when then or catch is called, chain it to the proxy
    ["then", "catch"].forEach(function(method) {
        result[method] = function() {
            chained = true;
            return proxyPromise[method].apply(proxyPromise, arguments);
        }
    });
    
    /**
     * Add a result rule.  When the result resolves to a Response, the Response
     * will first be checked against all of the rule filters and passed to any
     * corresponding fulfillment handler which passes the filter.  This is the
     * first fulfillment handler for the Result and will be called before all
     * others.  This method is chainable.
     * @param {function} filter
     * @param {function} handler
     * @returns {Result}
     */
    this.addRule = function(filter, handler) {
        if (chained) throw new Error("rule must be added before then/catch");    
        rules.push({filter: filter, handler: handler});
        return this;
    };
}

/**
 * @extends {Promise}
 */
Result.prototype = Object.create(Promise.prototype);

/**
 * Add a status code filtered handler.  The handler will only receive responses
 * which match the provided status.  This method is chainable.
 * @param {number} status
 * @param {function} handler
 * @returns {Result}
 */
Result.prototype.status = function(status, handler) {
    return this.addRule(function(res) {
        return res.status === status;
    }, handler);
};

/**
 * Add a status range filtered handler.  The handler will only receive responses
 * which fall within the given range.  This method is chainable.
 * @param {number} minStatus
 * @param {number} maxStatus
 * @param {function} handler
 * @returns {Result}
 */
Result.prototype.statusRange = function(minStatus, maxStatus, handler) {
    return this.addRule(function(res) {
        return res.status >= minStatus && res.status <= maxStatus;
    }, handler);
};

/**
 * Add an information status filtered handler.  The handler will only receive
 * responses which are informational (1xx).  This method is chainable.
 * @param {function} handler
 */
Result.prototype.information = function(handler) {
    return this.statusRange(100, 199, handler);
};

/**
 * Add a success status filtered handler.  The handler will only receive
 * responses which are successful (2xx).  This method is chainable.
 * @param {function} handler
 */
Result.prototype.success = function(handler) {
    return this.statusRange(200, 299, handler);
};

/**
 * Add a redirect status filtered handler.  The handler will only receive
 * responses which are redirections (3xx).  This method is chainable.
 * @param {function} handler
 */
Result.prototype.redirect = function(handler) {
    return this.statusRange(300, 399, handler);
};

/**
 * Add a client error status filtered handler.  The handler will only receive
 * responses which are client errors (4xx).  This method is chainable.
 * @param {function} handler
 */
Result.prototype.clientError = function(handler) {
    return this.statusRange(400, 499, handler);
};

/**
 * Add a server error status filtered handler.  The handler will only receive
 * responses which are server errors (5xx).  This method is chainable.
 * @param {function} handler
 */
Result.prototype.serverError = function(handler) {
    return this.statusRange(500, 599, handler);
};

/**
 * Add an error status filtered handler.  The handler will only receive
 * responses which are errors (4xx/5xx).  This method is chainable.
 * @param {function} handler
 */
Result.prototype.error = function(handler) {
    return this.statusRange(400, 599, handler);
};

/** export the Result class */
module.exports = Result;
