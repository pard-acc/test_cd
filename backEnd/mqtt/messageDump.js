/*
訊息轉換與處理
1. 將監聽到的 MQTT 訊息分析處理
2. 轉送將處理後的資訊透過 Parse REST API 儲存至 DB
*/
var config = require('../config');
var parseInterface = require('../general/parseInterface');
var server = config.ParseServerIP + ":" + config.ParseServerPort;

exports.sendMessageToParse = function (topic, message, callback) {
    //step 1 Get DeviceHS
    getDeviceHS(topic, function (error, deviceHS)  {
        if (error) {  
            console.log(error);
        }
        getInformationFormMqtt (message, function (error, information)  {
             //step 2 Send Message To PaseAPI
            var apiUrl = 'http://' + server + '/parse/classes/' + deviceHS;
            parseInterface.postDataToRestfulAPI(apiUrl, information, function (error, data) {
                if (error) {  
                    console.log('error : ' + err);
                }
                else {
                    //console.log('------------');
                    //console.log("SEND pase ok");
                    //console.log('------------');
                }
            });
        });
    });
};

getDeviceHS = function (topic, callback) {
    try {
        var topicArray = topic.split("/");
        if (topicArray.length >= 2) {
            callback && callback(null, topicArray[1]);
        } else {
            throw "source topic is incorrect.";
        }
    }
    catch (err) {
        callback(err);
    }
};

//
//分析及處理MQTT資訊
//
getInformationFormMqtt = function (message, callback) {
    try {
        var messageJSON = JSON.parse(message.toString());
        var information;
        switch (messageJSON.Func) {
            case 'Inform' :
                information = {
                    'Func' : messageJSON.Func,
                    'Time' : messageJSON.Time,
                    'Data' : JSON.stringify(messageJSON.Data)
                }

                if (messageJSON.Data['Event']['EventCode'] == '4 VALUE CHANGE') {
                    messageJSON.Data['ParameterList'].forEach(updateDeviceInformation); //Updated
                } else {

                }
            break;
            case 'SetParameterValues' :
                information = {
                    'Func' : messageJSON.Func,
                    'Time' : messageJSON.Time,
                    'ReplyId':messageJSON.ReplyId,
                    'Seq':messageJSON.Seq,
                    'Data' : JSON.stringify(messageJSON.Data)
                }
            break;
            case 'SetParameterValuesResp' :
                information = {
                    'Func' : messageJSON.Func,
                    'Time' : messageJSON.Time,
                    'Data' : JSON.stringify(messageJSON.Data),
                    'Seq' : messageJSON.Seq,
                    'FaultCode' : messageJSON.FaultCode
                }
                updateResponse(messageJSON.Seq, information);
            break;
        }
        callback && callback(null, information);
    }
    catch (err) {
        callback(err);
    }
};

updateResponse  = function (seq, data) {
    var condition = 'where={"seq":"' + seq + '"}';
    var apiUrl = 'http://' + server + '/parse/classes/cacheCommand?' + condition;
    parseInterface.getDataFromRestfulAPI(apiUrl, function (error, information)  {
        if (error) {  
            console.log('err : ' + err);
        } else {
            information = JSON.parse(information);
            condition = {'mqttResponse' : JSON.stringify(data)};
            apiUrl = 'http://' + server + '/parse/classes/cacheCommand/' + information['results'][0]['objectId'];
            parseInterface.putDataToRestfulAPI(apiUrl, JSON.stringify(condition), function (error, data)  {
                 if (error) {  
                    console.log('error : ' + error);
                }
                else {
                //    console.log( parameter['Name']);
                //    console.log( 'StateOnOff : '+parameter['Value']);
                }
            });
        }
    });
};

updateDeviceInformation = function (parameter, callback) {
    var s = parameter['Name'].split('.');
    var deviceID = s[0]+'.'+s[1]+'.'+s[2]+'.'+s[3];
    var item = s[4];
    var condition = 'where={"deviceID":"' + deviceID + '"}';
    var apiUrl = 'http://' + server + '/parse/classes/deviceList?' + condition;
    parseInterface.getDataFromRestfulAPI(apiUrl, function (error, data) {
        if (error) {
            console.log('err : ' + err);
        } else {
            data = JSON.parse(data);
           // console.log( data['results'][0]['objectId']);
            if ( item === 'StateOnOff') {
                apiUrl = 'http://' + server + '/parse/classes/deviceList/' + data['results'][0]['objectId'];
                condition = '{"status":"' + parameter['Value'] + '"}';
                parseInterface.putDataToRestfulAPI(apiUrl, condition, function (error, data)  {
                    if (error) {  
                        console.log('error : ' + error);
                    }
                    else {
                    //    console.log('------------');
                    //    console.log( parameter['Name']);
                    //    console.log( 'StateOnOff : '+parameter['Value']);
                    }
                });
            }
        }
    });
};