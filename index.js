var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);

var nsp = io.of('/chat');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/page/index.html');
});

var count = 0;
nsp.on('connection', function(socket){
  
  count ++;
  socket.user = { name : 'user_'+count , id : count };
  console.log('a user connected '+count);

  //nhận sự kiên join_room từ client
  socket.on('join room', function(r){
    var room_name = r;
    if(socket.user.room_name !== undefined){
      //leave old room
      socket.leave(socket.user.room_name);
      //console.log('user leave room : '+socket.user.room_name);
    }
    //join socket vào room mà client truyền lên
    socket.join(room_name);
    socket.user.room_name = room_name;
    //console.log('User join room :' + room_name);
    //thông báo xuống client là đã join vào room
    socket.emit('joined room',room_name);
    
  });

  //xử lý khi có sự kiện tạo msg từ client truyền lên
  socket.on('create message', function(msg){
    console.log('send msg to room ' + socket.user.room_name);
    if(socket.user.room_name !== undefined){
      //gửi xuống tất cả client của room trong namespace
      io.of('/chat').to(socket.user.room_name).emit('new message',{ 'user': socket.user.name , 'msg' : msg , 'sk_id' : socket.id});
    }
  });

  //xử lý sự kiện client 
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});