var express    =       require("express");
var multer     =       require('multer');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var home = require('./routes/home');
var ejs = require("ejs");
var app = express();
var done = false;

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.bodyParser());
app.use(express.cookieParser());

//development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));

app.post('/storePhoto',function(req,res){
//	 console.log(req.param("caption"));
  if(done==true){
   
    home.saveToMySql(req, res);
  }
});

app.get('/', home.upload);
app.post('/signIn', home.signIn);
app.post('/signUp', home.signUp);

app.get('/saveToMySql', home.saveToMySql);
app.get('/getListAlbum', home.getListAlbum);
app.get('/getImage', home.getImage);
app.get('/getListImages', home.getListImages);
app.get('/getListUser', home.getListUser);
app.post('/addFriend', home.addFriend);
app.get('/getMyFriends', home.getMyFriends);
app.post('/shareAlbum', home.shareAlbum);
app.get('/getSharedListAlbum', home.getSharedListAlbum);

http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
