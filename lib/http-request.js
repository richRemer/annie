var http = require("http"),
    prop = require("propertize"),
    UserAgent = require("./user-agent"),
    Session = require("./session"),
    HttpMessage = require("./http-message"),
    HttpResponse = require("./http-response");

/**
 * HTTP request object.
 * @param {UserAgent|Session} context
 * @param {object} opts
 * @constructor
 */
function HttpRequest(context, opts) {
    HttpMessage.call(this, context, opts);

    // accept anything that looks like an HTTP method; supports HTTP extensions
    // like MERGE
    prop.validated(this, "method", function(val) {
        return !!(val.match(/^[a-z]+$/i));
    });
    
    // set opts
    opts = opts || {};
    if (opts.method) this.method = opts.method;
    if (opts.host) this.host = opts.host;
    if (opts.port) this.port = opts.port;
    if (opts.data) this.data = opts.data;
}

/**
 * Create and return a new HttpRequest instance.
 * @param {UserAgent|Session} [context]
 * @param {object} [opts]
 */
HttpRequest.create = function(context, opts) {
    var UserAgent = require("./user-agent"),
        Session = require("./session");

    if (arguments.length === 1)
        if (!(context instanceof UserAgent)
            && !(context instanceof Session))
            opts = context, context = null;

    return new HttpRequest(context || UserAgent.create(), opts || {});
};

/**
 * @extends {HttpMessage}
 */
HttpRequest.prototype = Object.create(HttpMessage.prototype);

/**
 * HTTP request method.
 * @property {string}
 */
HttpRequest.prototype.method = "GET";

/**
 * HTTP host name or IP address.
 * @property {string}
 */
HttpRequest.prototype.host = "localhost";

/**
 * Port on which to connect.
 * @property {number}
 */
HttpRequest.prototype.port = 80;

/**
 * URI path for request.
 * @property {string}
 */
HttpRequest.prototype.path = "/";

/**
 * HTTP body data.
 * @property {string}
 */
HttpRequest.prototype.data = "";

/**
 * Send the request and pass a response to the callback.
 * @param {function} done
 */
HttpRequest.prototype.send = function(done) {
    var httpRequest = this,
        data = "",
        req;

    req = http.request({
        host: this.host,
        port: this.port,
        method: this.method,
        path: this.path,
        headers: this.getHeaders()
    }, function(res) {
        res.on("error", done);
        res.on("data", function(chunk) {data += chunk;});
        res.on("end", function() {
            done(null, new HttpResponse(httpRequest, {
                version: res.httpVersion,
                status: res.statusCode,
                headers: res.headers,
                data: data
            }));
        });
    });
    
    req.on("error", done);
    req.write(this.data)
    req.end();
};

/** export HttpRequest class */
module.exports = HttpRequest;
