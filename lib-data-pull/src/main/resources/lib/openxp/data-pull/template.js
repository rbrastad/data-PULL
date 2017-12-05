/**
 *
 * @param {
 *      pullUrl : url,
 *       storeRepo : repo
 *   });
 * @returns {*}
 */

exports.getTemplate = function(configJson) {
	var template = getTemplate();

	setPullUrlValue(template, configJson);
	setStoreRepoValue(template, configJson);
	setStoreNodeNameFieldValue(template, configJson);
	setStoreNodeEditorValue(template, configJson);
	setStoreRepoBranch(template, configJson);

	return template;
};

function setPullUrlValue(template, configJson) {
	if (configJson.hasOwnProperty('pullUrl')) template.pull.request.url = configJson.pullUrl;

	return template;
}

function setStoreRepoBranch(template, configJson) {
	if (configJson.hasOwnProperty('storeRepoBranch')) {
		template.store.repo.connect.branch = configJson.storeRepoBranch;
	}

	return template;
}

function setStoreRepoValue(template, configJson) {
	if (configJson.hasOwnProperty('storeRepo')) {
		template.store.repo.connect.repoId = configJson.storeRepo;
		template.store.repo.create.id = configJson.storeRepo;
	}

	return template;
}

function setStoreNodeNameFieldValue(template, configJson) {
	if (configJson.hasOwnProperty('storeNodeName')) {
		template.store.node.nameField = configJson.storeNodeName;
	}

	return template;
}

function setStoreNodeEditorValue(template, configJson) {
	if (configJson.hasOwnProperty('storeNodeEditor')) {
		template.store.node.editor = configJson.storeNodeEditor;
	}

	return template;
}

function getTemplate() {
	return {
		// Where to pull data from the response should be in JSON.
		pull: {
			// Same config as http-client request
			request: {
				url: '',
				method: 'GET'
			}
		},
		store: {
			node: {
				// The field in the response that is used as unique name in the node in the repo
				// If no nameField is added you will get duplicates when config is run again with new name and path ids
			},
			repo: {
				// Same config as xp-node connect
				repoId: '',
				branch: 'master'
			},
			// Same config as xp-repo create
			create: {
				id: ''
			}
		}
	};
}
