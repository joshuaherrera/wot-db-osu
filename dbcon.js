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
