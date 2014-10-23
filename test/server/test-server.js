var http = require("http");

/**
 * Generate a random integer in a specified range.
 * @param {number} min
 * @param {number} max
 */
function randint(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Test server.
 */
function TestServer() {
    this.statusCode = 200;
    this.httpServer = null;
}

/**
 * Create a test server.
 * @returns {TestServer}
 */
TestServer.create = function() {
    return new TestServer();
}

/**
 * Begin listening.  If no port is provided, a random one will be selected.
 * @param {number} [port]
 */
TestServer.prototype.listen = function(port) {
    var server = this;

    port = port || randint(1024, 65535);    // unprivileged min / TCP max
    this.httpServer = http.createServer(function(req, res) {
        var contentType;

        res.setHeader("x-method", req.method);
        res.setHeader("x-url", req.url);

        for (var head in req.headers) {
            res.setHeader("x-echo-" + head, req.headers[head]);
            if (head.toLowerCase() === "content-type") contentType = req.headers[head];
        }

        if (contentType) res.setHeader("content-type", contentType);

        res.writeHead(server.statusCode);
        res.end("foo");
        //req.pipe(res);
    }).listen(port);
};

/** export the TestServer.create function as createServer */
module.exports = {
    createServer: TestServer.create
}
