var dataPull = require('/lib/openxp/data-pull');

/**
 *
 * Get the countries
 *
 * @param req
 * @returns {{status: number, body, contentType: string}}
 */

exports.run = function(req) {
	var url = 'https://restcountries.eu/rest/v2/all';
	var repo = 'countries-template-custom';
	var storeNodeName = 'name';

	// Editor for customizing data when creating or modifying a node.
	// nodeData is current data saved in the repo.
	// pullData is the data to be saved
	var editor = function(nodeData, pullData) {
		// We don't care about old data
		nodeData = {};

		nodeData.name = pullData.name;
		nodeData.topLevelDomain = pullData.topLevelDomain;
		nodeData.alpha2Code = pullData.alpha2Code;
		nodeData.alpha3Code = pullData.alpha3Code;
		nodeData.callingCodes = pullData.callingCodes;
		nodeData.capital = pullData.capital;

		nodeData.xDate = new Date();
		nodeData.xEditor = 'CUSTOM';

		return nodeData;
	};

	var config = {
		pullUrl: url,
		storeRepo: repo,
		storeNodeName: storeNodeName,
		storeNodeEditor: editor
	};
	// Get the template
	var config = dataPull.getConfig(config);

	// Do config and get the result
	var result = dataPull.pullDataByConfig(config);
	return {
		status: 201,
		body: result,
		contentType: 'application/json'
	};
};
