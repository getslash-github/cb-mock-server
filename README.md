# cb-mock-server

The mock-server is able to serve the contents of two distinct directories:

* `dynamic`: contains java script files that are executed
* `static`: contains static files (in sub-folders) that are returned directly

Files in the `dynamic` directory have a `.js` extensions.
File in the `static` directory MAY have a `.json` extension.

Considering the following directory structure:

```
/dynamic/
  users/
    567.js
  groups/
    index.js
  misc/
    readme.txt.js
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
```

* `POST /users/567` will execute the `/dynamic/users/567.js` script
* `GET /users/567` will execute the `/dynamic/users/567.js` script
* `DELETE /groups` will execute the `/dynamic/groups/index.js` script
* `GET /misc/readme.txt` will execute the `/dynamic/misc/readme.txt.js` script
* `GET /users/` will return the `/static/users/index.json` file
* `GET /files/test.jpg` will return the `/static/GET/files/test.jpg` file
* `GET /files/README` will return the `/static/GET/files/README` file
* `GET /users/234` will return the `/static/GET/users/234.json` file
* `POST /users/234` will return the `/static/POST/users/234.json` file


## Use cases
### Return a different http code than 200
Create a .js script and specify the response code.
