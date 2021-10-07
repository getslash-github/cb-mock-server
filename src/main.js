"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express = require("express");
var fs_1 = require("fs");
var _path = require("path");
var path_1 = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var _ = require("lodash");
process.on('SIGTERM', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('EXITING GRACEFULLY...');
        process.exit(0);
        return [2 /*return*/];
    });
}); });
var argv = require('yargs').argv;
var staticPath = _.startsWith(argv.static, '/')
    ? argv.static
    : (0, path_1.join)(process.cwd(), argv.static || 'static');
var dynamicPath = _.startsWith(argv.dynamic, '/')
    ? argv.dynamic
    : (0, path_1.join)(process.cwd(), argv.dynamic || 'dynamic');
var port = argv.port || 3000;
var onlyShowLogging = false;
function handleStaticFiles(res, path) {
    var filePath;
    if ((0, fs_1.existsSync)(path)) {
        /**
         * If the path exists and is a directory, we try to find an index or index.json file
         */
        if ((0, fs_1.lstatSync)(path).isDirectory()) {
            filePath = (0, path_1.join)(path, 'index');
            if ((0, fs_1.existsSync)(filePath)) {
                res.sendFile(filePath);
                return true;
            }
            // -- try with .json extension
            filePath = (0, path_1.join)(path, 'index.json');
            if ((0, fs_1.existsSync)(filePath)) {
                res.sendFile(filePath);
                return true;
            }
            // did not find index file in directory
            return false;
        }
        /**
         * If the path is a file, we return the file.
         */
        if ((0, fs_1.lstatSync)(path).isFile()) {
            res.sendFile(path);
            return true;
        }
        // path exists but is not a regular file
        return false;
    }
    // -- get static file with .json extension
    filePath = (0, path_1.join)(path + '.json');
    if ((0, fs_1.existsSync)(filePath) && (0, fs_1.lstatSync)(filePath).isFile()) {
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
    if ((0, fs_1.existsSync)(path) && (0, fs_1.lstatSync)(path).isDirectory()) {
        filePath = (0, path_1.join)(path, 'index.js');
        if ((0, fs_1.existsSync)(filePath) && (0, fs_1.lstatSync)(filePath).isFile()) {
            require(filePath).handle(req, res);
            return true;
        }
    }
    else { // -- if the path is not an directory, we assume it is a file and add a .js extension
        filePath = (0, path_1.join)(path + '.js');
        if ((0, fs_1.existsSync)(filePath) && (0, fs_1.lstatSync)(filePath).isFile()) {
            require(filePath).handle(req, res);
            return true;
        }
    }
    // -- now that neither a directory nor a file could be found, we fallback and try to find an index.js in parent dir
    var parent = _path.dirname(path);
    while (parent.startsWith(basePath)) {
        if ((0, fs_1.existsSync)(parent)
            && (0, fs_1.lstatSync)(parent).isDirectory()
            && (0, fs_1.existsSync)((0, path_1.join)(parent, 'index.js'))
            && (0, fs_1.lstatSync)((0, path_1.join)(parent, 'index.js')).isFile()) {
            require((0, path_1.join)(parent, 'index.js')).handle(req, res);
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
    if (req.url.indexOf('logging') !== -1) {
        var body = req.body;
        if (body['onlyShowLogging'] !== undefined)
            onlyShowLogging = body['onlyShowLogging'];
        console.log('Log:', JSON.stringify(req.body['message']));
    }
    if (!onlyShowLogging)
        console.log(httpMethod, path);
    // -- get static file
    var handled = handleStaticFiles(res, (0, path_1.join)(staticPath, httpMethod, path));
    if (handled === false) {
        handled = handleDynamicFiles(req, res, (0, path_1.join)(dynamicPath, path), dynamicPath);
    }
    if (handled === false) {
        res.sendStatus(404);
    }
});
app.listen(port, function () { return console.log("cb-mock-server listening on port " + port + "!"); });
