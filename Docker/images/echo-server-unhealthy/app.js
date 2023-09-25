const http = require('http');
const os = require('os');

let counter = 0;

const handler = function(request, response) {
  console.log("New request from " + request.connection.remoteAddress);
  counter++;
  if (counter > 3) {
    response.writeHead(500);
    return;
  }
  response.writeHead(200);
  response.end("You've hit " + os.hostname() + "\n");
};

const server = http.createServer(handler);
server.listen(8080, () => console.log("Server started on port 8080"));
