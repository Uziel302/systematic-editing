"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, callback) {
  db.createTable(
    "suspects",
    {
      id: {
        type: "int",
        primaryKey: true,
        autoIncrement: true,
      },
      project: {
        type: "string",
        length: 40,
      },
      title: {
        type: "string",
        length: 200,
      },
      suspect: {
        type: "string",
        length: 100,
      },
      correction: {
        type: "string",
        length: 100,
      },
      type: {
        type: "string",
        length: 30,
      },
      location: {
        type: "int",
      },
      status: {
        type: "int",
      },
      fixer: {
        type: "string",
        length: 30,
      },
    },
    function (err) {
      if (err) return callback(err);
      return callback();
    }
  );
};

exports.down = function (db, callback) {
  db.dropTable("suspects", callback);
};

exports._meta = {
  version: 1,
};
