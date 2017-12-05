var repo;
var dataPullConfig;

exports.setRepo = function(r) {
	repo = r;
};

exports.saveNode = function(dpConfig, pullData) {
	dataPullConfig = dpConfig;

	if (dataPullConfig.store.hasOwnProperty('node') && dataPullConfig.store.node.hasOwnProperty('nameField')) {
		var nodeId = '/' + getNodeName(dataPullConfig);

		var node = getNode(nodeId, dataPullConfig);
		if (node) {
			return modifyNode(node, pullData);
		} else {
			return createNode(pullData);
		}
	} else return createNode(pullData);
};

exports.getDataByPath = function(obj, path) {
	var parts = path.split('.');
	if (parts.length == 1) {
		return obj[parts[0]];
	} else {
		return exports.getDataByPath(obj[parts[0]], parts.slice(1).join('.'));
	}
};

function createNode(pullData) {
	var createNode = {};

	try {
		if (dataPullConfig.store.hasOwnProperty('node') && dataPullConfig.store.node.hasOwnProperty('editor')) {
			pullData = dataPullConfig.store.node.editor({}, pullData, createNode, dataPullConfig);
		}

		// If pullData has node property _path a complete node is present not a data node
		if (!pullData.hasOwnProperty('_parentPath')) {
			createNode.data = pullData;

			if (dataPullConfig.store.hasOwnProperty('node') && dataPullConfig.store.node.hasOwnProperty('nameField')) {
				createNode._name = getNodeName(pullData);
			}
		} else {
			createNode = pullData;
		}

		var node = existsNode(createNode, dataPullConfig);
		if (node) {
			return modifyNode(node, pullData);
		} else {
			checkAndCreateNodePaths(createNode);

			return repo.create(formatKeysInObject(appendNodeConfig(createNode)));
		}
	} catch (e) {
		try {
			checkAndCreateNodePaths(createNode);

			return repo.create(createNode);
		} catch (e) {
			log.error(e);
			return e;
		}
	}
}

function modifyNode(existingNode, pullData) {
	var result = repo.modify({
		key: '/' + existingNode._path,
		editor: function(node) {
			// Appends an default editor because if none is present in config.
			if (!dataPullConfig.store.node.hasOwnProperty('editor')) {
				dataPullConfig.store.node.editor = function(nodeData, pullData) {
					return pullData;
				};
			}

			if (!pullData.hasOwnProperty('_parentPath')) {
				var editorData = dataPullConfig.store.node.editor(node.data, pullData, node, dataPullConfig);
				editorData.hasOwnProperty('data') ? (node.data = editorData.data) : (node.data = editorData);
			} else {
				node = pullData;
			}

			return formatKeysInObject(appendNodeConfig(node));
		}
	});

	if (!result) {
		log.error('ERROR Modifying node: ' + existingNode._name);
	}

	return result;
}

function appendNodeConfig(node, pullData) {
	if (dataPullConfig.store.hasOwnProperty('node')) {
		if (dataPullConfig.store.node.hasOwnProperty('_indexConfig')) {
			node._indexConfig = dataPullConfig.store.node._indexConfig;
		}

		if (dataPullConfig.store.node.hasOwnProperty('_permissions')) {
			node._permissions = dataPullConfig.store.node._permissions;
		}

		if (dataPullConfig.store.node.hasOwnProperty('_manualOrderValue')) {
			node._manualOrderValue = dataPullConfig.store.node._manualOrderValue;
		}

		if (dataPullConfig.store.node.hasOwnProperty('_childOrder')) {
			node._childOrder = dataPullConfig.store.node._childOrder;
		}

		if (dataPullConfig.store.node.hasOwnProperty('_parentPath')) {
			node._parentPath = dataPullConfig.store.node._parentPath;
		}
	}

	return node;
}

