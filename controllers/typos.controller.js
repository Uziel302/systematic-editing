const knex = require("../dbConnection");
const tableName = "suspects";
const rp = require("request-promise");
const oauthFetchJson = require("oauth-fetch-json");
const FIXED_STATUS = 1;
const DISMISSED = 2;
const SKIPPED = 3;
const NOT_FOUND_STATUS = 4;
const SERVED_STATUS = 5;
const DISMISSED_FOREIGN = 6;
const DISMISSED_NAME = 7;
const DISMISSED_ONLY_HERE = 8;
const delimiter = '[\\s\\-{}\\[,.\\";\\^~#\\=&\\)\\|<>\\?]';

exports.getTypos = async (req, res) => {
  knex(tableName)
    .where({status: 0, project: req.body.project})
    .limit(3)
    .then(async (data) => {
      let filterData = [];
      for (let datum of data) {
        let text = await this.getOrigModifiedArticle(datum, true);
        if (typeof text.articleText === "string") {
          datum = this.addContext(datum, text.articleText);
          filterData.push(datum);
          knex(tableName)
            .update({ status: SERVED_STATUS, fixer: "system" })
            .where({ id: datum.id })
            .then((u) => {})
            .catch((e) => {});
        } else {
          knex(tableName)
            .update({ status: NOT_FOUND_STATUS, fixer: "system" })
            .where({ id: datum.id })
            .then((u) => {})
            .catch((e) => {});
        }
      }
      res.status(200).json(filterData);
    });
};

exports.getStats = async (req, res) => {
  knex(tableName)
  .select('status', knex.raw('COUNT(*) as count'))
  .where({project: req.body.project})
  .groupBy('status')
  .then((data) => {
    res.status(200).json(data);
  })
  .catch((e) => {});
}

exports.replaceTypo = async (req, res) => {
  const session = this.getSession(req);
  if (!session.displayName) {
    return res.status(400).send(session.error);
  }
  let token = await this.getCSRF(req, session);
  if (!token.query) {
    return res.status(400).send("failed getting token, please login again");
  }
  token = token.query.tokens.csrftoken;

  const text = await this.getOrigModifiedArticle(req.body, false);
  if (typeof text.newArticleText !== "string") {
    return res.status(400).send("failed finding typo in article");
  }

  const params = {
    action: "edit",
    format: "json",
    formatversion: 2,
    minor: 1,
    title: req.body.title,
    summary:
      req.body.suspect +
      "→" +
      req.body.correction +
      " - [[:en:Wikipedia:Correct typos in one click|Correct typos in one click]]",
    text: text.newArticleText,
    token,
    watchlist: "nochange",
  };
  let result = await this.edit(req, session, params);
  if (result.error) {
    return res.status(400).json(result.error);
  }
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
  const session = this.getSession(req);
  if (!session.displayName) {
    return res.status(400).send(session.error);
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

exports.getArticleText = async (typo) => {
  const options = {
    methode: "GET",
    uri:
      "https://" +
      typo.project +
      ".org/w/api.php?action=query&prop=revisions&titles=" +
      encodeURI(typo.title) +
      "&rvslots=*&rvprop=content&formatversion=2&format=json",
  };

  return rp(options)
    .then((data) => {
      if (!JSON.parse(data).query.pages[0].revisions[0].slots.main.content) {
        return false;
      } else {
        return JSON.parse(data).query.pages[0].revisions[0].slots.main.content;
      }
    })
    .catch(function (err) {
      return false;
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

exports.getSession = (req) => {
  let session = req.session?.user;

  if (!session) {
    return { error: "failed getting login session, try logging again" };
  }

  return session;
};

exports.checkSession = (req, res) => {
  let session = this.getSession(req);
  if (session.displayName) {
    return res.status(200).send({ username: session.displayName });
  }

  return res.status(400).send(session);
};

exports.clearSession = (req, res) => {
  req.logout();
  return res.status(200).send({ success: true });
};

exports.getOrigModifiedArticle = async (typo, fromDB) => {
  let articleText = await this.getArticleText(typo);
  if (typeof articleText !== "string") {
    return { error: "could not get article" };
  }

  let oldcontext = typo.origFullContext;
  let newcontext = typo.fullContext;

  //no context yet
  if(fromDB){
    oldcontext = new RegExp(delimiter+typo.suspect+delimiter);
    newcontext = typo.correction;
  }
  if (newcontext === oldcontext) {
    return { error: "context block was not changed" };
  }
  const newArticleText = articleText.replace(oldcontext,newcontext);
  if (newArticleText === articleText) {
    return { error: "Could not find original context block in article" };
  }
  return { articleText, newArticleText };
};

exports.addContext = (typo, text) => {
  let regex = new RegExp(" .{1,120}"+delimiter+"(?=" + typo.suspect +delimiter+")", "s");
  typo.contextBefore = text.match(regex) ? text.match(regex)[0] : "";

  regex = new RegExp("(?<="+delimiter + typo.suspect + ")"+delimiter+".{1,300} ", "s");
  typo.contextAfter = text.match(regex) ? text.match(regex)[0] : "";

  typo.origFullContext = typo.contextBefore + typo.suspect + typo.contextAfter;
  return typo;
};
