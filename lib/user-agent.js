var merge = require("objektify").merge,
    Session = require("./session"),
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
 * @param {object} [headers]
 * @returns {Session}
 */
UserAgent.prototype.createSession = function(headers) {
    return new Session(this, merge(headers || {}, this.getHeaders()));
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
        
    if (typeof args.slice(-1,1).shift() === "object")
        args.push(merge(args.pop(), this.getHeaders()));
    else args.push(this.getHeaders());

    args.unshift(this);
    return Request.create.apply(null, args);
};

/** export UserAgent class */
module.exports = UserAgent;
