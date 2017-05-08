var config = require('../config');
var schedule = require('node-schedule');
var parseInterface = require('../general/parseInterface');
var server = config.ParseServerIP+":"+config.ParseServerPort;
var rule = new schedule.RecurrenceRule();
var times = [];
for(var i=1; i<60; i++) {
    if( i % 1 == 0) {
        times.push(i);
    }
}
rule.second = times;

GetUntreatedEvent = function(callback) { 
    var parameter = 'where={"processingState":"wait"}';
    var apiUrl = 'http://'+server+'/parse/classes/eventList?' + parameter;
    parseInterface.GetDataFromRestfulAPI(apiUrl, function(error, data)  {
        if(error) {  
            console.log('err : '+ err);
        } else {
            data = JSON.parse(data);
            if(data['results'].length > 0) {
                console.log('------------');
                console.log( data['results'].length);
                console.log('------------');
                data['results'].forEach(CreateEventCommand);
            }
        }
    });
}

CreateEventCommand = function(event, callback) {
    ConversionCommand(event, function(error, topic, mqttCommand)  {
        var apiUrl = 'http://'+server+'/parse/classes/cacheCommand';
        var data = {
            topic : topic,
            state : "wait",
            seq : mqttCommand['Seq'],
            mqttCommand: JSON.stringify(mqttCommand)
        }
        parseInterface.PostDataToRestfulAPI(apiUrl, data, function(error, reply) {
            if(error) {  
                console.log('error : '+ err);
            }
            else {
               UpdateStatus(event.objectId, 'Wait Sent');
            }
        })
    })
}

ConversionCommand = function(command, callback) {
    console.log( 'objectId : '+ command.objectId);
    console.log( 'targetGateway : '+command.targetGateway);
    console.log( 'targetDevice : '+command.targetDevice);
    console.log( 'deviceType : '+command.deviceType);
    console.log( 'command : ' + command.command);
    var topic = "SH/"+command.targetGateway;
    var func, time, replyId, seq, data, item, value;
    switch(command.command) {
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
    time = GetNewDate();
    replyId = "SmartHomeManagementServer";
    seq = GetRandom();
    GetDeviceID(command.targetDevice, function(error, deviceID)  {
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
        callback && callback(null, topic, mqttCommand);
    });
}

UpdateStatus = function(objectId, processingState ,callback) {
    var parameter = '{"processingState":"'+processingState+'"}';
    var apiUrl = 'http://'+server+'/parse/classes/eventList/'+objectId;
    parseInterface.PutDataToRestfulAPI(apiUrl, parameter, function(error, data)  {
        if(error) {  
            console.log('err : '+ err);
        } else {
            console.log(objectId +" : " + data);
        }
    });
}

GetDeviceID= function(mac, callback) {
    var parameter = 'where={"mac":"'+mac+'"}';
    var apiUrl = 'http://'+server+'/parse/classes/deviceList?' + parameter;
    parseInterface.GetDataFromRestfulAPI(apiUrl, function(error, data)  {
        if(error) {  
            callback(err);
        } else {
            data = JSON.parse(data);
            callback && callback(null, data['results'][0].deviceID);
        }
    });
}

function GetNewDate() {
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

function GetRandom() {
    var maxNum = 100000000;  
    var minNum = 0;  
    var n = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum; 
    return n;
}

OpenSchedule= function() {
    var j = schedule.scheduleJob(rule, function(){
        GetUntreatedEvent();
    });
}
OpenSchedule();
console.log('Event Command Program Starts.');