function getNode(nodeId, dataPullConfig) {
	try {
		if (nodeId.indexOf('undefined') != -1) {
			return null;
		}

		var nodePath = getNodePath(nodeId, dataPullConfig);

		var result = repo.query({
			start: 0,
			count: 1,
			query: "_path LIKE '" + nodePath + "' "
		});

		if (result.count != 0) {
			return repo.get(result.hits[0].id);
		} else {
			return null;
		}
	} catch (e) {
		log.error(e);
		return null;
	}
}

function getNodeName(pullData) {
	var nodeName = null;
	var isArray = Array.isArray(dataPullConfig.store.node.nameField);

	if (isArray) {
		var nameField = '';
		dataPullConfig.store.node.nameField.forEach(function(field) {
			nameField = nameField + exports.getDataByPath(pullData, field) + '-';
		});

		if (nameField.slice(-1) == '-') {
			nameField = nameField.slice(0, -1) + '';
		}

		nodeName = nameField;
	} else {
		nodeName = pullData[dataPullConfig.store.node.nameField];
	}

	if (nodeName != undefined) {
		nodeName = validateConvertNodeName(nodeName);
	}

	return nodeName;
}

function getNodePath(nodeId, dataPullConfig) {
	var nodePath = nodeId;
	if (dataPullConfig.store.node.hasOwnProperty('_parentPath')) {
		if (!dataPullConfig.store.node._parentPath.startsWith('/')) {
			dataPullConfig.store.node._parentPath = '/' + dataPullConfig.store.node._parentPath;
		}

		nodePath = dataPullConfig.store.node._parentPath + nodePath;
		nodePath = nodePath.replaceAll('//', '/');
	}

	return nodePath;
}

function checkAndCreateNodePaths(node) {
	if (!node.hasOwnProperty('_parentPath')) {
		return;
	}

	var paths = node._parentPath.split('/');

	var checkPath = '';
	var parentPath = '';
	paths.forEach(function(path) {
		if (path != '') {
			checkPath = checkPath + path;
			var hasPath = existNodePath(checkPath);
			if (!hasPath) {
				try {
					repo.create({
						_name: path,
						_parentPath: '/' + parentPath
					});
				} catch (e) {
					log.error(e);
				}
			}

			parentPath = checkPath;
			checkPath += '/';
		}
	});
}

function existsNode(node) {
	var existsNode = null;
	if (node.hasOwnProperty('_id')) {
		existsNode = getNode(node._parentPath + node._name);
	}

	if (node.hasOwnProperty('_name')) {
		if (node.hasOwnProperty('_parentPath') && !node._parentPath.endsWith('/')) {
			node._parentPath = node._parentPath + '/';
		} else {
			node._parentPath = '';
		}

		var parentPath = node._parentPath;
		if (!parentPath.startsWith('/')) parentPath = '/';

		existsNode = getNode(parentPath + node._name, dataPullConfig);
	}

	return existsNode;
}

function existNodePath(path) {
	try {
		var result = repo.findChildren({
			start: 0,
			count: 1,
			parentKey: path
		});

		return result.total === 0 ? false : true;
	} catch (e) {
		return false;
	}
}

function formatKeysInObject(obj) {
	if (typeof obj !== 'object') return obj;

	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			if (prop.indexOf('.') != -1 || prop.indexOf('[') != -1) {
				var propFormatted = JSON.parse(JSON.stringify(prop));

				propFormatted = validateConvertNodeName(propFormatted);

				if (propFormatted.endsWith('_')) {
					propFormatted = propFormatted.substr(0, propFormatted.lastIndexOf('_'));
				}

				obj[propFormatted] = formatKeysInObject(obj[prop]);
				delete obj[prop];
			} else {
				obj[prop] = formatKeysInObject(obj[prop]);
			}
		}
	}
	return obj;
}

function validateConvertNodeName(value) {
	return value
		.replace(/\./g, ':')
		.replace(/\[/g, '_')
		.replace(/\]/g, '_')
		.replace(/\__/g, '_')
		.replace('\\)', '')
		.replace('\\(', '')
		.replaceAll(' ', '_');
}
