const knex = require("../dbConnection");
const tableName = "suspects";
const rp = require("request-promise");
const mwApiToken = require("../mwApiToken");

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
  let newcontext = oldcontext.replace(new RegExp(this.escapeRegex(req.body.suspect) + "$"), req.body.correction);
  if(newcontext===oldcontext){
    res.status(400).send('word not found in context line');
  }
  const startBreak = req.body.contextBefore.match(/^[a-z]/i) ? "\\b" : "";
	const newArticleText = articleText.replace(new RegExp(startBreak + this.escapeRegex(req.body.contextBefore) + "\\b"), newcontext);
	if(newArticleText===articleText){
    res.status(400).send('Could not find suspect word in article'); 
  }
  const params = {
    action: "edit",
    minor: 1,
    title: req.body.title,
    summary:
      req.body.suspect +
      "->" +
      req.body.correction +
      " - [[Wikipedia:Correct typos in one click|Correct typos in one click]]",
    text: newArticleText,
    watchlist: "nochange",
  };

  let session = {};
  let sessions = req.sessionStore.sessions;

  for(let oneSession in sessions){
    if(JSON.parse(sessions[oneSession]).passport.user){
      session.oauth = JSON.parse(sessions[oneSession]).passport.user.oauth;
    }
  }
  mwApiToken( 'csrf', 'en', params, 'wikipedia', { method: 'POST' }, session )
  .then( function ( data ) {
    console.log(data);
  });
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
      "https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles="+req.body.title+"&rvslots=*&rvprop=content&formatversion=2&format=json",
  };

  return rp(options)
    .then(data=>{
      if(!JSON.parse(data).query.pages[0].revisions[0].slots.main.content){
        return res.status(400).send('could not get article');
      } else {
        return req.body.articleText = JSON.parse(data).query.pages[0].revisions[0].slots.main.content;
      }
    });
}

exports.escapeRegex = (str) => {
  return str.replace( /([\\{}()|.?*+\-^$\[\]])/g, '\\$1' );
}