import * as express from 'express';
import { Request, Response } from 'express';
import { existsSync, lstatSync } from 'fs';
import { join as pJoin } from 'path';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

const argv = require('yargs').argv;

const staticPath = pJoin(process.cwd(), argv.static || 'static');
const dynamicPath = pJoin(process.cwd(), argv.dynamic || 'dynamic');
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

function handleDynamicFiles(req: Request, res: Response, path: string): boolean {
  let filePath;
  if (existsSync(path) && lstatSync(path).isDirectory()) {
    filePath = pJoin(path, 'index.js');

    if (existsSync(filePath) && lstatSync(filePath).isFile()) {
      require(filePath).handle(req, res);
      return true;
    }

    // did not find index file in directory
    return false;
  }

  filePath = pJoin(path + '.js');
  if (existsSync(filePath) && lstatSync(filePath).isFile()) {
    require(filePath).handle(req, res);
    return true;
  }

  return false;
}


const app = express();
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

app.all('/*', (req, res) => {
  const httpMethod = req.method;
  const path = req.path;

  console.log(httpMethod, path);

  // -- get static file
  let handled = handleStaticFiles(res, pJoin(staticPath, httpMethod, path));
  if (handled === false) {
    handled = handleDynamicFiles(req, res, pJoin(dynamicPath, path));
  }

  if (handled === false) {
    res.sendStatus(404);
  }
});

app.listen(port, () => console.log(`cb-mock-server listening on port ${port}!`));
