import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { createServer } from 'https';
import { on } from 'events';
import mime from 'mime-types';

const port = 3000;
const reqs = on(
  createServer({
    key: readFileSync("./cert.key"),
    cert: readFileSync("./cert.crt"),
  }).listen(port), 
  'request'
);


function isLogin(req) {
  // TODO: check request cookie
  console.log(req.headers);
  // ここで cookie をチェックして sessionid が有効なら true にしてください。
  return false;
}

async function getIndex(req, res) {
  if (!isLogin(req)) {
    res.writeHead(302, {
      "Location": "/login"
    });
    res.end();
    return;
  }
  res.end("Login Success!!");
}

async function getLogin(req, res) {
  const html =  await readFile("./login.html");
  res.writeHead(200, {
    "Content-Type": "text/html"
  });
  res.end(html);
}

async function postLogin(req, res) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (d) => { data += d });
    req.on("end", () => {
      console.log(data);
      // TODO: ここのデータのパースをしてください。
      // ここで、リクエストの内容を取り出してIDとpasswordをチェックしてください。
      // IDは yuki@example.com パスワードは yUki0525! ということにします。
      res.writeHead(401);
      // TODO: check login request and set cookie
      res.end("Unauthorized");
      resolve();
    });
  });
}

async function staticFile(url, req, res) {
  try {
    const content = await readFile(resolve("./public", url.pathname.slice(1)));
    // TODO: ここに Cache Control を入れてコンテンツをキャッシュさせてみてください。
    res.writeHead(200, {
      "Content-Type": mime.lookup(url.pathname),
    });
    res.end(content);
  } catch (e) {
    console.error(e);
    res.writeHead(404);
    res.end('Not Found');
  }
}

for await (const [req, res] of reqs) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(url);
  try {
    if (url.pathname === "/" && req.method === "GET") {
      await getIndex(req, res);
    } else if (url.pathname === "/login" && req.method === "GET") {
      await getLogin(req, res);
    } else if (url.pathname === "/login" && req.method === "POST") {
      await postLogin(req, res);
    } else {
      await staticFile(url, req, res);
    }
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.end(e.toString());
  }
}
