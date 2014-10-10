var http = require("http"),
    UserAgent = require("./lib/user-agent"),
    Session = require("./lib/session"),
    HttpRequest = require("./lib/http-request"),
    HttpResponse = require("./lib/http-response");

/**
 * Create a new UserAgent object.
 * @returns {UserAgent}
 */
function createUserAgent() {
    return new UserAgent();
}

/**
 * Create a new Session object using a default UserAgent.
 * @returns {Session}
 */
function createSession() {
    return createUserAgent().createSession();
}

/**
 * Create a new HttpRequest object using a default UserAgent and a new Session.
 * @returns {HttpRequest}
 */
function createRequest() {
    return createUserAgent().createRequest();
}

/** module exports */
module.exports = {
    createUserAgent: createUserAgent,
    createSession: createSession,
    createRequest: createRequest,
    
    UserAgent: UserAgent,
    Session: Session,
    HttpRequest: HttpRequest,
    HttpResponse: HttpResponse,
    
    STATUS_CODES: http.STATUS_CODES
};
