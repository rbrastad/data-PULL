var repositoryLib = require('/lib/openxp/data-pull/repository');
var nodeDataLib = require('/lib/openxp/data-pull/node-data');
var resultLib = require('/lib/openxp/data-pull/result');
var httpClientLib = require('/lib/xp/http-client');

var dataPullConfig;
var DEBUG = false;

exports.pullDataByConfig = function(dpConfig) {
	dataPullConfig = dpConfig;

	logStart();

	var response = {
		dataPullConfig: dataPullConfig,
		result: {}
	};

	if (dataPullConfig.pull.request) response.result.pull = getHttpRequest(dataPullConfig);

	return saveData(response);
};

exports.storeDataByConfig = function(dpConfig, data) {
	dataPullConfig = dpConfig;

	logStart();

	var response = {
		dataPullConfig: dataPullConfig,
		result: {
			pull: {
				status: 200,
				body: data
			}
		}
	};

	return saveData(response);
};

function saveData(response) {
	try {
		if (response.result.pull.status === 200) {
			var resultBody = {};
			if (Array.isArray(response.result.pull.body)) {
				resultBody = response.result.pull.body;
			} else resultBody = JSON.parse(response.result.pull.body);

			resultBody = getResponseData(resultBody, dataPullConfig);

			if (dataPullConfig.hasOwnProperty('store')) response.result.store = load(dataPullConfig, resultBody);
			else response.result.store = resultBody;

			if (dataPullConfig.hasOwnProperty('result')) {
				resultLib.dataPullConfig(dataPullConfig);
				response = resultLib.doResultConfig(response);
			}
		}
	} catch (e) {
		response.result.error = e;
	}

	logEnd();

	return response;
}

function load(dataPullConfig, responseData) {
	var nodeSaved = [];
	var nodeError = [];

	var repo = repositoryLib.get(dataPullConfig);
	if (repo) {
		nodeDataLib.setRepo(repo);

		var isArray = Array.isArray(responseData);
		if (isArray) {
			pullResponse(responseData).forEach(function(nodeData) {
				try {
					try {
						if (
							dataPullConfig.pull.hasOwnProperty('response') &&
							dataPullConfig.pull.response.hasOwnProperty('node') &&
							dataPullConfig.pull.response.node.hasOwnProperty('editor')
						) {
							nodeData = dataPullConfig.pull.response.node.editor({}, nodeData, null, dataPullConfig);
						}
					} catch (e) {
						log.error(e);
					}

					if (nodeData != null) {
						var result = nodeDataLib.saveNode(dataPullConfig, nodeData);
						nodeSaved.push({
							_id: result._id,
							_name: result._name,
							_path: result._path,
							_timestamp: result._timestamp
						});
					}
				} catch (e) {
					nodeError.push(nodeData);
				}
			});
		} else {
			nodeDataLib.saveNode(dataPullConfig, responseData);
		}
	}

	var responseAction = {
		saved: nodeSaved,
		error: nodeError
	};

	return responseAction;
}

function getResponseData(responseData, dataPullConfig) {
	if (dataPullConfig.pull.hasOwnProperty('response') && dataPullConfig.pull.response.hasOwnProperty('dataPath')) {
		responseData = nodeDataLib.getDataByPath(responseData, dataPullConfig.pull.response.dataPath);
	}

	if (dataPullConfig.pull.hasOwnProperty('response') && dataPullConfig.pull.response.hasOwnProperty('editor')) {
		responseData = dataPullConfig.pull.response.editor(responseData, dataPullConfig);
	}

	if (dataPullConfig.pull.hasOwnProperty('response') && dataPullConfig.pull.response.hasOwnProperty('dataSlice')) {
		responseData = dataSlice(responseData);
	}

	return responseData;
}

function pullResponse(data) {
	return dataSlice(data);
}

function dataSlice(data) {
	if (dataPullConfig.pull.hasOwnProperty('response') && dataPullConfig.pull.response.hasOwnProperty('dataSlice')) {
		try {
			var start = dataPullConfig.pull.response.dataSlice.start;
			var end = start + dataPullConfig.pull.response.dataSlice.limit;

			return data.slice(start, end);
		} catch (e) {
			log.error(e);
			return data;
		}
	} else {
		return data;
	}
}

function getHttpRequest(dataPullConfig) {
	return httpClientLib.request(dataPullConfig.pull.request);
}

function logStart() {
	if (DEBUG) {
		log.info(getDataPullConfigName() + ' STARTED at ' + new Date());
	}
}

function logEnd() {
	if (DEBUG) {
		log.info(getDataPullConfigName() + ' END at ' + new Date());
	}
}

function getDataPullConfigName() {
	var name = '';
	if (dataPullConfig.hasOwnProperty('name')) name = dataPullConfig.name;

	return name;
}
