var http = require("http"),
    https = require("https"),
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
        if (parts.protocol && ! /^https?:$/.test(parts.protocol))
            return this.uri;
        if (parts.auth) return this.uri;
        
        return url.format(parts);
    });
    
    // map protocol to uri property
    prop.managed(this, "protocol", function(prototol) {
        var uri;
        if (! /^https?:?$/.test(protocol)) return;
        uri = url.parse(this.uri);
        uri.prototol = protocol;
        this.uri = url.format(uri);
    }, function() {
        return url.parse(this.uri).protocol;
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
 * @param {string|stream.Readable} [data]
 * @param {string} [uri]
 * @param {object} [headers]
 */
Request.create = function(context, method, data, uri, headers) {
    var UserAgent = require("./user-agent"),
        Session = require("./session"),
        args = Array.prototype.slice.call(arguments),
        arg, i;

    // check for initial context argument
    if (args[0] instanceof UserAgent) context = args.shift();
    else if (args[0] instanceof Session) context = args.shift();
    else context = null;

    // check for final headers argument
    headers = {};
    if (typeof args[args.length-1] === "object")
        // skip Readable object
        if (typeof args[args.length-1].pipe !== "function")
            headers = args.pop();
    
    // check for stream arg
    data = null;
    for (i = 0; i < args.length; i++)
        if (typeof args[i] === "object" && typeof args[i].pipe === "function") {
            if (i > 1) throw new Error("unexpected argument: Readable");
            method = (i === 0) ? "GET" : args.shift();
            data = args.shift();
            uri = args.shift() || "http://localhost/";
            break;
        }

    // assign string args
    if (data === null) {
        method = (args.length > 1) ? args.shift() : "GET";
        data = (args.length > 1) ? args.shift() : "";
        uri = args.shift() || "http://localhost/";
    }
    
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
    var request = new Request(this.session, {
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
        
        req = (request.protocol === "https:" ? https : http).request({
            host: request.host,
            port: request.port,
            method: request.method,
            path: request.path,
            headers: request.getHeaders()
        }, function(res) {
            res.on("error", reject);
            res.on("data", function(chunk) {data += chunk;});
            res.on("end", function() {
                resolve(new Response(request, {
                    version: res.httpVersion,
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                }));
            });
        });
        
        req.on("error", reject);
        if (request.data.pipe) request.data.pipe(req);
        else req.write(request.data);
        req.end();
    });
};

/** export Request class */
module.exports = Request;
