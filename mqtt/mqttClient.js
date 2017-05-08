var mqtt = require('mqtt')
var classification = require('./messageDump')
var schedule = require('./timeProcess');
var client  = mqtt.connect('mqtt:localhost');

function OpenMqttClent() {
    client.on('connect', function () {
      client.subscribe('SH/#');
      //client.publish('SH/test', 'Hello mqtt')
    })
     
    client.on('message', function (topic, message) {
        classification.SendMessageToParse( topic.toString(), message, function(error, data)  {
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
/*
exports.OpenMqttClent = function( ) {
    OpenMqttClent();
    schedule.OpenSchedule(client);
}
*/
OpenMqttClent();
schedule.OpenSchedule(client);