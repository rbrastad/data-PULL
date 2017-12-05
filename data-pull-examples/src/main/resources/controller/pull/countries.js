var dataPull = require('/lib/openxp/data-pull');

/**
 *
 * Get countries from https://github.com/fayder/restcountries
 *
 * @param req
 * @returns {{status: number, body, contentType: string}}
 */

exports.run = function(req) {
	var config = {
		// Where to pull data from the response should be in JSON.
		pull: {
			// Same config as http-client request
			request: {
				url: 'https://restcountries.eu/rest/v2/all',
				method: 'GET'
			}
		},
		store: {
			node: {
				// The field in the response that is used as unique name in the node in the repo
				// If no nameField is added you will get duplicates when config is run again with new name and path ids
				nameField: 'name'
			},
			repo: {
				// Same config as xp-node connect
				connect: {
					repoId: 'countries',
					branch: 'master'
				},
				// Same config as xp-repo create
				create: {
					id: 'countries'
				}
			}
		}
	};

	// Do config and get the result
	var result = dataPull.pullDataByConfig(config);

	return {
		status: 201,
		body: result,
		contentType: 'application/json'
	};
};
