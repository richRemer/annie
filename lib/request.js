var http = require("http"),
    url = require("url"),
    prop = require("propertize"),
    copy = require("objektify").copy,
    UserAgent = require("./user-agent"),
    Session = require("./session"),
    Message = require("./message"),
    Response = require("./response"),
    Result = require("./result");

/**
 * HTTP request object.
 * @param {UserAgent|Session} context
 * @param {object} opts
 * @constructor
 */
function Request(context, opts) {
    Message.call(this, context, opts);

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
        uri.host = null;
        uri.hostname = host;
        this.uri = url.format(uri);
    }, function() {
        return url.parse(this.uri).hostname;
    });
    
    // map port to uri property
    prop.managed(this, "port", function(port) {
        var uri = url.parse(this.uri);
        uri.host = null;
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
        uri.search = "?" + query;
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
 * Create and return a new Request instance.
 * @param {UserAgent|Session} [context]
 * @param {string} [method]
 * @param {string} [data]
 * @param {string} [uri]
 * @param {object} [headers]
 */
Request.create = function(context, method, data, uri, headers) {
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
        headers: headers,
        data: data
    };

    // create request
    return new Request(context || UserAgent.create(), opts);
};

/**
 * @extends {Message}
 */
Request.prototype = Object.create(Message.prototype);

/**
 * HTTP request method.
 * @property {string}
 */
Request.prototype.method = "GET";

/**
 * HTTP host name or IP address.
 * @property {string}
 */
Request.prototype.host = "localhost";

/**
 * Port on which to connect.
 * @property {number}
 */
Request.prototype.port = 80;

/**
 * URI path for request.
 * @property {string}
 */
Request.prototype.path = "/";

/**
 * HTTP body data.
 * @property {string}
 */
Request.prototype.data = "";

/**
 * Send the request and return a Result object which will resolve to a Response
 * or Error once the request has completed.
 * @returns {Result}
 */
Request.prototype.send = function() {
    // create a copy of this request for the result
    var request = new Request(this.context, {
        version: this.version,
        method: this.method,
        uri: this.uri,
        headers: this.getHeaders(),
        data: this.data
    });
    
    // set a Date header if one is not already set, then freeze the request
    if (!request.getHeader("date")) request.setHeader("date", new Date());
    Object.freeze(request);

    // get request result and return it
    return new Result(function(resolve, reject) {
        var req,
            data = "";
        
        req = http.request({
            host: request.host,
            port: request.port,
            method: request.method,
            path: request.path,
            headers: request.getHeaders()
        }, function(res) {
            res.on("error", done);
            res.on("data", function(chunk) {data += chunk;});
            res.on("end", function() {
                done(null, new Response(request, {
                    version: res.httpVersion,
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                }));
            });
        });
        
        req.on("error", reject);
        req.write(request.data)
        req.end();
    });
};

/** export Request class */
module.exports = Request;
