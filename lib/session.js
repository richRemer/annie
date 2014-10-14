var prop = require("propertize"),
    HttpRequest = require("./http-request");

/**
 * @param {UserAgent} ua
 * @constructor
 */
function Session(ua) {
    prop.readonly(this, "userAgent", ua);
}

/**
 * Create and return a new Session instance.
 * @param {UserAgent} [ua]
 * @returns {Session}
 */
Session.create = function(ua) {
    return new Session(ua || new require("./user-agent")());
}

/**
 * Create a new HttpRequest with this Session.
 * @param {string} [method]
 * @param {string} [data]
 * @param {string} [uri]
 * @param {object} [headers]
 * @returns {HttpRequest}
 */
Session.prototype.createRequest = function(method, data, uri, headers) {
    var req = Object.create(HttpRequest.prototype),
        args = Array.prototype.slice.call(arguments);
        
    args.unshift(this);
    return HttpRequest.create.apply(null, args);
};

/** export Session class */
module.exports = Session;
