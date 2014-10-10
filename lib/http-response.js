var http = require("http"),
    prop = require("propertize"),
    HttpMessage = require("./http-message");

/**
 * HTTP response object.
 * @param {HttpRequest} req
 * @param {object} opts
 * @constructor
 */
function HttpResponse(req, opts) {
    HttpMessage.call(this, req.session, opts);

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
 * Create and return an new HttpResponse instance.
 * @param {HttpRequest} [req]
 * @param {object} [opts]
 */
HttpResponse.create = function(req, opts) {
    var HttpRequest = require("./http-request");

    if (arguments.length === 1)
        if (!(req instanceof HttpRequest))
            opts = req, req = null;
    
    return new HttpResponse(req || HttpRequest.create(), opts || {});
};

/**
 * @extends {HttpMessage}
 */
HttpResponse.prototype = Object.create(HttpMessage.prototype);

/**
 * Response status.
 * @property {number}
 */
HttpResponse.prototype.status = 200;

/** export HttpResponse class */
module.exports = HttpResponse;
