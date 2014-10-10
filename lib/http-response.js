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
