var http = require("http"),
    prop = require("propertize"),
    UserAgent = require("./user-agent"),
    Session = require("./session"),
    HttpMessage = require("./http-message");

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
        return (val.match(/[a-z]+/i))
            ? val.toUpperCase()
            : this.method;
    });
    
    // set opts
    opts = opts || {};
    if (opts.method) this.method = opts.method;
    if (opts.host) this.host = opts.host;
    if (opts.port) this.port = opts.port;
    if (opts.data) this.data = opts.data;
}

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
 * URI for request.
 * @property {string}
 */
HttpRequest.prototype.uri = "/";

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
    var req = this,
        data = "";

    http.request({
        host: this.host,
        port: this.port,
        method: this.method,
        path: this.uri,
        headers: this.getHeaders()
    }, function(err, res) {
        if (err) done(err);
        else {
            res.on("data", function(chunk) {data += chunk;});
            res.on("end", function() {
                done(null, new HttpResponse(req, {
                    version: res.httpVersion,
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                }));
            });
        }
    });
};

/** export HttpRequest class */
module.exports = HttpRequest;