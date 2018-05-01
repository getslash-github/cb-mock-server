import * as express from 'express'
import { lstatSync } from 'fs';
import { join as pJoin } from 'path';

const app = express();

const staticPath = pJoin(process.cwd() , 'test/static');
const dynamicPath = pJoin(process.cwd() , 'test/dynamic');

app.all('/*', (req, res) => {
  console.log(req.path); // just path

  const httpMethod = req.method;
  let path = req.path;

  // -- get static file
  if (lstatSync(pJoin(staticPath, httpMethod, path)).isFile()) {
    res.sendFile(pJoin(staticPath, httpMethod, path));
    return;
  }

  // if(lstatSync(path).isDirectory()){
  //   readFileSync(pJoin(path, 'index.js'),)
  // } else ) {
  //   readFileSync(pJoin(path, 'index.js'),)
  // }

  res.send('Hello World!');
});


app.listen(3000, () => console.log('Example app listening on port 3000!'));
