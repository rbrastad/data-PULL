var dataPull = require('/lib/openxp/data-pull');

/**
 *
 * Get countries from https://github.com/fayder/restcountries
 *
 * @param req
 * @returns {{status: number, body, contentType: string}}
 */
exports.run = function(req) {
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
		nodeData.xEditor = 'CUSTOM EDITOR ';

		return nodeData;
	};

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
				nameField: 'name',
				_parentPath: 'mypath',
				// Editor for customizing data when creating or modifying a node.
				// nodeData is current data saved in the repo.
				// pullData is the data to be saved
				editor: editor,
				_indexConfig: {
					default: {
						decideByType: true,
						enabled: true,
						nGram: true,
						fulltext: true,
						includeInAllText: true,
						indexValueProcessors: []
					}
				},
				_permissions: [
					{
						principal: 'role:admin',
						allow: [
							'READ',
							'CREATE',
							'MODIFY',
							'DELETE',
							'PUBLISH',
							'READ_PERMISSIONS',
							'WRITE_PERMISSIONS'
						],
						deny: []
					}
				]
			},
			repo: {
				// Same config as xp-node connect
				connect: {
					repoId: 'countries-custom',
					branch: 'custom-branch'
				},
				// Same config as xp-repo create
				create: {
					id: 'countries-custom'
				},
				// Same config as xp-repo createBranch
				createBranch: {
					branchId: 'custom-branch',
					repoId: 'countries-custom'
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
