const crendentials = require('./credential.json');

module.exports = require("knex")({
  client: "mysql",
  connection: {
    host: crendentials.db_host,
    user: crendentials.db_user,
    password: crendentials.db_password,
    database: crendentials.db_name,
  },
  pool: { min: 0, max: 10 },
  acquireConnectionTimeout: 10000,
});
