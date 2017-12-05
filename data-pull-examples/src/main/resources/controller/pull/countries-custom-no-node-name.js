var dataPull = require('/lib/openxp/data-pull');

/**
 * Set node name in the editor
 *
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
		nodeData.xEditor = 'CUSTOM';

		var node = {
			data: nodeData,
			_parentPath: '/',

			// Set a custom nodename from the editor
			_name: nodeData.name + '_custom'
		};

		return node;
	};

	var config = {
		// Where to pull data from the response should be in JSON.
		pull: {
			// Same config as http-client request: http://repo.enonic.com/public/com/enonic/xp/docs/6.9.3/docs-6.9.3-libdoc.zip!/module-lib_xp_http-client.html#.request
			request: {
				url: 'https://restcountries.eu/rest/v2/all',
				method: 'GET'
			}
		},
		store: {
			node: {
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
					repoId: 'countries-custom-no-node-name',
					branch: 'custom-branch'
				},
				// Same config as xp-repo create
				create: {
					id: 'countries-custom-no-node-name'
				},
				// Same config as xp-repo createBranch
				createBranch: {
					branchId: 'custom-branch',
					repoId: 'countries-custom-no-node-name'
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
