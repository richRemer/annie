var Session = require("./session"),
    HttpRequest = require("./http-request");

/**
 * @constructor
 */
function UserAgent() {

}

/**
 * Create and return a new UserAgent instance.
 * @returns {UserAgent}
 */
UserAgent.create = function() {
    return new UserAgent();
};

/**
 * Create a new Session with this UserAgent.
 * @returns {Session}
 */
UserAgent.prototype.createSession = function() {
    return new Session(this);
};

/**
 * Create a new HttpRequest with a new Session with this UserAgent.
 * @returns {HttpRequest}
 */
UserAgent.prototype.createRequest = function() {
    return new HttpRequest(this);
};

/** export UserAgent class */
module.exports = UserAgent;
