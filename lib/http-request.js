var http = require("http"),
    url = require("url"),
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
    
    // normalize uri property
    prop.normalized(this, "uri", function(uri) {
        var parts = url.parse(uri, false, true);
        if (parts.protocol && parts.protocol !== "http:") return this.uri;
        if (parts.auth) return this.uri;
        
        return url.format(parts);
    });
    
    // map host to uri property
    prop.managed(this, "host", function(host) {
        var uri = url.parse(this.uri);
        uri.hostname = host;
        this.uri = url.format(uri);
    }, function() {
        return url.parse(this.uri).hostname;
    });
    
    // map port to uri property
    prop.managed(this, "port", function(port) {
        var uri = url.parse(this.uri);
        uri.port = port;
        this.uri = url.format(uri);
    }, function() {
        return url.parse(this.uri).port;
    });
    
    // map path to uri property
    prop.managed(this, "path", function(path) {
        var uri = url.parse(this.uri);
        uri.pathname = path;
        this.uri = url.format(uri);
    }, function() {
        return url.parse(this.uri).pathname;
    });
    
    // map query to uri property
    prop.managed(this, "query", function(query) {
        var uri = url.parse(this.uri);
        uri.query = query;
        this.uri = url.format(uri);
    }, function() {
        return url.parse(this.uri).query;
    });
    
    // set opts
    opts = opts || {};
    this.method = opts.method || "GET";
    this.uri = opts.uri || opts.url || "http://localhost/";
}

/**
 * Create and return a new HttpRequest instance.
 * @param {UserAgent|Session} [context]
 * @param {string} [method]
 * @param {string} [data]
 * @param {string} [uri]
 * @param {object} [headers]
 */
HttpRequest.create = function(context, method, data, uri, headers) {
    var UserAgent = require("./user-agent"),
        Session = require("./session"),
        args = Array.prototype.slice.call(arguments),
        sargs = [];

    // check for initial context argument
    if (args[0] instanceof UserAgent) context = args.shift();
    else if (args[0] instanceof Session) context = args.shift();
    else context = null;
    
    // check for string args
    while (typeof args[0] === "string") sargs.push(args.shift());
    
    // assign string args and defaults
    method = "GET", data = "", uri = "http://localhost/";
    switch (sargs.length) {
        case 3: data = sargs.splice(1, 1).shift();
        case 2: method = sargs.shift();
        case 1: uri = sargs.shift();
        case 0: break;
        default:    // more than 3
            throw new Error("unexpected string argument: " + sargs[3]);
    }

    // assign leftover headers arg    
    headers = args.shift() || {};
    
    // create opts object for setting up request
    var opts = {
        method: method,
        uri: uri,
        data: data
    };

    // create request and set headers before returning
    var req = new HttpRequest(context || UserAgent.create(), opts);
    for (var header in headers) req.addHeader(header, headers[header]);
    return req;
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
