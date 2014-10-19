var prop = require("propertize"),
    copy = require("objektify").copy,
    merge = require("objektify").merge,
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
        
    if (typeof args.slice(-1,1).shift() === "object")
        args.push(merge(args.pop(), this.getHeaders()));
    else args.push(this.getHeaders());
    
    args.unshift(this);
    return Request.create.apply(null, args);
};

/** export Session class */
module.exports = Session;
