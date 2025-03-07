const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 1050;


const server = http.createServer(app);

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
