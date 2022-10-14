const crendentials = require('./credential.json');

module.exports = require("knex")({
  client: "mysql",
  connection: {
    host: "localhost",
    user: crendentials.db_user,
    password: crendentials.db_password,
    database: "variations",
  },
  pool: { min: 0, max: 10 },
  acquireConnectionTimeout: 10000,
});
