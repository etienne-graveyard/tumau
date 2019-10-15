import { Server, Response, HttpError, HttpHeaders, ContentType, RequestContext } from 'tumau';
import path from 'path';
import fs from 'fs-extra';

const server = Server.create(async ctx => {
  const request = ctx.get(RequestContext);
  if (request.url !== '/') {
    throw new HttpError.NotFound();
  }
  const filePath = path.resolve(__dirname, './demo.html');
  // read stats to get the size of the file
  const stats = await fs.stat(filePath);
  // get the stream
  const fileStream = fs.createReadStream(filePath);

  return new Response({
    body: fileStream,
    headers: {
      [HttpHeaders.ContentLength]: stats.size,
      [HttpHeaders.ContentType]: ContentType.Html,
    },
  });
});

server.listen(3002, () => {
  console.log(`Server is up at http://localhost:3002`);
});
