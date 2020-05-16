// const uuid = require('uuid');
// const request = require('request');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;

// // JSON data
// const users = [{
//   id: 1,
//   name: "Richard Hendricks",
//   email: "richard@piedpiper.com",
// },
// {
//   id: 2,
//   name: "Bertram Gilfoyle",
//   email: "gilfoyle@piedpiper.com",
// },
// ];

// // << db setup >>
// const db = require("../database");
// const dbName = "telegram_chat_bot_db";
// const collectionName = "users";

// // Router
// const router = app => {
//   app.get('/', (request, response) => {
//     response.send({
//       message: 'Node.js and Express REST API'
//     });
//   });

//   // app.get('/users', (request, response) => {
//   //   response.send(users);
//   // });


//   // << db init >>
//   db.initialize(dbName, collectionName, function (dbCollection) {
//     dbCollection.find().toArray(function (err, result) {
//       if (err) throw err;
//       console.log(result);
//     });

//     // << db CRUD routes >>
//     // Get users
//     app.get("/users", (request, response) => {
//       // return updated list
//       dbCollection.find().toArray((error, result) => {
//         if (error) throw error;
//         response.json(result);
//       });
//     });

//     // Created user
//     app.post("/users", (request, response) => {
//       const item = request.body;
//       const user_id = uuid.v1();
//       item.id = user_id;

//       bcrypt.hash(item.password, saltRounds, function (err, hash) {
//         if (err) {
//           return next(err);
//         }
//         console.log("hashedPassword: ", hash);
//         item.password = hash;
//         dbCollection.insertOne(item, (error, result) => { // callback of insertOne
//           if (error) throw error;
//           // return updated list
//           dbCollection.find().toArray((_error, _result) => { // callback of find
//             if (_error) throw _error;
//             response.json(_result);
//           });
//         });
//       })
//     });

//     // Edit user
//     app.put("/users/:id", (request, response) => {
//       const item_id = request.params.id;
//       const item = request.body;
//       console.log("Editing item: ", item_id, " to be ", item);

//       bcrypt.hash(item.password, saltRounds, function (err, hash) {
//         if (err) {
//           return next(err);
//         }
//         item.password = hash;
//         dbCollection.updateOne({ id: item_id }, { $set: item }, (error, result) => {
//           if (error) throw error;
//           // send back entire updated list, to make sure frontend data is up-to-date
//           dbCollection.find().toArray(function (_error, _result) {
//             if (_error) throw _error;
//             response.json(_result);
//           });
//         });
//       })
//     });

//     // Get user with user_id
//     app.get("/users/:id", (request, response) => {
//       const item_id = request.params.id;
//       console.log("Item: ", item_id);

//       dbCollection.findOne({ id: item_id }, (error, result) => {
//         if (error) throw error;
//         // return item
//         response.json(result);
//       });
//     });

//     // Delete user
//     app.delete("/users/:id", (request, response) => {
//       const item_id = request.params.id;
//       console.log("Delete item with id: ", item_id);

//       dbCollection.deleteOne({ id: item_id }, function (error, result) {
//         if (error) throw error;
//         // send back entire updated list after successful request
//         dbCollection.find().toArray(function (_error, _result) {
//           if (_error) throw _error;
//           response.json(_result);
//         });
//       });
//     });

//     // Login user
//     app.post("/users", (request, response) => {
//       // const item = request.body;
//       console.log("Item: ", request);

//       dbCollection.findOne({ mail: item.mail }, (error, result) => {
//         if (error) throw error;
//         // return item
//         response.json(result);
//       });
//     });

//   }, function (err) {
//     throw (err);
//   });
// }

// // Export the router
// module.exports = router;


// app/routes.js

const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.json({
    message: 'Signup successful',
    user: req.user
  });
});


router.post('/register', passport.authenticate('signup', { session: false }), async (req, res, next) => {
  res.json({
    message: 'Signup successful',
    user: req.user
  });
});

router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error('An Error occurred')
        return next(error);
      }
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error)
        const body = { _id: user._id, email: user.email };
        const token = jwt.sign({ user: body }, 'top_secret');
        return res.json({
          message: 'Signin successful',
          user: req.user,
          token
        });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

module.exports = router;