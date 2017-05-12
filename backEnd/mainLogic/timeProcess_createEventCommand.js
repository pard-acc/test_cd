var config = require('../config');
var schedule = require('node-schedule');
var parseInterface = require('../general/parseInterface');
var server = config.ParseServerIP+":"+config.ParseServerPort;
var rule = new schedule.RecurrenceRule();
var times = [];
for (var i = 1; i < 60; i += 1) {
    if (i % 1 === 0) {
        times.push(i);
    }
}
rule.second = times;

getUntreatedEvent = function (callback) { 
    var parameter = 'where={"processingState":"wait"}';
    var apiUrl = 'http://' + server + '/parse/classes/eventList?' + parameter;
    parseInterface.getDataFromRestfulAPI(apiUrl, function (error, data)  {
        if (error) {  
            console.log('error : '+ error);
        } else {
            data = JSON.parse(data);
            if (data['results'].length > 0) {
                console.log('------------');
                console.log( data['results'].length);
                console.log('------------');
                data['results'].forEach(createEventCommand);
            }
        }
    });
};

createEventCommand = function (event, callback) {
    switch (event.eventType) {
        case 'change device state':
            setChangeDeviceStateCommand(event, function (error) {
                if (error) { 
                    console.log("event error : " + error);
                } else {
                    console.log("Event Command Creation : " + event.objectId);
                }
            });
        break;
        default :
            callback && callback("無法處理的事件.");
        }
};

setChangeDeviceStateCommand = function ( event, callback) {
    console.log( 'targetGateway : ' + event.eventContent.targetGateway);
    console.log( 'targetDevice : ' + event.eventContent.targetDevice);
    console.log( 'status : ' + event.eventContent.status);
    var topic = "SH/" + event.eventContent.targetGateway;
    var func, time, replyId, seq, data, item, value;
    switch (event.eventContent.status) {
        case 'open':
            topic +=  "/reqTo/sc"
            func = "SetParameterValues";
            item = "CtrlCmd";
            value = 1;
        break;
        case 'close':
            topic +=  "/reqTo/sc";
            func = "SetParameterValues";
            item = "CtrlCmd";
            value = 0;
        break;
    }
    time = getNewDate();
    replyId = "SmartHomeManagementServer";
    seq = getRandom();
    getDeviceID(event.eventContent.targetDevice, function (error, deviceID)  {
        data = {
            "ParameterList" : 
            [
                { 
                    "Name" : deviceID + "."+ item,
                    "Value" : value
                }
            ]
        }

        var mqttCommand = {
            Func: func,
            Time: time,
            ReplyId: replyId,
            Seq: seq,
            Data: data
        }
        
        sendCommandToParse(topic, mqttCommand, event.objectId, function (error) {
            callback(error);
        });
    });
};

sendCommandToParse = function (topic, mqttCommand, event_objectId, callback) {
    var apiUrl = 'http://' + server + '/parse/classes/cacheCommand';
    var data = {
        topic : topic,
        state : "wait",
        seq : mqttCommand['Seq'],
        mqttCommand: JSON.stringify(mqttCommand),
        event_objectId : event_objectId
    }
    parseInterface.postDataToRestfulAPI(apiUrl, data, function (error, reply) {
        if (error) {  
            callback(error);
        }
        else {
            updateStatus(event_objectId, 'Wait Sent');
            callback(null);
        }
    });
};

updateStatus = function (objectId, processingState ,callback) {
    var parameter = '{"processingState":"' + processingState + '"}';
    var apiUrl = 'http://' + server + '/parse/classes/eventList/' + objectId;
    parseInterface.putDataToRestfulAPI(apiUrl, parameter, function (error, data)  {
        if (error) {
            console.log('err : ' + err);
        } else {
            console.log(objectId + " : " + data);
        }
    });
};

getDeviceID = function (mac, callback) {
    var parameter = 'where={"mac":"' + mac + '"}';
    var apiUrl = 'http://' + server + '/parse/classes/deviceList?' + parameter;
    parseInterface.getDataFromRestfulAPI(apiUrl, function (error, data)  {
        if (error) {  
            callback(error);
        } else {
            data = JSON.parse(data);
            callback && callback(null, data['results'][0].deviceID);
        }
    });
};

function getNewDate() {
    var tdate = new Date();
    var dd = tdate.getDate(); 
    var MM = tdate.getMonth();
    var yyyy = tdate.getFullYear(); 
    var HH = tdate.getHours();
    var mm = tdate.getMinutes();
    var ss = tdate.getSeconds();
    var time =   yyyy + '-' + (MM < 10 ? '0' : '') + MM + '-' + (dd < 10 ? '0' : '') + dd + ' ' +   (HH < 10 ? '0' : '') + HH  + ':'+ (mm < 10 ? '0' : '')  + mm + ':' + (ss < 10 ? '0' : '') + ss;
    return time;
}

function getRandom() {
    var maxNum = 100000000;  
    var minNum = 0;  
    var n = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum; 
    return n;
}

openSchedule = function () {
    var j = schedule.scheduleJob(rule, function () {
        getUntreatedEvent();
    });
}
openSchedule();
console.log('Event Command Program Starts.');