import { createWriteStream } from "fs";
import { open, readdir, readFile, rename, rm } from "fs/promises";
import http from "http";
import mime from "mime-types";
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  if (req.method === "GET") {
    if (req.url === "/favicon.ico") return res.end("No favicon");
    if (req.url === "/") {
      serveDirectory(req, res);
    } else {
      try {
        const [url, queryString] = req.url.split("?");
        const queryParams = {};
        queryString?.split("&").forEach((pair) => {
          const [key, value] = pair.split("=");
          queryParams[key] = value;
        });
        const fileHandler = await open(`./storage/${decodeURIComponent(url)}`);
        const stats = await fileHandler.stat();
        if (stats.isDirectory()) {
          serveDirectory(req, res);
        } else {
          const readStream = fileHandler.createReadStream();
          res.setHeader("Content-Type", mime.contentType(url.slice(1)));
          res.setHeader("Content-Length", stats.size);
          if (queryParams.action === "download") {
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${url.slice(1)}`
            );
          }
          readStream.pipe(res);
        }
      } catch (error) {
        console.log(error);
        res.end("Not found");
      }
    }
  } else if (req.method === "OPTIONS") {
    res.end();
  } else if (req.method === "POST") {
    const writeableStrem = createWriteStream(
      `./storage/${req.headers.filename}`
    );
    req.pipe(writeableStrem);
    req.on("end", () => {
      res.end("File Uploaded Successfully");
    });
  } else if (req.method === "DELETE") {
    req.on("data", async (chunk) => {
      try {
        const filename = chunk.toString();
        await rm(`./storage/${filename}`);
        res.end("File Deleted Successfully");
      } catch (error) {
        res.end(error.message);
      }
    });
  } else if (req.method === "PATCH") {
    req.on("data", async (chunk) => {
      const { oldfilename, newFileName } = JSON.parse(chunk.toString());
      await rename(`./storage/${oldfilename}`, `./storage/${newFileName}`);
      res.end("File Renamed Successfully");
    });
  }
});

async function serveDirectory(req, res) {
  const [url] = req.url.split("?");

  const files = await readdir(`./storage/${decodeURIComponent(url)}`);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(files));
}
server.listen(80, "::0", () => {
  console.log("server started");
});
