const knex = require("../dbConnection");
const tableName = "suspects";
const rp = require("request-promise");
const oauthFetchJson = require("oauth-fetch-json");
const FIXED_STATUS = 1;

exports.getTypos = async (req, res) => {
  knex(tableName)
    .where("status", 0)
    .limit(10)
    .then((data) => {
      res.status(200).json(data);
    });
};

exports.replaceTypo = async (req, res) => {
  let articleText = await this.getArticleText(req, res);
  if (typeof articleText !== "string") {
    return res.status(400).send("could not get article");
  }
  let oldcontext = req.body.contextBefore;
  let newcontext = oldcontext.replace(
    new RegExp(this.escapeRegex(req.body.suspect) + "$"),
    req.body.correction
  );
  if (newcontext === oldcontext) {
    return res.status(400).send("word not found in context line");
  }
  const startBreak = req.body.contextBefore.match(/^[a-z]/i) ? "\\b" : "";
  const newArticleText = articleText.replace(
    new RegExp(startBreak + this.escapeRegex(req.body.contextBefore) + "\\b"),
    newcontext
  );
  if (newArticleText === articleText) {
    return res.status(400).send("Could not find suspect word in article");
  }

  const session = this.getSession(req, res);
  if (!session.displayName) {
    return;
  }
  let token = await this.getCSRF(req, session);
  if (!token.query) {
    return res.status(400).send("failed getting token, please login again");
  }
  token = token.query.tokens.csrftoken;
  const params = {
    action: "edit",
    format: "json",
    formatversion: 2,
    minor: 1,
    title: req.body.title,
    summary:
      req.body.suspect +
      "->" +
      req.body.correction +
      " - [[Wikipedia:Correct typos in one click|Correct typos in one click]]",
    text: newArticleText,
    token,
    watchlist: "nochange",
  };
  let result = await this.edit(req, session, params);
  if (result.edit.result === "Success") {
    res.status(200).json({
      result,
    });
    knex(tableName)
      .update({ status: FIXED_STATUS, fixer: session.displayName })
      .where({ id: req.body.id })
      .then((u) => {})
      .catch((e) => {});
  }
};

exports.dismissTypo = async (req, res) => {
  const session = this.getSession(req, res);
  if (!session.displayName) {
    return;
  }
  res.status(200).json({
    success: true,
  });
  knex(tableName)
    .update({ status: req.body.status, fixer: session.displayName })
    .where({ id: req.body.id })
    .then((u) => {})
    .catch((e) => {});
};

exports.getViews = async (req, res) => {
  const options = {
    methode: "GET",
    uri:
      "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/" +
      req.body.project +
      "/all-access/user/" +
      encodeURI(req.body.title) +
      "/daily/2022082700/2022082800",
    json: true,
  };

  rp(options)
    .then(function (parseBody) {
      var data = [];
      for (i = 0; i < parseBody.items.length; i++) {
        data.push([parseBody.items[i].timestamp, parseBody.items[i].views]);
      }

      res.status(200).json({ data });
    })
    .catch(function (err) {
      console.log("error: " + err);
    });
};

exports.getArticleText = async (req, res) => {
  const options = {
    methode: "GET",
    uri:
      "https://" +
      req.body.project +
      ".org/w/api.php?action=query&prop=revisions&titles=" +
      encodeURI(req.body.title) +
      "&rvslots=*&rvprop=content&formatversion=2&format=json",
  };

  return rp(options)
    .then((data) => {
      if (!JSON.parse(data).query.pages[0].revisions[0].slots.main.content) {
        return res.status(400).send("could not get article");
      } else {
        return JSON.parse(data).query.pages[0].revisions[0].slots.main.content;
      }
    })
    .catch(function (err) {
      return err;
    });
};

exports.escapeRegex = (str) => {
  return str.replace(/([\\{}()|.?*+\-^$\[\]])/g, "\\$1");
};

exports.getCSRF = async (req, session) => {
  const url = "https://" + req.body.project + ".org/w/api.php";
  const params = {
    action: "query",
    format: "json",
    formatversion: 2,
    meta: "tokens",
    type: "csrf",
  };

  return oauthFetchJson(url, params, null, session);
};

exports.edit = async (req, session, params) => {
  const url = "https://" + req.body.project + ".org/w/api.php";
  return oauthFetchJson(url, params, { method: "POST" }, session);
};

exports.getSession = (req, res) => {
  let session = null;
  let sessions = req.sessionStore.sessions;

  for (let oneSession in sessions) {
    let user = JSON.parse(sessions[oneSession])?.passport?.user;
    if (user) {
      session = user.oauth;
      session.displayName = user.displayName;
    }
  }

  if (!session) {
    return res
      .status(400)
      .send("failed getting login session, try logging again");
  }

  return session;
};
