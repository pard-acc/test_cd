 var request = require('request');
var headers = {
    'X-Parse-Application-Id' :  '19453386',
    'Content-Type' : 'application/json'
}

exports.SendMessageToPase= function(topic, message, callback) {
    //step 1 Get DeviceHS
    GetDeviceHS(topic, function(error, deviceHS)  {
        if(error) {  
            console.log(error);
        }
        GetInformationFormMqtt (message, function(error, Information)  {
             //step 2 Send Message To PaseAPI
            var apiUrl = 'http://localhost:1337/parse/classes/' + deviceHS;
            request.post( apiUrl, {
                headers : headers,
                form: Information
            }, function(err, res) {
                if(err) {  
                    console.log('err : '+ err);
                }
                else {
                    //console.log('------------');
                    //console.log("SEND pase ok");
                    //console.log('------------');
                }
            });
        })
    })
};

GetDeviceHS = function(topic, callback) {
    try {
        var topicArray = topic.split("/");
        if(topicArray.length >= 2) {
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
//分析MQTT資訊
//
GetInformationFormMqtt = function(message, callback) {
    try {
        var messageJSON = JSON.parse(message.toString());
        var Information;
        switch (messageJSON.Func) {
            case 'Inform' :
                Information = {
                    'Func' : messageJSON.Func,
                    'Time' : messageJSON.Time,
                    'Data' : JSON.stringify(messageJSON.Data)
                }
                if (messageJSON.Data['Event']['EventCode'] == '4 VALUE CHANGE') {
                    messageJSON.Data['ParameterList'].forEach(UpdateDeviceInformation); //Updated
                }
            break;
        }
        callback && callback(null, Information);
    }
    catch (err) {
        callback(err);
    }
}

//連動規則-變更設備狀態
//--------------------------------------------------------
UpdateDeviceInformation = function(Parameter, callback) {
    //console.log('------UpdateDeviceInformation------');
    var s = Parameter['Name'].split('.');
    var deviceID = s[0]+'.'+s[1]+'.'+s[2]+'.'+s[3];
    var item = s[4];
    var parameter = 'where={"deviceID":"'+deviceID+'"}';
    var apiUrl = 'http://localhost:1337/parse/classes/deviceList?' + parameter;
    GetDataToRestfulAPI(apiUrl, function(error, data)  {
        if(error) {  
            console.log('err : '+ err);
        } else {
            data = JSON.parse(data);
            //console.log( data['results'][0]['objectId']);
            /*
            apiUrl = 'http://localhost:1337/parse/classes/deviceList/'+data['results'][0]['objectId'];
            parameter = '{"status": [{"joe schmoe"}]}';
            request.put( apiUrl, {
                headers : headers,
                body: parameter
            }, function(err, res, data) {
                if(err) {  
                    console.log('err : '+ err);
                }
                else {
                     console.log('-------111-----');
               //     console.log(JSON.stringify(ParameterList));
                     
                }
            });
                
                /*
                apiUrl = 'http://localhost:1337/parse/classes/deviceList/'+data['results'][0]['objectId'];
                parameter = '{"returnData":"{str132:123, str1:2}"}';
                request.put( apiUrl, {
                    headers : headers,
                    body: parameter
                }, function(err, res, data) {
                    if(err) {  
                        console.log('err : '+ err);
                    }
                    else {
                         console.log('-------111-----');
                   //      console.log(JSON.stringify(ParameterList));
                         
                    }
                });
                */
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
