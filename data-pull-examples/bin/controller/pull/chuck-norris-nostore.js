var dataPull = require('/lib/openxp/data-pull');

/**
 *
 * Get the latest Chuck Norris Jokes from https://api.chucknorris.io
 *
 * Use a response editor to change the response from a PULL request
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
				//request response editor.
				editor: function(requestResult, dataPullConfig) {
					log.info('pull.response.editor %s', JSON.stringify(requestResult));

					return requestResult.result;
				},
				dataSlice: {
					limit: 5,
					start: 0
				}
			}
		},
		// Do something with the result response from before returning it.
		result: {
			editor: function(response) {
				log.info('Result response editor do something with the response here or just return it');

				var result = {
					title: 'Chuck Norris Facts Rocks...',
					data: response.result.store
				};

				return result;
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
