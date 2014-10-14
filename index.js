var http = require("http"),
    UserAgent = require("./lib/user-agent"),
    Session = require("./lib/session"),
    Request = require("./lib/request"),
    Response = require("./lib/response");

/** module exports */
module.exports = {
    createUserAgent: UserAgent.create,
    createSession: Session.create,
    createRequest: Request.create,
    
    UserAgent: UserAgent,
    Session: Session,
    Request: Request,
    Response: Response,
    
    STATUS_CODES: http.STATUS_CODES
};
