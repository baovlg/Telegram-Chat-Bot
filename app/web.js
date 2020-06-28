const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const morgan = require('morgan');

const app = express();

var mongoose = require('mongoose');
var configDB = require('../config/database');

mongoose.connect(configDB.url, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);
mongoose.connection.on('error', error => console.log(error));
mongoose.Promise = global.Promise;

require('./auth/auth');

app.use(morgan('dev'));
app.use(bodyParser.json()); // Use Node.js body parsing middleware
app.use(bodyParser.urlencoded({
  extended: true,
}));
// app.use(bodyParser()); // lấy thông tin từ form HTML

const routes = require('./routes/routes.js');
const user_routes = require('./controllers/UserController');
const telegram_user_routes = require('./controllers/TelegramUserController');
const system_routes = require('./controllers/SystemController');

app.use('/', routes);
app.use('/users', passport.authenticate('jwt', { session: false }), user_routes);
app.use('/telegram-users', passport.authenticate('jwt', { session: false }), telegram_user_routes);
// app.use('/system-routes', passport.authenticate('jwt', { session: false }), system_routes);
// app.use('/telegram-users', telegram_user_routes);
app.use('/system-routes', system_routes);

//Handle errors
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = (bot) => {
  app.post('/' + bot.token, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
};

// Start the server
// const server = app.listen(port, (error) => {
//   if (error) return console.log(`Error: ${error}`);
//   console.log(`Server listening on port ${server.address().port}`);
// });
var local_address = process.env.LOCAL_ADDRESS;
if (process.env.NODE_ENV != 'stagging') {
  local_address = '0.0.0.0';
}
var server = app.listen(process.env.PORT || 8080, local_address, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Web server started at http://%s:%s', host, port);
});