// contoller.js and garage.js
var mqtt = require('mqtt')
var classification = require('./messageClassification_mqtt')
var client  = mqtt.connect('mqtt:localhost')

function OpenMqttClent() {
    client.on('connect', function () {
      client.subscribe('SH/#')
      //client.publish('SH/test', 'Hello mqtt')
    })
     
    client.on('message', function (topic, message) {
        classification.SendMessageToPase( topic.toString(), message, function(error, data)  {
            if ( error ) {
                console.log( error );
            } else {
            //  console.log( data );
            }
        })
        //client.end()
    })
    console.log('Open Mqtt Clent.');
}

exports.OpenMqttClent = function( ) {
    OpenMqttClent();
}
 
OpenMqttClent();