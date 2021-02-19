"use strict";
exports.__esModule = true;
var express = require("express");
var fs_1 = require("fs");
var _path = require("path");
var path_1 = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var _ = require("lodash");
var argv = require('yargs').argv;
var staticPath = _.startsWith(argv.static, '/')
    ? argv.static
    : path_1.join(process.cwd(), argv.static || 'static');
var dynamicPath = _.startsWith(argv.dynamic, '/')
    ? argv.dynamic
    : path_1.join(process.cwd(), argv.dynamic || 'dynamic');
var port = argv.port || 3000;
function handleStaticFiles(res, path) {
    var filePath;
    if (fs_1.existsSync(path)) {
        /**
         * If the path exists and is a directory, we try to find an index or index.json file
         */
        if (fs_1.lstatSync(path).isDirectory()) {
            filePath = path_1.join(path, 'index');
            if (fs_1.existsSync(filePath)) {
                res.sendFile(filePath);
                return true;
            }
            // -- try with .json extension
            filePath = path_1.join(path, 'index.json');
            if (fs_1.existsSync(filePath)) {
                res.sendFile(filePath);
                return true;
            }
            // did not find index file in directory
            return false;
        }
        /**
         * If the path is a file, we return the file.
         */
        if (fs_1.lstatSync(path).isFile()) {
            res.sendFile(path);
            return true;
        }
        // path exists but is not a regular file
        return false;
    }
    // -- get static file with .json extension
    filePath = path_1.join(path + '.json');
    if (fs_1.existsSync(filePath) && fs_1.lstatSync(filePath).isFile()) {
        res.sendFile(filePath);
        return true;
    }
    return false;
}
/**
 * Handle request with dynamic scripts.
 *
 * @param {e.Request} req incoming request
 * @param {e.Response} res outgoinng response
 * @param {string} path the full path that is requested
 * @param {string} basePath the path to the directory that contains the script
 * @returns {boolean} true if the request was handled
 */
function handleDynamicFiles(req, res, path, basePath) {
    var filePath;
    // -- if the path is an existing directory, we try to open an index.js in that directory
    if (fs_1.existsSync(path) && fs_1.lstatSync(path).isDirectory()) {
        filePath = path_1.join(path, 'index.js');
        if (fs_1.existsSync(filePath) && fs_1.lstatSync(filePath).isFile()) {
            require(filePath).handle(req, res);
            return true;
        }
    }
    else { // -- if the path is not an directory, we assume it is a file and add a .js extension
        filePath = path_1.join(path + '.js');
        if (fs_1.existsSync(filePath) && fs_1.lstatSync(filePath).isFile()) {
            require(filePath).handle(req, res);
            return true;
        }
    }
    // -- now that neither a directory nor a file could be found, we fallback and try to find an index.js in parent dir
    var parent = _path.dirname(path);
    while (parent.startsWith(basePath)) {
        if (fs_1.existsSync(parent)
            && fs_1.lstatSync(parent).isDirectory()
            && fs_1.existsSync(path_1.join(parent, 'index.js'))
            && fs_1.lstatSync(path_1.join(parent, 'index.js')).isFile()) {
            require(path_1.join(parent, 'index.js')).handle(req, res);
            return true;
        }
        parent = _path.dirname(parent);
    }
    return false;
}
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.all('/*', function (req, res) {
    var httpMethod = req.method;
    var path = decodeURI(req.path);
    var onlyShowLogging = false;
    if (req.url.indexOf('logging') !== -1) {
        var body = req.body;
        if (body['onlyShowLogging'] !== undefined)
            onlyShowLogging = body['onlyShowLogging'];
        console.log('Log:', JSON.stringify(req.body['message']));
    }
    if (!onlyShowLogging)
        console.log(httpMethod, path);
    // -- get static file
    var handled = handleStaticFiles(res, path_1.join(staticPath, httpMethod, path));
    if (handled === false) {
        handled = handleDynamicFiles(req, res, path_1.join(dynamicPath, path), dynamicPath);
    }
    if (handled === false) {
        res.sendStatus(404);
    }
});
app.listen(port, function () { return console.log("cb-mock-server listening on port " + port + "!"); });
