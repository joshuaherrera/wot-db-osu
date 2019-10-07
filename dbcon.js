//enter password
const keys = require('./config/keys');
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 10,
	host: keys.dbHost,
	user: keys.dbUser,
	password: keys.dbPass,
	database: keys.dbName
});

module.exports.pool = pool;

/*
mysql://b081a5f3b2decb:c6a11494@us-cdbr-iron-east-05.cleardb.net/heroku_fcb6eb45bf525fa?reconnect=true
*/
