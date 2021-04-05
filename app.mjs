import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { createSecureServer as createServer } from 'http2';
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
  const cookie = req.headers.cookie.split(";").map((c) => c.trim().split("="));
  for (const [id, value] of cookie) {
    if (id === "session_id" && value === "1") {
      return true;
    }
  }
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
      const [id, password] = data.split("&").map((item) => item.split("=")[1]);
      if (id !== "yuki%40example.com" || password !== "yUki0525%21") {
        res.writeHead(401);
        res.end("Unauthorized");
      } else {
        res.writeHead(302, {
          "Location": "/",
          "Set-Cookie": "session_id=1",
        });
        res.end();
      }
      resolve();
    });
  });
}

async function staticFile(url, req, res) {
  try {
    const content = await readFile(resolve("./public", url.pathname.slice(1)));
    res.writeHead(200, {
      "Content-Type": mime.lookup(url.pathname),
      "Cache-Control": "max-age=600",
    });
    res.end(content);
  } catch (e) {
    console.error(e);
    res.writeHead(404);
    res.end('Not Found');
  }
}

for await (const [req, res] of reqs) {
  const url = new URL(req.url, `${req.headers[":scheme"]}://${req.headers[":authority"]}`);
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
