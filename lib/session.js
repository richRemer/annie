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
 * @returns {HttpRequest}
 */
Session.prototype.createRequest = function() {
    return new HttpRequest(this);
};

/** export Session class */
module.exports = Session;
