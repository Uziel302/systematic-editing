const oauthFetchJson = require('oauth-fetch-json');

function flatten( pages ) {
	pages.forEach( function ( page ) {
		if ( page.terms && page.terms.description ) {
			page.description = page.terms.description[ 0 ] || '';
			delete page.terms;
		}
		if ( page.coordinates ) {
			page.coordinates = page.coordinates[ 0 ];
		}
	} );
	return pages;
}

module.exports = function ( langOrLanguageProject, params, projectOrOptions, optionsOrSession, session ) {
	var url, fullParams, project, options, s, baseHost,
		baseParams = {
			action: 'query',
			format: 'json',
			formatversion: 2
		};
		url = 'https://en.wikipedia.org/w/api.php';
		options = optionsOrSession;

	fullParams = Object.assign( {}, baseParams, params );

	return oauthFetchJson( url, fullParams, options, session ? session.oauth : null ).then( function ( json ) {
		if ( json.error ) {
			throw new Error( json.error.code + ': ' + json.error.info );
		} else if ( json.query && json.query.pages ) {
			return { pages: flatten( json.query.pages ),
				'continue': json.continue,
				redirects: json.query.redirects };
		} else if ( params.meta ) {
			return json.query[ params.meta ];
		} else {
			return json;
		}
	} );
}
