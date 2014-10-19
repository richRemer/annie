var http = require("http"),
    annie = require(".."),
    UserAgent = require("../lib/user-agent"),
    Session = require("../lib/session"),
    Request = require("../lib/request"),
    Response = require("../lib/response"),
    Result = require("../lib/result"),
    Promise = require("es6-promise").Promise,
    expect = require("expect.js"),
    sinon = require("sinon");
    
describe("annie", function() {
    it("should export UserAgent.create as createUserAgent", function() {
        expect(annie.createUserAgent).to.be(UserAgent.create);
    });
    
    it("should export Session.create as createSession", function() {
        expect(annie.createSession).to.be(Session.create);
    });
    
    it("should export Request.create as createRequest", function() {
        expect(annie.createRequest).to.be(Request.create);
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
        it("should return a Request", function() {
            var ua = annie.createUserAgent(),
                entity = JSON.stringify({foo: 42}),
                req = ua.createRequest("PUT", entity, "http://example.com");
            
            expect(req).to.be.an(Request);
            expect(req.userAgent).to.be(ua);
            expect(req.host).to.be("example.com");
            expect(JSON.parse(req.data).foo).to.be(42);
        });
        
        it("should copy UserAgent headers to Request", function() {
            var ua = annie.createUserAgent(),
                req;
                
            ua.setHeader("foo", "bar");
            ua.setHeader("bar", "baz");
            req = ua.createRequest({bar: "biff"});
            expect(req.getHeader("foo")).to.be("bar");
            expect(req.getHeader("bar")).to.be("biff");
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
        it("should return an Request", function() {
            var ua = annie.createUserAgent(),
                session = ua.createSession(),
                entity = JSON.stringify({foo: 42}),
                uri = "http://example.com",
                req = session.createRequest("PUT", entity, uri);
                
            expect(req).to.be.an(Request);
            expect(req.session).to.be(session);
            expect(req.userAgent).to.be(ua);
            expect(req.host).to.be("example.com");
            expect(JSON.parse(req.data).foo).to.be(42);
        });
        
        it("should copy Session headers to Request", function() {
            var sess = annie.createSession(),
                req;
                
            sess.setHeader("foo", "bar");
            sess.setHeader("bar", "baz");
            req = sess.createRequest({bar: "biff"});
            expect(req.getHeader("foo")).to.be("bar");
            expect(req.getHeader("bar")).to.be("biff");
        });
    });
});

describe("Request", function() {
    it("should accept a UserAgent param to constructor", function() {
        var ua = annie.createUserAgent(),
            req = new Request(ua);
        
        expect(req.userAgent).to.be(ua);
        expect(req.session).to.be.ok();
    });
    
    it("should accept a Session param to constructor", function() {
        var ua = annie.createUserAgent(),
            session = ua.createSession(),
            req = new Request(session);
        
        expect(req.userAgent).to.be(ua);
        expect(req.session).to.be(session);
    });
    
    describe(".create", function() {
        it("should return a new Request instance", function() {
            expect(Request.create()).to.be.an(Request);
        });
        
        describe("(string)", function() {
            it("should set the request URI", function() {
                var req = Request.create("http://example.com/foo?bar");
                expect(req.uri).to.be("http://example.com/foo?bar");
            });
        });
        
        describe("(string, string)", function() {
            it("should set the request method and URL", function() {
                var req = Request.create("POST", "http://example.com/foo");
                expect(req.method).to.be("POST");
                expect(req.host).to.be("example.com");
            });
        });
        
        describe("(string, string, string)", function() {
            it("should set the request method, body, and URL", function() {
                var method = "POST",
                    data = "Blargh!",
                    url = "http://example.com/foo",
                    req = Request.create(method, data, url);

                expect(req.method).to.be(method);
                expect(req.data).to.be(data);
                expect(req.host).to.be("example.com");
            });
        });
        
        describe("(string, object)", function() {
            it("should set request headers", function() {
                var headers = {"Content-Type": "text/xml"},
                    url = "http://example.com/foo",
                    req = Request.create(url, headers);
                
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
            req.port = 42;
            expect(req.uri).to.be("http://foo.com:42/foo?foo");
        });
    });
});

describe("Response", function() {
    it("should accept an Request to constructor", function() {
        var ua = annie.createUserAgent(),
            session = ua.createSession(),
            req = session.createRequest(),
            res = new Response(req);
        
        expect(res.userAgent).to.be(ua);
        expect(res.session).to.be(session);
        expect(res.request).to.be(req);
    });
    
    describe(".create", function() {
        it("should return a new Response instance", function() {
            expect(Response.create()).to.be.a(Response);
        });
        
        describe("(number)", function() {
            it("should set the version if less than 100", function() {
                var res = Response.create(1.1);
                expect(res.version).to.be("1.1");
            });
            
            it("should set the status if above 100", function() {
                var res = Response.create(404);
                expect(res.status).to.be(404);
            });
        });
        
        describe("(number, number)", function() {
            it("should set the version and status", function() {
                var res = Response.create(1.1, 409);
                expect(res.version).to.be("1.1");
                expect(res.status).to.be(409);
            });
        });
        
        describe("{object}", function() {
            it("should set headers", function() {
                var res = Response.create({Etag: "foo"});
                expect(res.getHeader("Etag")).to.be("foo");
            });
        });
        
        describe("(string)", function() {
            it("should set response data", function() {
                var res = Response.create("foo");
                expect(res.data).to.be("foo");
            });
        });
    });

    describe(".statusLine", function() {
        it("should derive from status and version", function() {
            var req = annie.createRequest(),
                res = new Response(req);
            
            res.version = "1.0";
            res.status = 404;
            expect(res.statusLine).to.be("HTTP/1.0 404 Not Found");
            res.status = 200;
            expect(res.statusLine).to.be("HTTP/1.0 200 OK");
        });
    });
});

describe("Result", function() {
    it("should extend from Promise", function() {
        var result = new Result(function(resolve, reject) {});
        expect(result).to.be.a(Promise);
    });
    
    describe(".addRule", function() {
        it("should handle filtered fulfilled Response", function(done) {
            // 200 OK response
            var response = Response.create(200);

            // create a result which will resolve to a 200 OK Response
            var result = new Result(function(resolve, reject) {
                    resolve(response);
                });
            
            // spy on filters to confirm they are called in correct order
            var filter404 = function(res) {return res.status === 404;},
                filter200 = function(res) {return res.status === 200;},
                spy404 = sinon.spy(filter404),
                spy200 = sinon.spy(filter200);
            
            // should get called after matching rule
            var fulfilled = function(res) {
                    expect(spy404.calledOnce).to.be(true);
                    expect(spy200.calledOnce).to.be(true);
                    expect(res).to.be(response);
                    done();
                };
            
            // add rules
            // 1. check against 404 filter (no match)
            // 2. skip 404 handler
            // 3. check against 200 filter (match)
            // 4. call 200 handler
            result
                .addRule(spy404, fulfilled)
                .addRule(spy200, fulfilled);
        });
        
        it("should fail if called after then/catch", function() {
            var result = new Result(function(resolve, reject) {
                    resolve(Response.create(200));
                }),
                fulfilled = sinon.spy();
            
            result.then(fulfilled);
            expect(result.addRule).withArgs(function(){}, function(){})
                .to.throwError();
        });
    });
});
