const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let status = {
  mouseX: 1600,
  mouseY: 500,
}
let connections = {

}

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html")
});

io.on('connection', (socket) => {
  let clientInfo = {socket, status: {}}
  connections = {...connections, [socket.id]: clientInfo}
  socket.emit('clientID', socket.id)
  socket.on('disconnect', () => {
    delete connections[socket.id]
  });
  socket.on('username', (data)=>{
      console.log("USER::"+data);
  })
  socket.on('stream', (data)=>{
    socket.broadcast.emit('stream', data);
  })
  socket.on('requestStatus', data =>{
    socket.emit('requestStatus', status)
    console.log("status requested::"+data);
  })
  socket.on('pressKey', data => {
    //data --> {socketID: "xyz", keyEvent: 61}
    let targetClient = connections[data.socketID]
    if(targetClient){
      targetClient.socket.emit('pressKey', data.keyEvent)
      socket.emit('log', "KeyEvent sent!")
    }else{
      socket.emit('log', "KeyEvent failed! Socket not available")
    }
  })
});

http.listen(3000, () => {
  console.log('listening on port 3000');
});