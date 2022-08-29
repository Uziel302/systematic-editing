const knex = require('../dbConnection');
const tableName = 'suspects';

exports.getTypos = async (req, res) => {
  knex(tableName)
    .first()
    .then((suspect) => {
      res.status(200).json({
        suspect
      });
    });
};
