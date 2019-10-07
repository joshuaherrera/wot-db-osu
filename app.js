/*
** SQL For many to many display 
**
SELECT wp.fname AS fname, wp.lname AS lname, wa.title AS title FROM `wot_people_abilities` wpa
INNER JOIN `wot_people` wp
ON wpa.pid = wp.id 
INNER JOIN wot_abilities wa
ON wpa.aid = wa.id
ORDER BY wp.id
**
*/

var express = require('express');
//use mysql.pool to make queries
var mysql = require('./dbcon.js');
var tools = require('./tools.js');
var bodyParser = require('body-parser');
var app = express();
var handlebars = require('express-handlebars').create({
	defaultLayout: 'main'
});

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
//app.set('port', 38864);

/*Renders home page with links*/
app.get('/', function(req, res, next) {
	var context = {};
	res.render('home', context);
});
/*************************People****************************************************************************************************************************/
//renders the people page with a table using mysql to get appropriate table data
//**utilizes complete function from example code by Professor Wolford

app.get('/people', function(req, res, next) {
	var context = {};
	var callbackCount = 0;
	context.scripts = ['deletion.js'];
	//stores Faction in context.Faction
	tools.getNation(res, mysql, context, complete);
	tools.getFaction(res, mysql, context, complete);
	mysql.pool.query(
		'SELECT wp.id AS wp_id, wp.fname AS wp_fname, wp.lname AS wp_lname, wp.age AS wp_age, wn.name AS wn_homeland, wf.name AS wf_faction FROM wot_people wp INNER JOIN wot_nation wn ON wp.homeland=wn.id LEFT JOIN wot_faction wf ON wp.allegiance=wf.id ORDER BY wp.id',
		function(err, rows, fields) {
			if (err) {
				next(err);
				return;
			}
			context.table = rows;
			complete();
		}
	);
	function complete() {
		callbackCount++;
		if (callbackCount >= 3) {
			res.render('people', context);
		}
	}
});
//make helper function to get a single person
app.get('/people/:id', function(req, res, next) {
	var context = {};
	var callbackCount = 0;
	//make a script selecting the nation and allegiance
	context.scripts = ['update.js', 'selectors.js'];
	//select a single person
	tools.getNation(res, mysql, context, complete);
	tools.getFaction(res, mysql, context, complete);
	tools.getPerson(res, mysql, context, req.params.id, complete);
	function complete() {
		callbackCount++;
		if (callbackCount >= 3) {
			res.render('updatePerson', context);
		}
	}
});

//need to use a query to get the Faction and Faction a user can choose; just need an id and name
app.post('/people', function(req, res, next) {
	var context = {};
	//get the available Faction
	mysql.pool.query(
		'INSERT INTO wot_people (`fname`, `lname`, `age`, `homeland`, `allegiance`) VALUES (?, ?, ?, ?, ?)',
		[
			req.body.fname,
			req.body.lname,
			req.body.age,
			req.body.homeland,
			req.body.allegiance
		],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			res.redirect('/people');
		}
	);
});

app.delete('/people/:id', function(req, res, next) {
	mysql.pool.query(
		'DELETE FROM wot_people WHERE id=?',
		[req.params.id],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			//returns a success code to our deletion helper function to reload the page
			res.status(202).end();
		}
	);
});

app.post('/people/:id', function(req, res, next) {
	mysql.pool.query(
		'UPDATE wot_people SET fname=?, lname=?, age=?, homeland=?, allegiance=? WHERE id=?',
		[
			req.body.fname,
			req.body.lname,
			req.body.age,
			req.body.homeland,
			req.body.allegiance,
			req.params.id
		],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			//returns a success code to our update helper function to reload the page
			res.status(200);
			res.end();
		}
	);
});

/********************************Abilities*********************************************************************************************************************/
/*renders the abilities page with a table using mysql to get appropriate table data
 **utilizes complete function from example code by Professor Wolford
 */
//make a handlebars page to display the simple table
app.get('/abilities', function(req, res, next) {
	var context = {};
	var callbackCount = 0;
	context.scripts = ['deletion.js'];
	//stores Faction in context.Faction
	//tools.getNation(res, mysql, context, complete);
	//tools.getFaction(res, mysql, context, complete);
	mysql.pool.query(
		'SELECT wa.id AS wa_id, wa.title AS wa_title FROM wot_abilities wa ORDER BY wa.id',
		function(err, rows, fields) {
			if (err) {
				next(err);
				return;
			}
			context.abilities = rows;
			complete();
		}
	);
	function complete() {
		callbackCount++;
		if (callbackCount >= 1) {
			res.render('abilities', context);
		}
	}
});

