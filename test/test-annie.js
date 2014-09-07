var http = require("http"),
    annie = require(".."),
    UserAgent = require("../lib/user-agent"),
    Session = require("../lib/session"),
    HttpRequest = require("../lib/http-request"),
    HttpResponse = require("../lib/http-response"),
    expect = require("expect.js");
    
describe("annie", function() {
    describe(".createUserAgent", function() {
        it("should return a UserAgent", function() {
            var ua = annie.createUserAgent();
            expect(ua).to.be.a(UserAgent);
        });
    });
    
    describe(".createSession", function() {
        it("should return a Session", function() {
            var session = annie.createSession();
            expect(session).to.be.a(Session);
        });
    });
    
    describe(".createRequest", function() {
        it("should return an HttpRequest", function() {
            var req = annie.createRequest();
            expect(req).to.be.an(HttpRequest);
        });
    });

    describe(".UserAgent", function() {
        describe(".createSession", function() {
            it("should return a Session", function() {
                var ua = annie.createUserAgent(),
                    session = ua.createSession();
                
                expect(session).to.be.a(Session);
            });
        });

        describe(".createRequest", function() {
            it("should return an HttpRequest", function() {
                var ua = annie.createUserAgent(),
                    req = ua.createRequest();
                    
                expect(req).to.be.an(HttpRequest);
            });
        });        
    });

    describe(".Session", function() {
        it("should accept a UserAgent param to constructor", function() {
            var ua = annie.createUserAgent(),
                session = new Session(ua);
            
            expect(session.userAgent).to.be(ua);
        });
    
        describe(".createRequest", function() {
            it("should return an HttpRequest", function() {
                var ua = annie.createUserAgent(),
                    session = ua.createSession(),
                    req = session.createRequest();
                    
                expect(req).to.be.an(HttpRequest);
            });
        });
    });

    describe(".HttpRequest", function() {
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
    });

    describe(".HttpResponse", function() {
        it("should accept an HttpRequest to constructor", function() {
            var ua = annie.createUserAgent(),
                session = ua.createSession(),
                req = session.createRequest(),
                res = new HttpResponse(req);
            
            expect(res.userAgent).to.be(ua);
            expect(res.session).to.be(session);
            expect(res.request).to.be(req);
        });
    });
});
