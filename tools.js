module.exports = {
	getNation: function (res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM wot_nation", function(err, result, fields){
            if(err){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.nation  = result;
            complete();
        });
    },
    getFaction: function (res, mysql, context, complete){
        mysql.pool.query("SELECT id, name FROM wot_faction", function(err, result, fields){
            if(err){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.faction  = result;
            complete();
        });
    },
    getPerson: function (res, mysql, context, id, complete){
        mysql.pool.query("SELECT id, fname, lname, age, homeland, allegiance FROM wot_people WHERE id = ?", [id], function(err, result, fields){
            if(err){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.person  = result[0];
            complete();
        });
    },
    getOneFaction: function (res, mysql, context, id, complete){
        mysql.pool.query("SELECT id, name, leader, headquarters FROM wot_faction WHERE id = ?", [id], function(err, result, fields){
            if(err){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.oneFaction  = result[0];
            complete();
        });
    },
    getOneNation: function (res, mysql, context, id, complete){
        mysql.pool.query("SELECT id, name, capital, ruler, population FROM wot_nation WHERE id = ?", [id], function(err, result, fields){
            if(err){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.oneNation  = result[0];
            complete();
        });
    },

    getPeople: function (res, mysql, context, complete){
        mysql.pool.query("SELECT id, fname, lname FROM wot_people", function(err, result, fields){
            if(err){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people  = result;
            complete();
        });
    },
    getAbilities: function (res, mysql, context, complete){
        mysql.pool.query("SELECT id, title FROM wot_abilities", function(err, result, fields){
            if(err){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.abilities  = result;
            complete();
        });
    },


};