//need to use a query to get the Faction and Faction a user can choose; just need an id and name
app.post('/abilities', function(req, res, next) {
	var context = {};
	//get the available Faction
	mysql.pool.query(
		'INSERT INTO wot_abilities (`title`) VALUES (?)',
		[req.body.title],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			res.redirect('/abilities');
		}
	);
});

app.delete('/abilities/:id', function(req, res, next) {
	mysql.pool.query(
		'DELETE FROM wot_abilities WHERE id=?',
		[req.params.id],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			//returns a success code to our deletion helper function to reload the page
			res.status(202).end();
		}
	);
});
/***********************************************************************************************************************************/
/*************************Factions****************************************************************************************************************************/
/*renders the people page with a table using mysql to get appropriate table data
 **utilizes complete function from example code by Professor Wolford
 */

app.get('/factions', function(req, res, next) {
	var context = {};
	var callbackCount = 0;
	context.scripts = ['deletion.js'];
	//need nation and people to display faction ruler and headquarters
	tools.getNation(res, mysql, context, complete);
	tools.getPeople(res, mysql, context, complete);
	mysql.pool.query(
		'SELECT wf.id AS wf_id, wf.name AS wf_name, wp.fname AS wp_leader_fname, wp.lname AS wp_leader_lname, wn.name AS wn_headquarters FROM wot_faction wf INNER JOIN wot_people wp ON wf.leader=wp.id INNER JOIN wot_nation wn ON wf.headquarters=wn.id ORDER BY wf.id',
		function(err, rows, fields) {
			if (err) {
				next(err);
				return;
			}
			context.faction = rows;
			complete();
		}
	);
	function complete() {
		callbackCount++;
		if (callbackCount >= 3) {
			res.render('factions', context);
		}
	}
});

//make helper function to get a single person
app.get('/factions/:id', function(req, res, next) {
	var context = {};
	var callbackCount = 0;
	//make a script selecting the nation and allegiance
	context.scripts = ['update.js', 'selectors.js'];
	//select a single person
	tools.getNation(res, mysql, context, complete);
	tools.getPeople(res, mysql, context, complete);
	tools.getOneFaction(res, mysql, context, req.params.id, complete);
	function complete() {
		callbackCount++;
		if (callbackCount >= 3) {
			res.render('updateFaction', context);
		}
	}
});

//need to use a query to get the Faction and Faction a user can choose; just need an id and name
app.post('/factions', function(req, res, next) {
	var context = {};
	//get the available Faction
	mysql.pool.query(
		'INSERT INTO wot_faction (`name`, `leader`, `headquarters`) VALUES (?, ?, ?)',
		[req.body.name, req.body.leader, req.body.headquarters],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			res.redirect('/factions');
		}
	);
});

app.delete('/factions/:id', function(req, res, next) {
	mysql.pool.query(
		'DELETE FROM wot_faction WHERE id=?',
		[req.params.id],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			//returns a success code to our deletion helper function to reload the page
			res.status(202).end();
		}
	);
});

app.post('/factions/:id', function(req, res, next) {
	mysql.pool.query(
		'UPDATE wot_faction SET name=?, leader=?, headquarters=? WHERE id=?',
		[req.body.name, req.body.leader, req.body.headquarters, req.params.id],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			//returns a success code to our update helper function to reload the page
			res.status(200);
			res.end();
		}
	);
});
/*****************************************************************************************************************************************************/
/*************************Nations****************************************************************************************************************************/
/*renders the people page with a table using mysql to get appropriate table data
 **utilizes complete function from example code by Professor Wolford
 */

app.get('/nations', function(req, res, next) {
	var context = {};
	var callbackCount = 0;
	context.scripts = ['deletion.js'];
	//need nation and people to display faction ruler and headquarters
	tools.getPeople(res, mysql, context, complete);
	mysql.pool.query(
		'SELECT wn.id AS wn_id, wn.name AS wn_name, wn.capital AS wn_capital, wp.fname AS wp_ruler_fname, wp.lname AS wp_ruler_lname, wn.population AS wn_population FROM wot_nation wn INNER JOIN wot_people wp ON wn.ruler=wp.id ORDER BY wn.id',
		function(err, rows, fields) {
			if (err) {
				next(err);
				return;
			}
			context.nation = rows;
			complete();
		}
	);
	function complete() {
		callbackCount++;
		if (callbackCount >= 2) {
			res.render('nations', context);
		}
	}
});

