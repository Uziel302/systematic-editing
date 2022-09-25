const knex = require("../dbConnection");
const tableName = "suspects";
const rp = require("request-promise");
const oauthFetchJson = require("oauth-fetch-json");

exports.getTypos = async (req, res) => {
  knex(tableName)
    .first()
    .then((suspect) => {
      res.status(200).json({
        suspect,
      });
    });
};

exports.replaceTypo = async (req, res) => {
  let articleText = await this.getArticleText(req, res);
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

  let session = {};
  let sessions = req.sessionStore.sessions;

  for (let oneSession in sessions) {
    if (JSON.parse(sessions[oneSession]).passport.user) {
      session = JSON.parse(sessions[oneSession]).passport.user.oauth;
    }
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
    title: "User:Uziel302", //req.body.title,
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
  if (result.success) {
    res.status(200).json({
      suspect,
    });
  }
};

exports.getViews = async (req, res) => {
  const options = {
    methode: "GET",
    uri:
      "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/" +
      req.body.title +
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
      req.body.title +
      "&rvslots=*&rvprop=content&formatversion=2&format=json",
  };

  return rp(options).then((data) => {
    if (!JSON.parse(data).query.pages[0].revisions[0].slots.main.content) {
      return res.status(400).send("could not get article");
    } else {
      return (req.body.articleText =
        JSON.parse(data).query.pages[0].revisions[0].slots.main.content);
    }
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
