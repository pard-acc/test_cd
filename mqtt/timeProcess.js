 var schedule = require('node-schedule');
 var request = require('request');
 var email = require('./email');

 var mqtt_client;

var rule = new schedule.RecurrenceRule();
var times = [];
for(var i=1; i<60; i++){
    if( i % 2 == 0) {
        times.push(i);
        //console.log("i = "+i);
    }
}
rule.second = times;

exports.OpenSchedule= function(client,  callback) {
    mqtt_client = client;
    var j = schedule.scheduleJob(rule, function(){
        GetCacheCommand();
    });
}

var headers = {
    'X-Parse-Application-Id' :  '19453386',
    'Content-Type' : 'application/json'
}

GetCacheCommand = function(callback) {
    var parameter = 'where={"processingState":"wait"}';
    var apiUrl = 'http://localhost:1337/parse/classes/cacheCommand?' + parameter;
    GetDataToRestfulAPI(apiUrl, function(error, data)  {
        if(error) {  
            console.log('err : '+ err);
        } else {
            data = JSON.parse(data);
            if(data['results'].length > 0) {
                console.log('------------');
                console.log( data['results'].length);
                console.log('------------');
                data['results'].forEach(ProxySend);
            }
        }
    });
}

ProxySend = function(command, callback) {
    try {
        conversionCommand(command);
    } catch (err) {
        UpdateSendStatus(command.objectId, err);
    }
    UpdateSendStatus(command.objectId, 'send success');
}

UpdateSendStatus = function(objectId, processingState ,callback) {
    var parameter = '{"processingState":"'+processingState+'"}';
    var apiUrl = 'http://localhost:1337/parse/classes/cacheCommand/'+objectId;
    request.put( apiUrl, {
        headers : headers,
        body: parameter
    }, function(err, res, data) {
        if(err) {  
            console.log('err : '+ err);
        }
        else {
            console.log(objectId +" : " + data);
        }
    });
}

conversionCommand = function(command, callback) {
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
        mqtt_client.publish(topic, JSON.stringify(mqttCommand));
        email.SendMail();
    });
}

GetDeviceID= function(mac, callback) {
    var parameter = 'where={"mac":"'+mac+'"}';
    var apiUrl = 'http://localhost:1337/parse/classes/deviceList?' + parameter;
    GetDataToRestfulAPI(apiUrl, function(error, data)  {
        if(error) {  
            callback(err);
        } else {
            data = JSON.parse(data);
            callback && callback(null, data['results'][0].deviceID);
        }
    });
}



GetDataToRestfulAPI = function(apiUrl, callback) {
    request.get( apiUrl, {
        headers : headers,
    }, function(err, res, data) {
        if(err) {  
            callback(err);
        }
        else {
            callback && callback(null, data);
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