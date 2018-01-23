var options = {

};

var pgp = require("pg-promise")(options);

var connection = {
    host: 'localhost',
    port: 5432,
    database: 'geister',
    user: 'user',
    password: 'password'
};

var db = pgp(connection);

module.exports = db;
