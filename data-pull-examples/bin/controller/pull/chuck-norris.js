var dataPull = require('/lib/openxp/data-pull');

/**
 *
 * Get the latest Chuck Norris Jokes from https://api.chucknorris.io
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
				url: 'https://api.chucknorris.io/jokes/search?query=music',
				method: 'GET'
			},
			response: {
				// where in the request result json is data to be saved. if nested use dot. example. response.data.result
				dataPath: 'result'
				// request response editor. example editor same result as the dataPath
				// editor: function(requestResult, dataPullConfig) {
				// 	log.info('pull.response.editor %s', JSON.stringify(requestResult));

				// 	return requestResult.result;
				// }
			}
		},
		store: {
			node: {
				// The field in the response that is used as unique name in the node in the repo
				// If no nameField is added you will get duplicates when config is run again with a new name and path id
				nameField: 'id'
			},
			repo: {
				// Same config as xp-node connect
				connect: {
					repoId: 'chucknorris',
					branch: 'master'
				},
				// Same config as xp-repo create
				create: {
					id: 'chucknorris'
				}
			}
		}
	};

	// Do config and ge tthe result
	var result = dataPull.pullDataByConfig(config);

	return {
		status: 201,
		body: result,
		contentType: 'application/json'
	};
};
