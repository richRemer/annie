annie HTTP Client Library
=========================
The `annie` library provides objects for making HTTP requests.  It includes
several classes: `UserAgent`, `Session`, `HttpMessage`, `HttpRequest`, and
`HttpResponse`.

Quick Examples
--------------

The quickest way to understand `annie` is by checking out an example.  For this
example, imagine you must make a POST to a web service to get an authorization
token, passing credentials in the headers.  You must then use that token to
update an entity.  You decide to wrap this in a function called `updateEntity`.

```js
var annie = require("annie");
const AUTH_URL = "https://example.com/...",
      AUTH_IDENT = "ServiceUser",
      AUTH_SECRET = "P455wurd";

/**
 * Update an existing resource entity, changing a single key to a new value.
 * @param {string} entityUri    URI of the resource entity
 * @param {string} key          Entity key to update
 * @param {*} val               New value for the key
 * @param {function} done       Called with (err, entity)
 */
function updateEntity(entityUri, key, val, done) {
    var headers = {"X-Ident": AUTH_IDENT, "X-Secret": AUTH_SECRET};

    // POST credentials to authentication service and handle success (2xx)
    annie.post(AUTH_URL, headers, function(res) {
        headers = {"X-Token": res.getHeader("X-Token")};

        // GET existing resource entity and update the key/val
        annie.get(entityUri, headers, function(res) {
            var entity = JSON.parse(res.data);
            entity[key] = val;
            headers["If-Match"] = res.getHeader("ETag");
            
            // conditional PUT to update resource entity
            annie.put(entity, entityUri, headers, function(res) {
                done(null, entity);
            });
        });
    })
    
    // pass along any js/HTTP errors
    .fail(done);      // pass along any failures to the callback
}
```

UserAgent
---------
The `UserAgent` class provides settings which apply to all requests.  The
primary setting is the User-Agent header, but this also might include any extra
headers which should be sent with all requests, *et al*.

### Creating a `UserAgent`

```js
var annie = require("annie"),
    ua;

// create user agent - object style
ua = new annie.UserAgent();

// create user agent - function style
ua = annie.createUserAgent();
```

### Configure the user agent headers

```js
var ua = require("annie").createUserAgent();
ua.setHeader("User-Agent", "Annie/1.0");
ua.setHeader("Accept", "text/html;q=0.5, application/json");
```

Session
-------
The `Session` class maintains client state across multiple requests.  The
primary purpose is to handle cookies.

### Creating a `Session`

```js
var annie = require("annies"),
    ua, sess;

// create session - object style
ua = new annie.UserAgent(); 
sess = new annie.Session(ua);

// create session - function style
sess = annie.createSession();   // default UserAgent
```

HttpRequest
-----------
The `HttpRequest` class issues requests and produces `HttpResponse` objects.

### Creating an `HttpRequest`

```js
var annie = require("annie"),
    ua, sess, req;

// create request - object style
ua = new annie.UserAgent();
sess = new annie.Session(ua);
req = new annie.HttpRequest(sess);

// create requests - function style
req = annie.createRequest();    // default UserAgent with a new Session

// create request for an existing session
sess = annie.createSession();
req = sess.createRequest();
```

HttpResponse
------------
An `HttpResponse` object is created by calling the `send` method of a configured
`HttpRequest` object.

### Getting an `HttpResponse`

```js
var req = annie.createRequest();

req.host = "example.com";
req.uri = "/";
req.send(function(err, res) {
    if (err) throw err;
    console.log(res);
});
```
