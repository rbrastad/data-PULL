var dataPullConfig;

exports.dataPullConfig = function(config) {
	dataPullConfig = config;
};

exports.doResultConfig = function(response) {
	if (dataPullConfig.hasOwnProperty('result')) {
		if (dataPullConfig.result.hasOwnProperty('request')) {
			if (dataPullConfig.result.request.hasOwnProperty('body') && !dataPullConfig.result.request.body) {
				delete response.result.pull.body;
				delete response.result.pull.bodyStream;
			}
		}

		if (dataPullConfig.result.hasOwnProperty('editor')) {
			response = dataPullConfig.result.editor(response);
		}
	} else {
		delete response.result.pull.body;
		delete response.result.pull.bodyStream;
	}

	return response;
};
