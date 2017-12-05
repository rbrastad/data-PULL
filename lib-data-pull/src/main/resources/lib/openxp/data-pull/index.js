var template = require('/lib/openxp/data-pull/template');
var dataPull = require('/lib/openxp/data-pull/datapull');

exports.pullData = function(dpSimpleConfig) {
	return exports.pullDataByConfig(exports.getConfig(dpSimpleConfig));
};

exports.pullDataByConfig = function(dpConfig) {
	return dataPull.pullDataByConfig(dpConfig);
};

exports.getConfig = function(configJson) {
	return template.getTemplate(configJson);
};
