import * as express from 'express'
import { existsSync, lstatSync } from 'fs';
import { join as pJoin } from 'path';

const app = express();

const staticPath = pJoin(process.cwd(), 'test/static');
const dynamicPath = pJoin(process.cwd(), 'test/dynamic');

app.all('/*', (req, res) => {
  console.log(req.path); // just path

  const httpMethod = req.method;
  const path = req.path;

  // -- get static file
  let filePath = pJoin(staticPath, httpMethod, path);
  if (existsSync(filePath)) {
    /**
     * If the path exists and is a directory, we try to find an index or index.json file
     */
    if (lstatSync(filePath).isDirectory()) {
      filePath = pJoin(staticPath, httpMethod, path, 'index');

      if (existsSync(filePath)) {
        res.sendFile(filePath);
        return;
      }

      filePath = pJoin(staticPath, httpMethod, path, 'index.json');
      if (existsSync(filePath)) {
        res.sendFile(filePath);
        return;
      }

      // did not find index file in directory
      res.sendStatus(404);
      return;
    }

    /**
     * If the path is a file, we return the file.
     */
    else if (lstatSync(filePath).isFile()) {
      res.sendFile(filePath);
      return;
    } else {
      // not a regular file
      res.sendStatus(404);
      return;
    }
  }

  // -- get static file with .json extension
  filePath = pJoin(staticPath, httpMethod, path + '.json');
  if (existsSync(filePath)) {
    res.sendFile(filePath);
    return;
  }

  res.sendStatus(404);
});


app.listen(3000, () => console.log('Example app listening on port 3000!'));
