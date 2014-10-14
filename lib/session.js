var prop = require("propertize"),
    copy = require("objektify").copy,
    Request = require("./request"),
    HeaderProvider = require("./header-provider");

/**
 * @param {UserAgent} ua
 * @param {object} [headers]
 * @constructor
 */
function Session(ua, headers) {
    headers = headers || {};
    HeaderProvider.call(this, headers);
    prop.readonly(this, "userAgent", ua);
}

/**
 * Create and return a new Session instance.
 * @param {UserAgent} [ua]
 * @param {object} [headers]
 * @returns {Session}
 */
Session.create = function(ua, headers) {
    var UserAgent = require("./user-agent");
    
    if (arguments.length === 1 && !(ua instanceof UserAgent))
        headers = ua, ua = new UserAgent();

    return new Session(ua, headers);
}

/**
 * @extends {HeaderProvider}
 */
Session.prototype = Object.create(HeaderProvider.prototype);

/**
 * Return all session headers, including headers from the user agent.
 */
Session.prototype.getAllHeaders = function() {
    var headers = copy({}, this.getHeaders()),
        uaHeaders = this.userAgent.getHeaders();
    
    for (var header in uaHeaders) {
        if (!headers[header]) headers[header] = uaHeaders[header];
        else if (headers[header] instanceof Array
            && uaHeaders[header] instanceof Array)
            headers[header] = headers[header].concat(uaHeaders[header]);
    }
    
    return headers;
};

/**
 * Create a new Request with this Session.
 * @param {string} [method]
 * @param {string} [data]
 * @param {string} [uri]
 * @param {object} [headers]
 * @returns {Request}
 */
Session.prototype.createRequest = function(method, data, uri, headers) {
    var req = Object.create(Request.prototype),
        args = Array.prototype.slice.call(arguments);
        
    args.unshift(this);
    return Request.create.apply(null, args);
};

/** export Session class */
module.exports = Session;
