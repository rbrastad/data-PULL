var dataPull = require('/lib/openxp/data-pull');

/**
 *
 * Get countries using a simple config.
 *
 * @param req
 * @returns {{status: number, body, contentType: string}}
 */

exports.run = function(req) {
	var url = 'https://restcountries.eu/rest/v2/all';
	var repo = 'countries-template';
	var storeNodeName = 'name';

	var config = {
		pullUrl: url,
		storeRepo: repo,
		storeNodeName: storeNodeName
	};

	// Do config and get the result
	var result = dataPull.pullData(config);

	return {
		status: 201,
		body: result,
		contentType: 'application/json'
	};
};
