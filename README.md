annie HTTP Client Library
=========================
The `annie` library provides objects for making HTTP requests.  It includes
several classes: `UserAgent`, `Session`, `Message`, `Request`, and `Response`.

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
    .failure(done);
}
```

The above example uses `post`, `get`, and `put` from the `annie` module.  There
is a corresponding `annie` function for each standard HTTP method.  Each of
these functions takes an optional callback which will receive a successful
response (2xx status).  If the response is not a success, the `Response`
object will be thrown.  In turn, any thrown value (whether they be `Error` or
`Response` objects or something else) will be handed off the `failure`
callback.

### Handling non-successful response

Now imagine you want to extend the previous function to create a new resource
if one does not exist already.  The following example does just that.

```js
// ... snip ... (q.v., previous example)

        // GET existing resource entity and update the key/val
        annie.get(entityUri, headers, function(res) {
            var entity = JSON.parse(res.data);
            entity[key] = val;
            headers["If-Match"] = res.getHeader("ETag");
            
            // conditional PUT to update resource entity
            annie.put(entity, entityUri, headers, function(res) {
                done(null, entity);
            });
        })
        
        // catch 404 Not Found and create new resource
        .status(404, function(res) {
            var entity = {};
            entity[key] = val;
            headers["If-None-Match"] = "*";

            // conditional PUT to update resource entity
            annie.put(entity, entityUri, headers, function(res) {
                done(null, entity);
            });
        });

// ... snip ... (q.v., previous example)
```

In this example, the `status` function is called on the `Result` returned from
`get`.  This function adds a response handler for `404 Not Found` responses.

### Handle an arbitrary response

There's some unnecessary duplication in the previous example.  The callbacks
for both the `get` function and the `status` function are almost identical.  In
order to avoid this, you decide to put them both in the same function.

```js
// ... snip ... (q.v., previous example)

        // GET existing resource if available and update/create new key/val
        annie.get(entityUri, headers, function(err, res) {
            var entity = {};

            if (err) throw err;
            
            if (res.isSuccess()) {
                entity = JSON.parse(res.data);
                headers["If-Match"] = res.getHeader("ETag");
            } else if (res.status === 404) {
                headers["If-None-Match"] = "*";
            } else throw res;

            // conditional PUT to update resource entity
            entity[key] = val;
            annie.put(entity, entityUri, headers, function(res) {
                done(null, entity);
            });            
        });

// ... snip ... (q.v., previous example)
```

In this example, because the `get` callback has two arguments, it will be
passed any `Error` or the result `Response`.  Notice where the `Response` is
thrown.  This lets `annie` know that this handler will not handle the response
and it should be passed along to the final `failure` handler, which in turn
passes the `Response` to the `done` callback as the first argument, indicating
an error.

### Chaining operations

After looking at the DRY'd result, you decide it's a bit ugly.  You think you
can refactor it to make the flow a bit more clear.  You give it a go with the
following example.

```js
// ... snip ... (q.v., previous example)

        // GET existing resource if available and update/create new key/val
        annie.get(entityUri, headers)

        // setup headers and pass existing entity to next step
        .success(function(res) {
            headers["If-Match"] = res.getHeader("ETag");
            return JSON.parse(res.data);
        });

        // setup headers for new resource and create new entity
        .status(404, function(res) {
            headers["If-None-Match"] = "*";
            return {};
        });

        // now PUT the updated/created entity
        .then(function(entity) {
            entity[key] = val;
            annie.put(entity, entityUri, headers, function(res) {
                done(null, entity);
            });
        });

// ... snip ... (q.v., previous example)
```

With the `success` method, we handle 2xx responses as in the initial example.
There is no difference between passing the success callback to the `get` method
or to the `success` method of the `get` return value.  In either case, the call
to the `status` method functions just as before, handling the 404 response.  In
addition to the methods already presented, `then` is available and functions as
described in `es6-promises` (the new Promise standard for JS available as a
Node module).  Each response handler sets up the header and entity as needed,
then returns the entity.  This returned value gets passed to the `then`
callback, which performs the common task of PUTting the entity.

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

Request
-------
The `Request` class issues requests and produces `Response` objects.

### Creating an `Request`

```js
var annie = require("annie"),
    ua, sess, req;

// create request - object style
ua = new annie.UserAgent();
sess = new annie.Session(ua);
req = new annie.Request(sess);

// create requests - function style
req = annie.createRequest();    // default UserAgent with a new Session

// create request for an existing session
sess = annie.createSession();
req = sess.createRequest();
```

Response
--------
An `Response` object is created by calling the `send` method of a configured
`Request` object.

### Getting an `Response`

```js
var req = annie.createRequest();

req.host = "example.com";
req.path = "/";
req.send(function(err, res) {
    if (err) throw err;
    console.log(res);
});
```
