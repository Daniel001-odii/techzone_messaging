var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);




app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))



// --------------- database block ----------------//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Message = mongoose.model('Message',{
  user: String,
  message: String,
  createdAt: {type: Date, default: Date.now},
})

var dbUrl = 'mongodb+srv://admin:admin@cluster0.3rg9h4v.mongodb.net/?retryWrites=true&w=majority'
// ----------------------------------------------//



app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({user: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);

    var savedMessage = await message.save()
      console.log('saved');

    var censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('message', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Message Posted')
  }

})



io.on('connection', () =>{
  console.log('a user is connected')
})

mongoose.connect(dbUrl , function (err, db) {
  console.log('message database connected...',err);
  if(err) throw err;
})





var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});
