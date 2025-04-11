import { open, readdir, readFile } from "fs/promises";
import http from "http";
const server = http.createServer(async (req, res) => {
  if (req.url === "/favicon.ico") return res.end("No favicon");
  if (req.url === "/") {
    serveDirectory(req, res);
  } else {
    try {
      const fileHandler = await open(
        `./storage/${decodeURIComponent(req.url)}`
      );
      const stats = await fileHandler.stat();
      if (stats.isDirectory()) {
        serveDirectory(req, res);
      } else {
        const readStream = fileHandler.createReadStream();
        readStream.pipe(res);
      }
    } catch (error) {
      console.log(error);
      res.end("Not found");
    }
  }
});

async function serveDirectory(req, res) {
  const files = await readdir(`./storage${decodeURIComponent(req.url)}`);
  const listItem = files
    .map(
      (file) =>
        `<a href=".${req.url === "/" ? "" : req.url}/${file}">${file}</a><br />`
    )
    .join("");
  const htmlBoilerPlate = await readFile("./index.html", "utf-8");
  res.end(htmlBoilerPlate.replace("${listItem}", listItem));
}
server.listen(4000, "0.0.0.0", () => {
  console.log("server started");
});
