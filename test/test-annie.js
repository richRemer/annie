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
                entity = JSON.stringify({foo: 42}),
                req = ua.createRequest("PUT", entity, "http://example.com");
            
            expect(req).to.be.an(HttpRequest);
            expect(req.userAgent).to.be(ua);
            expect(req.host).to.be("example.com");
            expect(JSON.parse(req.data).foo).to.be(42);
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

    describe(".getAllHeaders", function() {
        it("should merge headers from user-agent with session", function() {
            var session = annie.createSession({foo: "bar"}),
                headers = session.getAllHeaders(),
                ua = session.userAgent;
            
            expect(ua.getHeader("user-agent")).to.be.ok();
            expect(session.getHeader("foo")).to.be.ok();
            expect(session.getHeader("user-agent")).to.not.be.ok();
            expect(headers["user-agent"]).to.be(ua.getHeader("user-agent"));
        });
    });

    describe(".createRequest", function() {
        it("should return an HttpRequest", function() {
            var ua = annie.createUserAgent(),
                session = ua.createSession(),
                entity = JSON.stringify({foo: 42}),
                uri = "http://example.com",
                req = session.createRequest("PUT", entity, uri);
                
            expect(req).to.be.an(HttpRequest);
            expect(req.session).to.be(session);
            expect(req.userAgent).to.be(ua);
            expect(req.host).to.be("example.com");
            expect(JSON.parse(req.data).foo).to.be(42);
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
        
        describe("(string)", function() {
            it("should set the request URI", function() {
                var req = HttpRequest.create("http://example.com/foo?bar");
                expect(req.uri).to.be("http://example.com/foo?bar");
            });
        });
        
        describe("(string, string)", function() {
            it("should set the request method and URL", function() {
                var req = HttpRequest.create("POST", "http://example.com/foo");
                expect(req.method).to.be("POST");
                expect(req.host).to.be("example.com");
            });
        });
        
        describe("(string, string, string)", function() {
            it("should set the request method, body, and URL", function() {
                var method = "POST",
                    data = "Blargh!",
                    url = "http://example.com/foo",
                    req = HttpRequest.create(method, data, url);

                expect(req.method).to.be(method);
                expect(req.data).to.be(data);
                expect(req.host).to.be("example.com");
            });
        });
        
        describe("(string, object)", function() {
            it("should set request headers", function() {
                var headers = {"Content-Type": "text/xml"},
                    url = "http://example.com/foo",
                    req = HttpRequest.create(url, headers);
                
                expect(req.getHeader("Content-Type")).to.be("text/xml");
                expect(req.host).to.be("example.com");
            });
        });
    });

    describe(".getHeader", function() {
        it("should return header value as string", function() {
            var req = annie.createRequest();
            req.addHeader("foo", "bar");
            req.addHeader("bar", "foo");
            req.addHeader("bar", "baz");
            expect(req.getHeader("foo")).to.be("bar");
            expect(req.getHeader("bar")).to.be("foo,baz");
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

    describe(".getAllHeaders", function() {
        it("should merge UA/session headers", function() {
            var session = annie.createSession({foo: "bar"}),
                req = session.createRequest({bar: "baz"}),
                headers = req.getAllHeaders(),
                ua = session.userAgent;
            
            expect(ua.getHeader("user-agent")).to.be.ok();
            expect(session.getHeader("user-agent")).to.not.be.ok();
            expect(session.getHeader("foo")).to.be("bar");
            expect(req.getHeader("user-agent")).to.not.be.ok();
            expect(req.getHeader("foo")).to.not.be.ok();
            expect(req.getHeader("bar")).to.be("baz");
            expect(headers["user-agent"]).to.be(ua.getHeader("user-agent"));
            expect(headers["foo"]).to.be(session.getHeader("foo"));
            expect(headers["bar"]).to.be(req.getHeader("bar"));
        });
    });
    
    describe(".uri", function() {
        it("should be composed of component props", function() {
            var req = annie.createRequest();

            req.uri = "http://host/path?query";
            expect(req.host).to.be("host");
            expect(req.path).to.be("/path");
            expect(req.query).to.be("query");
            
            req.host = "foo.com";
            req.path = "/foo";
            req.query = "foo";
            expect(req.uri).to.be("http://foo.com/foo?foo");
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
        
        describe("(number)", function() {
            it("should set the version if less than 100", function() {
                var res = HttpResponse.create(1.1);
                expect(res.version).to.be("1.1");
            });
            
            it("should set the status if above 100", function() {
                var res = HttpResponse.create(404);
                expect(res.status).to.be(404);
            });
        });
        
        describe("(number, number)", function() {
            it("should set the version and status", function() {
                var res = HttpResponse.create(1.1, 409);
                expect(res.version).to.be("1.1");
                expect(res.status).to.be(409);
            });
        });
        
        describe("{object}", function() {
            it("should set headers", function() {
                var res = HttpResponse.create({Etag: "foo"});
                expect(res.getHeader("Etag")).to.be("foo");
            });
        });
        
        describe("(string)", function() {
            it("should set response data", function() {
                var res = HttpResponse.create("foo");
                expect(res.data).to.be("foo");
            });
        });
    });

    describe(".statusLine", function() {
        it("should derive from status and version", function() {
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
