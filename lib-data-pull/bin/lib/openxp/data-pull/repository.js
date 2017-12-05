var nodeLib = require('/lib/xp/node');
var repoLib = require('/lib/xp/repo');

exports.get = function(config) {
	var repo = null;
	var repoExists = repoLib.get(config.store.repo.connect.repoId);
	if (repoExists == null && config.store.repo.create) {
		var created = createRepo(config);
		if (created) {
			repo = nodeLib.connect(config.store.repo.connect);
		}
	} else {
		repo = nodeLib.connect(config.store.repo.connect);
	}

	return repo;
};

exports.connect = function(config) {
	return nodeLib.connect(config.store.repo.connect);
};

exports.exists = function(repoId) {
	var repoExists = repoLib.get(repoId);
	if (repoExists == null) return false;
	else return true;
};

function createRepo(config) {
	var created = repoLib.create(config.store.repo.create);
	if (created) {
		log.info('Repository created: %s', JSON.stringify(config.store.repo.create, null, 2));
		if (config.store.repo.hasOwnProperty('createBranch')) {
			var createdBranch = repoLib.createBranch(config.store.repo.createBranch);
			if (createdBranch) {
				log.info('Repository Branch created: %s', JSON.stringify(config.store.repo.createBranch, null, 2));
				return true;
			} else {
				log.error('Repository Branch NOT created: %s', JSON.stringify(config.store.repo.createBranch, null, 2));
				return false;
			}
		} else return true;
	} else {
		log.error('Repository NOT created: %s', JSON.stringify(config.store.repo.create, null, 2));
		return false;
	}
}
