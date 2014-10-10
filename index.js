var http = require("http"),
    UserAgent = require("./lib/user-agent"),
    Session = require("./lib/session"),
    HttpRequest = require("./lib/http-request"),
    HttpResponse = require("./lib/http-response");

/** module exports */
module.exports = {
    createUserAgent: UserAgent.create,
    createSession: Session.create,
    createRequest: HttpRequest.create,
    
    UserAgent: UserAgent,
    Session: Session,
    HttpRequest: HttpRequest,
    HttpResponse: HttpResponse,
    
    STATUS_CODES: http.STATUS_CODES
};
