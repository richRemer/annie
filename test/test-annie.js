var http = require("http"),
    annie = require(".."),
    UserAgent = require("../lib/user-agent"),
    Session = require("../lib/session"),
    HttpRequest = require("../lib/http-request"),
    HttpResponse = require("../lib/http-response"),
    expect = require("expect.js");
    
describe("annie", function() {
    it("should export UserAgent.create as createUserAgent", function() {
        expect(annie.createUserAgent).to.be(UserAgent.create);
    });
    
    it("should export Session.create as createSession", function() {
        expect(annie.createSession).to.be(Session.create);
    });
    
    it("should export HttpRequest.create as createRequest", function() {
        expect(annie.createRequest).to.be(HttpRequest.create);
    });
});


describe("UserAgent", function() {
    describe(".create", function() {
        it("should return a new UserAgent instance", function() {
            expect(UserAgent.create()).to.be.a(UserAgent);
        });
    });

    describe(".createSession", function() {
        it("should return a Session", function() {
            var ua = annie.createUserAgent(),
                session = ua.createSession();
            
            expect(session).to.be.a(Session);
            expect(session.userAgent).to.be(ua);
        });
    });

    describe(".createRequest", function() {
        it("should return an HttpRequest", function() {
            var ua = annie.createUserAgent(),
                req = ua.createRequest();
                
            expect(req).to.be.an(HttpRequest);
            expect(req.userAgent).to.be(ua);
        });
    });        
});

describe("Session", function() {
    it("should accept a UserAgent param to constructor", function() {
        var ua = annie.createUserAgent(),
            session = new Session(ua);
        
        expect(session.userAgent).to.be(ua);
    });
    
    describe(".create", function() {
        it("should return a new Session instance", function() {
            expect(Session.create()).to.be.a(Session);
        });
    });

    describe(".createRequest", function() {
        it("should return an HttpRequest", function() {
            var ua = annie.createUserAgent(),
                session = ua.createSession(),
                req = session.createRequest();
                
            expect(req).to.be.an(HttpRequest);
            expect(req.session).to.be(session);
            expect(req.userAgent).to.be(ua);
        });
    });
});

describe("HttpRequest", function() {
    it("should accept a UserAgent param to constructor", function() {
        var ua = annie.createUserAgent(),
            req = new HttpRequest(ua);
        
        expect(req.userAgent).to.be(ua);
        expect(req.session).to.be.ok();
    });
    
    it("should accept a Session param to constructor", function() {
        var ua = annie.createUserAgent(),
            session = ua.createSession(),
            req = new HttpRequest(session);
        
        expect(req.userAgent).to.be(ua);
        expect(req.session).to.be(session);
    });
    
    describe(".create", function() {
        it("should return a new HttpRequest instance", function() {
            expect(HttpRequest.create()).to.be.an(HttpRequest);
        });
    });

    describe(".getHeaderString", function() {
        it("should return headers in HTTP format", function() {
            var req = annie.createRequest(),
                headers;
                
            req.addHeader("foo", "you");
            req.addHeader("bar", "baz");
            headers = req.getHeaderString();
            
            expect(headers).to.contain("foo: you");
            expect(headers).to.contain("bar: baz");
            expect(headers).to.contain("\r\n");
        });
    });
});

describe("HttpResponse", function() {
    it("should accept an HttpRequest to constructor", function() {
        var ua = annie.createUserAgent(),
            session = ua.createSession(),
            req = session.createRequest(),
            res = new HttpResponse(req);
        
        expect(res.userAgent).to.be(ua);
        expect(res.session).to.be(session);
        expect(res.request).to.be(req);
    });
    
    describe(".create", function() {
        it("should return a new HttpResponse instance", function() {
            expect(HttpResponse.create()).to.be.an(HttpResponse);
        });
    });

    describe(".statusLine", function() {
        it("should derive from response status", function() {
            var req = annie.createRequest(),
                res = new HttpResponse(req);
            
            res.version = "1.0";
            res.status = 404;
            expect(res.statusLine).to.be("HTTP/1.0 404 Not Found");
            res.status = 200;
            expect(res.statusLine).to.be("HTTP/1.0 200 OK");
        });
    });
});
