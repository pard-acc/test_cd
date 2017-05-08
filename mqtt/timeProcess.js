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

GetCacheCommand = function(callback) {
    var parameter = 'where={"state":"wait"}';
    var apiUrl = 'http://'+server+'/parse/classes/cacheCommand?' + parameter;
    parseInterface.GetDataFromRestfulAPI(apiUrl, function(error, data)  {
        if(error) {  
            console.log('err : '+ err);
        } else {
            data = JSON.parse(data);
            if(data['results'].length > 0) {
                data['results'].forEach(ProxySend);
            }
        }
    });
}

ProxySend = function(command, callback) {
    try {
        mqtt_client.publish(command['topic'], command['mqttCommand']);
        console.log("------------------------------------------");
        console.log("Forward MQTT");
        console.log("Topic : " + command['topic']);
        console.log("Data : " + command['mqttCommand']);
        console.log("------------------------------------------");
    } catch (err) {
        UpdateSendStatus(command.objectId, err);
    }
    UpdateSendStatus(command.objectId, 'send success');
}

UpdateSendStatus = function(objectId, state ,callback) {
    var parameter = '{"state":"'+state+'"}';
    var apiUrl = 'http://'+server+'/parse/classes/cacheCommand/'+objectId;
    parseInterface.PutDataToRestfulAPI(apiUrl, parameter, function(error, data)  {
        if(error) {  
            console.log('err : '+ err);
        } else {
           //console.log(objectId +" : " + data);
        }
    });
}

exports.OpenSchedule= function(client,  callback) {
    mqtt_client = client;
    var j = schedule.scheduleJob(rule, function(){
        GetCacheCommand();
    });
}