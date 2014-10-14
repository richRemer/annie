var Readable = require("stream").Readable,
    prop = require("propertize"),
    HeaderProvider = require("./header-provider");

/**
 * Base class for HttpRequest and HttpResponse.
 * @param {UserAgent|Session} context
 * @param {object} opts
 * @constructor
 */
function Message(context, opts) {
    opts = opts || {};

    var UserAgent = require("./user-agent"),
        Session = require("./session"),
        i;

    HeaderProvider.call(this, opts.headers);

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
    
    // set options
    opts = opts || {};
    if (opts.version) this.version = opts.version;
    if (opts.data) this.data = opts.data;
}

/**
 * @extends {HeaderProvider}
 */
Message.prototype = Object.create(HeaderProvider.prototype);

/**
 * HTTP protocol version.
 * @property {string}
 */
Message.prototype.version = "1.0";

/** export Message class */
module.exports = Message;
