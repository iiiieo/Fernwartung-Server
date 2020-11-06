const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let connections = {
  0: {
    username: undefined,
    socket: undefined,
  }
}//id:{client: c, username: u}

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html")
});

io.on('connection', (socket) => {
  //client
  let shortId = Math.round(Math.random()*Math.pow(10,4))
  let clientInfo = {socket, shortId}

  connections = {...connections, [socket.id]: clientInfo,}
  socket.emit('clientId', {id: socket.id, shortId: connections[socket.id].shortId})

  socket.on('disconnect', () => {
    delete connections[socket.id]
  });
  socket.on('username', (username)=>{
      connections[socket.id].username=username
  })
  socket.on('stream', (data)=>{
    socket.broadcast.emit('stream', data);
  })
  //helper
  socket.on('pressKey', data => {
    //data--> {socketID: "xyz", keyEvent: 61}
    let targetClient = getTargetClient(data.socketID)
    if(targetClient){
      targetClient.socket.emit('pressKey', data.keyEvent)
    }
  })
  socket.on('moveMouse', data =>{
    //data--> {socketID: "xyz", mouseX: 615, mouseY: 615}
    let targetClient = getTargetClient(data.socketID)
    if(targetClient){
      targetClient.socket.emit('moveMouse', { mouseX: data.mouseX, mouseY: data.mouseY})
    }
  })
});

const getTargetClient = (id) => {
  let targetClient = connections[id]
  if(targetClient){
    socket.emit('log', "KeyEvent sent!")
  }else{
    socket.emit('log', "KeyEvent failed! Socket not available")
  }
}

http.listen(3000, () => {
  console.log('listening on port 3000');
});