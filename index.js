const WebSocket = require('ws');
const http = require('http');
const readline = require('readline');

const port = process.env.PORT;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('IRC WebSocket Server Running');
});

const wss = new WebSocket.Server({ server });

console.log('[IRC] WebSocket Server Starting...');

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  let nickname = 'Unknown';

  console.log(`[IRC] New client connected from ${ip}`);

  ws.on('message', (message) => {
    const msg = message.toString();
    console.log(`[IRC] Received: ${msg}`);

    if (msg.startsWith('NICK ')) {
      nickname = msg.substring(5).trim();
      console.log(`[IRC] Client set nickname to ${nickname}`);
    } else if (msg.startsWith('MSG ')) {
      const chatMessage = msg.substring(4).trim();
      const fullMessage = `${nickname}: ${chatMessage}`;

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(fullMessage);
        }
      });
    }
  });

  ws.on('close', () => {
    console.log(`[IRC] Client from ${ip} disconnected`);
  });

  ws.send('Connected to server!');
});

server.listen(port, () => {
  console.log(`[IRC] WebSocket Server Running on port ${port}`);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  if (input.startsWith('say ')) {
    const msg = input.substring(4);
    const fullMessage = `Console: ${msg}`;

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(fullMessage);
      }
    });

    console.log(`[IRC] Broadcasted: ${fullMessage}`);
  }
});
