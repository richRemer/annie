var http = require("http"),
    prop = require("propertize"),
    Message = require("./message");

/**
 * HTTP response object.
 * @param {HttpRequest} req
 * @param {object} opts
 * @constructor
 */
function HttpResponse(req, opts) {
    Message.call(this, req.session, opts);

    prop.readonly(this, "request", req);

    prop.derived(this, "statusLine", function() {
        return "HTTP/" + this.version + " " + this.status + " " +
            http.STATUS_CODES[this.status];
    });
    
    // set options
    opts = opts || {};
    if (opts.status) this.status = opts.status;
}

/**
 * Create and return a new HttpResponse instance.
 * @param {HttpRequest} [req]
 * @param {number} [version]
 * @param {number} [status]
 * @param {object} [headers]
 * @param {string} [data]
 */
HttpResponse.create = function(req, version, status, headers, data) {
    var HttpRequest = require("./http-request"),
        args = Array.prototype.slice.call(arguments),
        opts = {};

    req = args[0] instanceof HttpRequest ? args.shift() : HttpRequest.create();
    opts.version = typeof args[0] === "number" && args[0]<100
        ? args.shift().toFixed(1)
        : "1.1";
    opts.status = typeof args[0] === "number" ? args.shift() : 200;
    opts.headers = typeof args[0] === "object" ? args.shift() : {};
    opts.data = typeof args[0] === "string" ? args.shift() : "";
    
    return new HttpResponse(req, opts);
};

/**
 * @extends {Message}
 */
HttpResponse.prototype = Object.create(Message.prototype);

/**
 * Response status.
 * @property {number}
 */
HttpResponse.prototype.status = 200;

/** export HttpResponse class */
module.exports = HttpResponse;
