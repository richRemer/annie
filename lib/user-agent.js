var Session = require("./session"),
    HttpRequest = require("./http-request"),
    HeaderProvider = require("./header-provider");

/**
 * @param {object} [headers]
 * @constructor
 */
function UserAgent(headers) {
    headers = headers || {};
    HeaderProvider.call(this, headers);

    if (!this.getHeader("user-agent"))
        this.setHeader("user-agent", "Annie " + require("../package").version);
}

/**
 * Create and return a new UserAgent instance.
 * @returns {UserAgent}
 */
UserAgent.create = function() {
    return new UserAgent();
};

/**
 * @extends {HeaderProvider}
 */
UserAgent.prototype = Object.create(HeaderProvider.prototype);

/**
 * Create a new Session with this UserAgent.
 * @returns {Session}
 */
UserAgent.prototype.createSession = function() {
    return new Session(this);
};

/**
 * Create a new HttpRequest with a new Session with this UserAgent.
 * @param {string} [method]
 * @param {string} [data]
 * @param {string} [uri]
 * @param {object} [headers]
 * @returns {HttpRequest}
 */
UserAgent.prototype.createRequest = function(method, data, uri, headers) {
    var req = Object.create(HttpRequest.prototype),
        args = Array.prototype.slice.call(arguments);
        
    args.unshift(this);
    return HttpRequest.create.apply(null, args);
};

/** export UserAgent class */
module.exports = UserAgent;
