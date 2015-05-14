/**
 * jQuery ajax wrapper
 * @param method
 * @param url
 * @param data
 * @param callback
 */
module.exports = function (method, url, data, callback) {

    if (_.isEmpty(method)) {
        throw new Error('request.js: Missing arg method');
    }

    if (_.isEmpty(url)) {
        throw new Error('request.js: Missing arg url');
    }

    if (!_.isString(url)) {
        throw new Error('request.js: String expected for url');
    }

    if (!data) {
        throw new Error('request.js: Missing arg data');
    }

    if (!_.isObject(data)) {
        throw new Error('request.js: Object expected for data');
    }

    if (!callback) {
        throw new Error('request.js: Missing arg callback');
    }

    if (!_.isFunction(callback)) {
        throw new Error('request.js: Function expected for callback');
    }

    var options = {
        url: url,
        type: method,
        data: data,
        dataType: 'text',

        success: function (json, textStatus, jqXHR) {
            return callback(null, JSON.parse(json));
        },

        error: function (error) {
            return callback(error.message, null);
        }
    };

    $.ajax(options);
};