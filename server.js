const express = require('express');
const cors = require('cors')

const jwt = require('jsonwebtoken')

const PORT = 3000;
const app = express();

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/library", { useNewUrlParser: true })
mongoose.set('useFindAndModify', false);

var register = require('../server/models/book');
var adding = require('../server/models/bookAdd');

app.use(express.json());
app.use(cors())

app.get('/', function (req, res) {
  res.send('Hello from server')
})

app.get("/newuser", async (request, response) => {
  try {
    var result = await register.find().exec();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized request')
  }
  let token = req.headers.authorization.split(' ')[1]
  if (token === 'null') {
    return res.status(401).send('Unauthorized request')
  }
  let payload = jwt.verify(token, 'secretKey')
  if (!payload) {
    return res.status(401).send('Unauthorized request')
  }
  req.userId = payload.subject
  next()
}

//API for register
app.post('/enroll', function (req, res) {
  let userData = req.body
  console.log(userData)
  let user = new register(userData)
  user.save((error, registeredUser) => {
    if (error) {
      console.log(error)
    } else {
      let payload = { subject: registeredUser._id }
      let token = jwt.sign(payload, 'secetKey')
      //res.status(200).send(registeredUser)
      res.status(200).send({ token })
    }
  })
})

//API for login
app.post('/login', (req, res) => {
  let userData = req.body
  register.findOne({ email: userData.email }, (error, user) => {
    if (error) {
      console.log(error)
    } else {
      if (!user) {
        res.status(401).send("Invalid email")
      } else if (user.password !== userData.password) {
        res.status(401).send("Invalid password")
      } else {
        //console.log(user.email)
        let payload = { subject: user._id }
        let token = jwt.sign(payload, 'secetKey')
        //res.status(200).send(user)
        res.status(200).send({ token })
      }
    }
  })
})

//API for get books
app.get("/getbooks", async (request, response) => {
  try {
    var result = await adding.find().exec();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.post('/books', function (req, res) {
  console.log(req.body)
  adding.insertMany([req.body], (err, result) => {
    if (err) throw err;
    if (result) {
      console.log(result)
      res.json(result)
    } else {
      res.send(JSON.stringify({
        error: 'Error'
      }))
    }
  })
})

//API for post books
app.post('/getbooks', (req, res, next) => {
  var resultset = []
  var details = adding.findById(req.body.id, function (err, result) {
    resultset = result;
    console.log(resultset)
    res.status(200).json(resultset)
  });
});

app.post('/getbookupdate', (req, res, next) => {
  var resultsetBook = [];
  console.log(req.body);
  console.log(req.body.id);
  var myquery = { _id: req.body.id };
  var newvalues = { $set: { name: req.body.name, author: req.body.author, price: req.body.price, publishedYear: req.body.publishedYear, publisher: req.body.publisher } };
  adding.updateOne(myquery, newvalues, function (err, res) {
    if (err) throw err;
    console.log("1 document updated");
  });
  res.status(200).json({ 'message': 'updated' });
});

// app.post('/getbookdelete', (req, res) => {
//   adding.find(req.body, (err, result) => {
//     var myid = { _id: req.params.id };
//     adding.deleteOne(myid, function (err, res) {
//       if (err) throw err;
//     });
//     res.status(200).json({ 'message': 'deleted' });
//   })
// })

app.listen(PORT, function () {
  console.log("Server running on localhost:" + PORT);
});

