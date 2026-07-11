import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.argv[2] || "public");
const port = Number(process.argv[3] || 4173);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    let relative = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
    if (relative.endsWith("/")) relative += "index.html";
    let file = join(root, relative);
    const info = await stat(file).catch(() => null);
    if (info?.isDirectory()) file = join(file, "index.html");
    if (!info && !extname(file)) file = join(file, "index.html");
    const finalInfo = await stat(file).catch(() => null);
    if (!finalInfo?.isFile() || !file.startsWith(root)) throw new Error("not found");
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": extname(file) === ".html" ? "no-cache" : "public, max-age=3600"
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    createReadStream(join(root, "404.html")).pipe(response);
  }
}).listen(port, "127.0.0.1", () => console.log("Serving " + root + " on http://127.0.0.1:" + port));
