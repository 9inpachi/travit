var express = require('express')
  , routes = require('./routes/')
  , http = require('http')
  , path = require('path')
  , session =  require('express-session');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

app.set('port', 8081);
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat', cookie: {maxAge: null}, resave: false,
  saveUninitialized: true
}));

app.get('/', routes.index);
app.post('/login', routes.login);
app.get('/login', routes.login);
app.get('/register', routes.register);
app.post('/register', routes.register);
app.post('/createpost', upload.fields([{ name: 'cr_post_img', maxCount: 4 }, { name: 'selectedLoc'}, {name: 'cr_post_txt'}]), routes.createpost);
app.get('/profile/:userid', routes.profile);
app.get('/pals', routes.pals);
app.get('/search', routes.search);

app.listen(8081);
console.log('App running at 127.0.0.1:8081');
