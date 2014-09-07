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
 * Create a new HttpRequest with this Session.
 * @returns {HttpRequest}
 */
Session.prototype.createRequest = function() {
    return new HttpRequest(this);
};

/** export Session class */
module.exports = Session;
