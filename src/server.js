const express = require('express');
const axios = require('axios');
require('dotenv').config();
const { Server } = require('socket.io');
const { meetRoomHandler } = require('./lib/utils/meetRoomHandler');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors({allowedHeaders: '*'}));

const httpServer = require('http').createServer(app);
const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });

io.on('connection', (socket) => {
  console.log('New socket id : ', socket.id, 'Connected users: ', io.engine.clientsCount);

  meetRoomHandler(socket, io);

  socket.on('disconnect', (reason) => {
    console.log(reason);

    console.log('Disconnected id : ', socket.id, 'Connected users: ', io.engine.clientsCount);
  });
});

app.get('/', (req, res) => {
  res.json({message: 'Hello World!'});
})

app.get('/turn-creds', async (req, res) => {
  const URL = `${process.env.METERED_BASE_URL}/api/v1/turn/credentials?apiKey=${process.env.METERED_API_KEY}`;
  try {
		const response = await axios.get(URL);
		res.status(200).json(response.data);
	} catch (err) {
		res.status(500).json({ message: err });
	}
  
})

const port = process.env.PORT || 4000;

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
