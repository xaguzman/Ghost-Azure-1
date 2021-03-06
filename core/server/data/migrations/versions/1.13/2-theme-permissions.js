const _ = require('lodash');
const utils = require('../../../schema/fixtures/utils');
const permissions = require('../../../../services/permissions');
const {logging} = require('../../../../lib/common');
const resource = 'theme';
const _private = {};

_private.getPermissions = function getPermissions() {
    return utils.findModelFixtures('Permission', {object_type: resource});
};

_private.getRelations = function getRelations() {
    return utils.findPermissionRelationsForObject(resource);
};

_private.printResult = function printResult(result, message) {
    if (result.done === result.expected) {
        logging.info(message);
    } else {
        logging.warn('(' + result.done + '/' + result.expected + ') ' + message);
    }
};

module.exports.config = {
    transaction: true
};

module.exports.up = function addRedirectsPermissions(options) {
    const modelToAdd = _private.getPermissions();
    const relationToAdd = _private.getRelations();

    const localOptions = _.merge({
        context: {internal: true}
    }, options);

    return utils.addFixturesForModel(modelToAdd, localOptions)
        .then(function (result) {
            _private.printResult(result, 'Adding permissions fixtures for ' + resource + 's');
            return utils.addFixturesForRelation(relationToAdd, localOptions);
        })
        .then(function (result) {
            _private.printResult(result, 'Adding permissions_roles fixtures for ' + resource + 's');
            return permissions.init(localOptions);
        });
};

/**
 * @TODO:
 * The down function is quite tricky, because the fixture utility adds **all** missing fixtures for a target resource.
 * So if we are writing a down function, we are only allowed to remove the fixtures which were added between two Ghost versions.
 */
