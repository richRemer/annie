var Readable = require("stream").Readable,
    prop = require("propertize");

/**
 * Base class for HttpRequest and HttpResponse.
 * @param {UserAgent|Session} context
 * @param {object} opts
 * @constructor
 */
function HttpMessage(context, opts) {
    var UserAgent = require("./user-agent"),
        Session = require("./session"),
        i;

    // if the context is a UA, create a new session
    if (context instanceof UserAgent) {
        prop.readonly(this, "userAgent", context);
        prop.readonly(this, "session", this.userAgent.createSession());
    }
    
    // if the context is a Session, use the UA from the session
    else if (context instanceof Session) {
        prop.readonly(this, "session", context);
        prop.readonly(this, "userAgent", this.session.userAgent);
    }
    
    // can't create a message
    else throw new Error("invalid argument; expected UserAgent or Session");
    
    // ensure version is set only to recognized values
    prop.validated(this, "version", function(val) {
        return ["1.0", "1.1"].indexOf(val) >= 0;
    });
    
    // ensure data is set to string
    prop.validated(this, "data", function(val) {
        return typeof val === "string";
    });
    
    prop.readonly(this, "headers", {});

    // set options
    opts = opts || {};
    if (opts.version) this.version = opts.version;
    if (opts.headers) for (i in opts.headers) this.headers[i] = opts.headers[i];
    if (opts.data) this.data = opts.data;
}

/**
 * HTTP protocol version.
 * @property {string}
 */
HttpMessage.prototype.version = "1.0";

/**
 * HTTP headers.
 * @property {string} object
 */
HttpMessage.prototype.headers = {};

/**
 * Set an HTTP header.  If the header is already set, it will be overwritten.
 * @param {string} name
 * @param {string} value
 */
HttpMessage.prototype.setHeader = function(name, value) {
    this.headers[name] = value;
};

/**
 * Set multiple HTTP headers.  If any of the headers are already set, they will
 * be overwritten.
 * @param {object} headers
 */
HttpMessage.prototype.setHeaders = function(headers) {
    for (var name in headers) this.headers[name] = headers[name];
};

/**
 * Add an HTTP header.  If a header has already been added, another header will
 * be added to it.
 * @param {string} name
 * @param {string} value
 */
HttpMessage.prototype.addHeader = function(name, value) {
    if (this.headers[name] instanceof Array) this.headers[name].push(value);
    else this.headers[name] = [value];
};

/**
 * Return the HTTP headers.
 * @returns {object}
 */
HttpMessage.prototype.getHeaders = function() {
    var headers = {};
    for (var name in this.headers) headers[name] = this.headers[name];
    return headers;
};

/** export HttpMessage class */
module.exports = HttpMessage;
