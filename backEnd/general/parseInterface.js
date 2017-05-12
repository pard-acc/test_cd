var request = require('request');
var config = require('../config');
var headers = {
    'X-Parse-Application-Id' :  config.ParseApplicationID,
    'Content-Type' : 'application/json'
};

exports.getDataFromRestfulAPI = function (apiUrl, callback) {
    request.get(apiUrl, {
        headers : headers,
    }, function(err, res, data) {
        if (err) {  
            callback(err);
        }
        else {
            callback && callback(null, data);
        }
    });
};

exports.postDataToRestfulAPI = function(apiUrl, information, callback) {
    request.post(apiUrl, {
        headers : headers,
        form: information
    }, function (err, res, data) {
        if (err) {  
            callback(err);
        }
        else {
            callback && callback(null, data);
        }
    });
};

exports.putDataToRestfulAPI = function (apiUrl, parameter, callback) {
     request.put(apiUrl, {
        headers : headers,
        body: parameter
    }, function(err, res, data) {
        if (err) {  
            callback(err);
        }
        else {
            callback && callback(null, data);
        }
    });
};