//make helper function to get a single person
app.get('/nations/:id', function(req, res, next) {
	var context = {};
	var callbackCount = 0;
	//make a script selecting the nation and allegiance
	context.scripts = ['update.js', 'selectors.js'];
	//select a single nation
	tools.getPeople(res, mysql, context, complete);
	tools.getOneNation(res, mysql, context, req.params.id, complete);
	function complete() {
		callbackCount++;
		if (callbackCount >= 2) {
			res.render('updateNation', context);
		}
	}
});

//need to use a query to get the Faction and Faction a user can choose; just need an id and name
app.post('/nations', function(req, res, next) {
	var context = {};
	//get the available Faction
	mysql.pool.query(
		'INSERT INTO wot_nation (`name`, `capital`, `ruler`, `population`) VALUES (?, ?, ?, ?)',
		[req.body.name, req.body.capital, req.body.ruler, req.body.population],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			res.redirect('/nations');
		}
	);
});

app.delete('/nations/:id', function(req, res, next) {
	mysql.pool.query(
		'DELETE FROM wot_nation WHERE id=?',
		[req.params.id],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			//returns a success code to our deletion helper function to reload the page
			res.status(202).end();
		}
	);
});

app.post('/nations/:id', function(req, res, next) {
	mysql.pool.query(
		'UPDATE wot_nation SET name=?, capital=?, ruler=?, population=? WHERE id=?',
		[
			req.body.name,
			req.body.capital,
			req.body.ruler,
			req.body.population,
			req.params.id
		],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			//returns a success code to our update helper function to reload the page
			res.status(200);
			res.end();
		}
	);
});
/*****************************************************************************************************************************************************/
app.get('/people-abilities', function(req, res, next) {
	var context = {};
	var callbackCount = 0;
	context.scripts = ['deletion.js'];
	//need nation and people to display faction ruler and headquarters
	tools.getPeople(res, mysql, context, complete);
	tools.getAbilities(res, mysql, context, complete);
	mysql.pool.query(
		'SELECT wp.id AS wp_id, wa.id AS wa_id, wp.fname AS wp_fname, wp.lname AS wp_lname, wa.title AS wa_title FROM `wot_people_abilities` wpa INNER JOIN `wot_people` wp ON wpa.pid = wp.id INNER JOIN wot_abilities wa ON wpa.aid = wa.id ORDER BY wp.id',
		function(err, rows, fields) {
			if (err) {
				next(err);
				return;
			}
			context.peopleAbilities = rows;
			complete();
		}
	);
	function complete() {
		callbackCount++;
		if (callbackCount >= 3) {
			res.render('people-abilities', context);
		}
	}
});

//need to use a query to get the Faction and Faction a user can choose; just need an id and name
app.post('/people-abilities', function(req, res, next) {
	var context = {};
	//get the available Faction
	mysql.pool.query(
		'INSERT INTO wot_people_abilities (`pid`, `aid`) VALUES (?, ?)',
		[req.body.pid, req.body.aid],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			res.redirect('/people-abilities');
		}
	);
});
//USE pid and aid here since we are creating a url to utilize each id for deletion in the database
app.delete('/people-abilities/:pid/:aid', function(req, res, next) {
	console.log(req.params);
	mysql.pool.query(
		'DELETE FROM wot_people_abilities WHERE pid=? AND aid=?',
		[req.params.pid, req.params.aid],
		function(err, result) {
			if (err) {
				next(err);
				return;
			}
			//returns a success code to our deletion helper function to reload the page
			res.status(202).end();
		}
	);
});
/**********************************************************************************************************/
/******************************PA***************************************************************************/
/*app.post('/search',function(req,res,next){
  var context = {};
  var callbackCount = 0;
  context.scripts = ["deletion.js"];
  //need nation and people to display faction ruler and headquarters
  tools.getPeople(res, mysql, context, complete);
  tools.getAbilities(res, mysql, context, complete);
  tools.getFaction(res, mysql, context, complete);
  mysql.pool.query('SELECT wp.fname, wp.lname, wp.age, wp.homeland, wp.allegiance, wa.title FROM wot_people_abilities wpa INNER JOIN wot_people wp ON wpa.pid=wp.id INNER JOIN wot_abilities wa ON wpa.aid=wa.id INNER JOIN wot_nation wn ON wp.homeland=wn.id INNER JOIN wot_faction wf ON wp.allegiance=wf.id WHERE wp.fname=? AND wp.lname=?',[req.body.s_fname, req.body.s_lname], function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = rows;
    complete();
  });
  function complete(){
    callbackCount++;
    if(callbackCount >= 4){
      res.render('search', context);
    }
  }
});
*/
/**********************************************************************************************************/

app.use(function(req, res) {
	res.status(404);
	res.render('404');
});

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, function() {
	console.log(
		'Express started on http://localhost:' +
			PORT +
			'; press Ctrl-C to terminate.'
	);
});
