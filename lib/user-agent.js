var Session = require("./session"),
    Request = require("./request"),
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
 * Create a new Request with a new Session with this UserAgent.
 * @param {string} [method]
 * @param {string} [data]
 * @param {string} [uri]
 * @param {object} [headers]
 * @returns {Request}
 */
UserAgent.prototype.createRequest = function(method, data, uri, headers) {
    var req = Object.create(Request.prototype),
        args = Array.prototype.slice.call(arguments);
        
    args.unshift(this);
    return Request.create.apply(null, args);
};

/** export UserAgent class */
module.exports = UserAgent;
