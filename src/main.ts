import * as express from 'express';
import { Request, Response } from 'express';
import { existsSync, lstatSync } from 'fs';
import * as _path from 'path';
import { join as pJoin } from 'path';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as _ from 'lodash';

const argv = require('yargs').argv;

const staticPath = _.startsWith(argv.static, '/')
  ? argv.static
  : pJoin(process.cwd(), argv.static || 'static');

const dynamicPath = _.startsWith(argv.dynamic, '/')
  ? argv.dynamic
  : pJoin(process.cwd(), argv.dynamic || 'dynamic');

const port = argv.port || 3000;

function handleStaticFiles(res: Response, path: string): boolean {
  let filePath;

  if (existsSync(path)) {
    /**
     * If the path exists and is a directory, we try to find an index or index.json file
     */
    if (lstatSync(path).isDirectory()) {
      filePath = pJoin(path, 'index');

      if (existsSync(filePath)) {
        res.sendFile(filePath);
        return true;
      }

      // -- try with .json extension
      filePath = pJoin(path, 'index.json');
      if (existsSync(filePath)) {
        res.sendFile(filePath);
        return true;
      }

      // did not find index file in directory
      return false;
    }

    /**
     * If the path is a file, we return the file.
     */
    if (lstatSync(path).isFile()) {
      res.sendFile(path);
      return true;
    }

    // path exists but is not a regular file
    return false;
  }

  // -- get static file with .json extension
  filePath = pJoin(path + '.json');
  if (existsSync(filePath) && lstatSync(filePath).isFile()) {
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
function handleDynamicFiles(req: Request, res: Response, path: string, basePath: string): boolean {
  let filePath;

  // -- if the path is an existing directory, we try to open an index.js in that directory
  if (existsSync(path) && lstatSync(path).isDirectory()) {
    filePath = pJoin(path, 'index.js');

    if (existsSync(filePath) && lstatSync(filePath).isFile()) {
      require(filePath).handle(req, res);
      return true;
    }
  } else { // -- if the path is not an directory, we assume it is a file and add a .js extension
    filePath = pJoin(path + '.js');
    if (existsSync(filePath) && lstatSync(filePath).isFile()) {
      require(filePath).handle(req, res);
      return true;
    }
  }

  // -- now that neither a directory nor a file could be found, we fallback and try to find an index.js in parent dir
  let parent = _path.dirname(path);

  while (parent.startsWith(basePath)) {
    if (existsSync(parent)
      && lstatSync(parent).isDirectory()
      && existsSync(pJoin(parent, 'index.js'))
      && lstatSync(pJoin(parent, 'index.js')).isFile()) {
      require(pJoin(parent, 'index.js')).handle(req, res);
      return true;
    }
    parent = _path.dirname(parent);
  }

  return false;
}


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

app.all('/*', (req, res) => {
  const httpMethod = req.method;
  const path = decodeURI(req.path);
  let onlyShowLogging = false;
  if(req.url.indexOf('logging') !== -1) {
    const body = req.body as any;
    if(body['onlyShowLogging'] !== undefined) onlyShowLogging = body['onlyShowLogging'] as boolean;
    console.log('Log:', JSON.stringify(req.body['message']));
  }
  if(!onlyShowLogging) console.log(httpMethod, path);

  // -- get static file
  let handled = handleStaticFiles(res, pJoin(staticPath, httpMethod, path));
  if (handled === false) {
    handled = handleDynamicFiles(req, res, pJoin(dynamicPath, path), dynamicPath);
  }

  if (handled === false) {
    res.sendStatus(404);
  }
});

app.listen(port, () => console.log(`cb-mock-server listening on port ${port}!`));
