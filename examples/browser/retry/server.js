const http = require('http');

const host = 'localhost';
const port = 8080;

const authToken = Buffer.from("Hello World").toString('base64');
const requestListener = function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'authorization');

    // handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/login') {
        res.writeHead(200);
        res.end(authToken);
        return;
    }

    if (req.headers.authorization === `Bearer ${authToken}`) {
        res.writeHead(200);
        console.log("Ok");
        const json = {
            message: "Hello World"
        }
        res.end(JSON.stringify(json));
    } else {
        console.log("Error");
        res.writeHead(401);
        const json = {
            error: "Unathourised"
        }
        res.end(JSON.stringify(json));
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});