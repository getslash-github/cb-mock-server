# cb-mock-server

The mock-server is able to serve the contents of two distinct directories:

* `static`: contains static files and sub-folders that are returned directly and are separated by 
   http request methods
* `dynamic`: contains java script files that are executed

File in the `static` directory MAY have a `.json` extension.
Files in the `dynamic` directory have a `.js` extensions.

Considering the following directory structure:

```
/static/
  GET/
    files/
      test.jpg
      README
    users/
      index.json
      234.json
  POST/
    users/
      234.json
/dynamic/
  users/
    567.js
  groups/
    index.js
  misc/
    readme.txt.js
```

* `GET /users/` will return the `/static/users/index.json` file
* `GET /files/test.jpg` will return the `/static/GET/files/test.jpg` file
* `GET /files/README` will return the `/static/GET/files/README` file
* `GET /users/234` will return the `/static/GET/users/234.json` file
* `POST /users/234` will return the `/static/POST/users/234.json` file
* `POST /users/567` will execute the `/dynamic/users/567.js` script
* `GET /users/567` will execute the `/dynamic/users/567.js` script
* `DELETE /groups` will execute the `/dynamic/groups/index.js` script
* `GET /misc/readme.txt` will execute the `/dynamic/misc/readme.txt.js` script

## Example scripts

Scripts must export a `handle` function that takes two parameters, a request and a response parameter.
```
exports.handle = function (req, res) {
  var password = req.body;

  if (password !== 'secret') {
    res.status(403).send('wrong password');
  } else {
    res.send({result: 'ok'});
  }
};
```


## Use cases
### Return a different http code than 200
Create a .js script and specify the response code.
