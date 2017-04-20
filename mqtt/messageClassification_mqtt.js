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
                    console.log('------------');
                    console.log("SEND pase ok");
                    console.log('------------');
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
            break;
        }
            console.log('------------');
            console.log( Information );
            console.log('------------');
        callback && callback(null, Information);
    }
    catch (err) {
        callback(err);
    }
}
