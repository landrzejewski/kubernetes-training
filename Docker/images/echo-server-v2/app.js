const http = require('http');
const os = require('os');

const handler = function(request, response) {
  console.log("New request from " + request.connection.remoteAddress);
  response.writeHead(200);
  response.end("New request to host: " + os.hostname() + "\n");
};

const server = http.createServer(handler);
server.listen(8080, () => console.log("Server started on port 8080"));
