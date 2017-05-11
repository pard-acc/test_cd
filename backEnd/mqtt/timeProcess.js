/*
定時器任務
1. 檢查 cacheCommand 有無訊息要轉發
2. 轉送 cacheCommand 訊息至 MQTT
*/
var config = require('../config');
var schedule = require('node-schedule');
var parseInterface = require('../general/parseInterface');
var mqtt_client;
var server = config.ParseServerIP+":"+config.ParseServerPort;
var rule = new schedule.RecurrenceRule();
var times = [];
for(var i=1; i<60; i++) {
    if( i % 1 == 0) {
        times.push(i);
    }
}
rule.second = times;

getCacheCommand = function(callback) {
    var parameter = 'where={"state":"wait"}';
    var apiUrl = 'http://'+server+'/parse/classes/cacheCommand?' + parameter;
    parseInterface.getDataFromRestfulAPI(apiUrl, function(error, data)  {
        if(error) {  
            console.log('error : '+ error);
        } else {
            data = JSON.parse(data);
            if(data['results'].length > 0) {
                data['results'].forEach(proxySend);
            }
        }
    });
}

proxySend = function(command, callback) {
    try {
        mqtt_client.publish(command['topic'], command['mqttCommand']);
        console.log("------------------------------------------");
        console.log("Forward MQTT");
        console.log("Topic : " + command['topic']);
        console.log("Data : " + command['mqttCommand']);
        console.log("------------------------------------------");
    } catch (err) {
        updateSendStatus(command.objectId, err);
    }
    updateSendStatus(command.objectId, 'send success');
}

updateSendStatus = function(objectId, state ,callback) {
    var parameter = '{"state":"'+state+'"}';
    var apiUrl = 'http://'+server+'/parse/classes/cacheCommand/'+objectId;
    parseInterface.putDataToRestfulAPI(apiUrl, parameter, function(error, data)  {
        if(error) {  
            console.log('err : '+ err);
        } else {
           //console.log(objectId +" : " + data);
        }
    });
}

exports.openSchedule= function(client,  callback) {
    mqtt_client = client;
    var j = schedule.scheduleJob(rule, function(){
        getCacheCommand();
    });
}