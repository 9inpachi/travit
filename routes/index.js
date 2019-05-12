var mongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';
var bcrypt = require('bcrypt');
var mongoClientOptions = { useNewUrlParser: true };
//Get index page
exports.index = function (req, res) {
  if (req.session.userid) {
    res.render('index.ejs');
  } else {
    res.redirect('/login');
  }
  // var message = 'This is my message';
  // res.render('login.ejs', {message: message});
}

//Post login
exports.login = function (req, res) {
  if (req.method == 'POST') {
    loginUser(req, res);
  } else if (req.session.userid) {
    res.redirect('/');
  } else {
    res.render('login.ejs');
  }
}

//Post register
exports.register = function (req, res) {
  if (req.method == 'POST') {
    registerUser(req, res);
  } else {
    res.render('login.ejs');
  }
}

//Create post
exports.createpost = function (req, res) {
  if (req.method == 'POST') {
    if (req.body) {
      mongoClient.connect(url, mongoClientOptions, function (err, db) {
        if (err) throw err;
        var dbObj = db.db('travit_db');
        getInc(dbObj, 'postid', function (err, result) {
          if (err) throw err;
          var allPostData = {
            postid: result,
            userid: req.session.userid,
            selectedLoc: req.body.selectedLoc,
            postTxt: req.body.cr_post_txt,
            postTime: new Date(),
            postImgs: req.files.cr_post_img
          };
          dbObj.collection('posts').insertOne(allPostData, function (err, resI) {
            if (err) throw err;
            console.log('Post created successfully');
            db.close();
            res.send({ 'res': 'Post created successfully' });
          })
        })
      });
    }
  }
}

//Profile
exports.profile = function (req, res) {
  if (req.session.userid) {
    var userid = req.params.userid;
    mongoClient.connect(url, mongoClientOptions, function (err, db) {
      if (err) throw err;
      var dbObj = db.db('travit_db');
      dbObj.collection('users').findOne({ $or: [{ userid: parseInt(userid) }, { username: userid }] }, function (err, userInfo) {
        if (err) throw err;
        db.close();
        if (userInfo) {
          var dob = new Date(userInfo.dob);
          var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          var date = dob.getDate();
          var month = months[dob.getMonth()];
          var year = dob.getFullYear();
          var fullDate = date + ' ' + month + ', ' + year;
          userInfo.dob = fullDate;
          res.render('profile.ejs', {
            userInfo: userInfo,
            error: false
          });
        } else {
          res.render('profile.ejs', {
            userInfo: false,
            error: true
          });
        }
      })
    });
  } else {
    res.redirect('/login');
  }
}

//pals
exports.pals = function (req, res) {
  if (req.session.userid) {
    var curUserId = req.session.userid;
    mongoClient.connect(url, mongoClientOptions, function (err, db) {
      if (err) throw err;
      var dbObj = db.db('travit_db');
      dbObj.collection('pals').find({ $or: [{ user1id: curUserId }, { user2id: curUserId }] }).toArray(function (err, palsList) {
        console.log(palsList);
      });
    });
    //res.render('pals.ejs');
  } else {
    res.redirect('/login');
  }
}

//pals
exports.search = function (req, res) {
  if (req.session.userid) {
    var searchQ = req.query.s;
    mongoClient.connect(url, mongoClientOptions, function (err, db) {
      if (err) throw err;
      var dbObj = db.db('travit_db');
      var regExS = new RegExp(searchQ);
      dbObj.collection('users').find({ $or: [{ userid: parseInt(searchQ) }, { username: regExS }, {fullname : regExS}] }).toArray(function (err, searchResults) {
        if (err) console.error(err);
        if (searchResults) {
          res.render('search.ejs', { searchResults: searchResults });
        }
        db.close();
      });
    });
  } else {
    res.redirect('/login');
  }
}

//functions
function getInc(db, name, callBack) {
  db.collection('counters').findAndModify({ _id: name }, null, { $inc: { seq_value: 1 } }, function (err, result) {
    if (err) callBack(err, result);
    callBack(err, result.value.seq_value);
  })
}
function registerUser(req, res) {
  mongoClient.connect(url, mongoClientOptions, function (err, db) {
    if (err) throw err;
    var dbObj = db.db('travit_db');
    dbObj.collection('users').findOne({ 'username': req.body.r_username }, { 'username': 1 }, function (err, user) {
      if (err) throw err;
      if (user) {
        console.log('User with username: ' + JSON.stringify(user) + ' already exists!');
        res.send({ 'res': 'User already exists!' });
      } else {
        getInc(dbObj, 'userid', function (err, result) {
          var password = req.body.r_password;
          var saltRounds = 10;
          bcrypt.hash(password, saltRounds, function (err, hashPass) {
            if (err) console.log(err);
            var newUser = {
              'userid': result,
              'datecreated': new Date(Date.now()),
              'fullname': req.body.r_fullname,
              'username': req.body.r_username,
              'email': req.body.r_email,
              'dob': new Date(req.body.r_dob),
              'password': hashPass
            };
            if (password != req.body.r_cpassword) {
              res.send({ 'res': 'Passwords do not match!' });
            } else {
              console.log(newUser);
              dbObj.collection('users').insertOne(newUser, function (err, resI) {
                if (err) throw err;
                console.log('New user inserted');
                db.close();
                res.send({ 'res': 'User successfully registered!', 'status': true });
              })
            }
          });
        })
      }
    })
  })
}

function loginUser(req, res) {
  ;
  if (req.session.userid) {
    console.log('User with ID: ' + req.session.userid + ' already logged in!');
  } else {
    if (req.body.l_username != '' && req.body.l_password != '') {
      mongoClient.connect(url, mongoClientOptions, function (err, db) {
        if (err) throw err;
        dbObj = db.db('travit_db');
        dbObj.collection('users').findOne({ 'username': req.body.l_username }, function (err, resUN) {
          if (err) throw err;
          if (resUN) {
            bcrypt.compare(req.body.l_password, resUN.password, function (err, resBcpt) {
              if (err) throw err;
              if (resBcpt) {
                req.session.userid = resUN.userid;
                res.send({ 'redirect': '/' });
              } else {
                res.status(500).send({ 'error': 'Error logging in. Wrong password!' });
              }
            })
          } else {
            res.status(500).send({ 'error': 'Username does not exist!' });
          }
        })
      })
    }
  }
}
