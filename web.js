const express = require('express');
const bodyParser = require('body-parser');
const packageInfo = require('./package.json');
const routes = require('./routes/routes')

const app = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.json({ version: packageInfo.version });
});

// Start the server
// const server = app.listen(port, (error) => {
//   if (error) return console.log(`Error: ${error}`);
//   console.log(`Server listening on port ${server.address().port}`);
// });

var server = app.listen(process.env.PORT, "0.0.0.0", () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Web server started at http://%s:%s', host, port);
});

// Use Node.js body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

routes(app);

module.exports = (bot) => {
  app.post('/' + bot.token, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
};
