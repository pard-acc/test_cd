//--------------------------------------
var host = '192.168.1.3:1337';  //後端位置
var headers = {                        //Parse Server API Key
    'X-Parse-Application-Id' :  '19453386',
    'X-Parse-REST-API-Key' : '1234',
    'Content-Type' : 'application/json'
}
var gateway ='HS000000000009'; // 該帳號所屬 Gateway -> 暫時寫死
//---------------------------------------
sendGetRequestToREST = function(className, parameter, callback) { 
    $.ajax({
        url: "http://"+host+"/parse/classes/"+className + "?" + parameter,
        type: "get",
        contentType: "application/json;",
        headers: headers,
        success:function (data, textStatus, status) {
            callback && callback(null, data, textStatus, status);
        },
        error: function(data, textStatus, errorThrown){
            callback && callback(data, textStatus, errorThrown);
        }
    });
}

sendPostRequestToREST = function(className, data, callback) { 
    $.ajax({
        url: "http://"+host+"/parse/classes/" + className,
        type: "post",
        headers: headers,
        data : JSON.stringify(data),
        success:function (status) {
            callback && callback(null, status);
        },
        error: function(data, textStatus, errorThrown) {
             callback && callback(data, textStatus, errorThrown);
        }
    });
}

sendPutRequestToREST = function(className, data, callback) { 
    $.ajax({
        url: "http://"+host+"/parse/classes/" + className,
        type: "put",
        headers: headers,
        data : JSON.stringify(data),
        success:function (status) {
            callback && callback(null, status);
        },
        error: function(data, textStatus, errorThrown){
             callback && callback(data, textStatus, errorThrown);
        }
    });
}