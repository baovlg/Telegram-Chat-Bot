require("dotenv").config();

var bot = require('./config/bot');
require('./app/web')(bot);