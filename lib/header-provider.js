var prop = require("propertize"),
    copy = require("objektify").copy;

/**
 * @param {object} [headers]
 * @constructor
 */
function HeaderProvider(headers) {
    headers = headers || {};
    var headerProvider = this,
        val;
    
    prop.readonly(this, "headers", {});    

    for (var header in headers) {
        val = headers[header];
        if (val instanceof Array) {
            val.forEach(function(val) {
                headerProvider.addHeader(header, val);
            });
        } else headerProvider.setHeader(header, val);
    }
}

/**
 * HTTP headers.
 * @property {string} object
 */
HeaderProvider.prototype.headers = {};

/**
 * Set an HTTP header.  If the header is already set, it will be overwritten.
 * @param {string} name
 * @param {string} value
 */
HeaderProvider.prototype.setHeader = function(name, value) {
    this.headers[name] = value;
};

/**
 * Set multiple HTTP headers.  If any of the headers are already set, they will
 * be overwritten.
 * @param {object} headers
 */
HeaderProvider.prototype.setHeaders = function(headers) {
    copy(this.headers, headers);
};

/**
 * Add an HTTP header.  If a header has already been added, another header will
 * be added to it.
 * @param {string} name
 * @param {string} value
 */
HeaderProvider.prototype.addHeader = function(name, value) {
    if (this.headers[name] instanceof Array) this.headers[name].push(value);
    else this.headers[name] = [value];
};

/**
 * Return the HTTP header value.
 * @returns {string}
 */
HeaderProvider.prototype.getHeader = function(name) {
    if (!this.headers[name] || this.headers[name].length === 0) return null;

    return typeof this.headers[name] === "string"
        ? this.headers[name]
        : this.headers[name].join(",");
};

/**
 * Return the HTTP headers.
 * @returns {object}
 */
HeaderProvider.prototype.getHeaders = function() {
    return copy({}, this.headers);
};

/**
 * Return the HTTP headers as a string.
 */
HeaderProvider.prototype.getHeaderString = function() {
    var headers = "",
        header;
    
    for (var name in this.headers) {
        // get array-normalized value
        header = this.headers[name] instanceof Array
            ? this.headers[name]
            : [this.headers[name]];
        
        // add each value
        header.forEach(function(value) {
            headers += name + ": " + value + "\r\n";
        });
    }
    
    return headers;
};

/**
 * Add HTTP headers from a header string.
 * @param {string} headers
 */
HeaderProvider.prototype.addHeaderString = function(headers) {
    var lines = headers.split("\r\n"),
        i, index;
    
    for (i = 0; i < lines.length; i++) {
        index = lines[i].indexOf(":");
        this.addHeader(
            lines[i].substr(0,index).trim(),
            lines[i].substr(index+1).trim()
        );
    }
};

/** export HeaderProvider class */
module.exports = HeaderProvider;
