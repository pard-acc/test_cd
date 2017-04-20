#!/bin/sh
sudo killall -9 nodejs
#開啟 MQTT Server
node ./mqtt/mqttClient.js  &
#開啟 對外服務網站
node ./webServer/app.js  &
#開啟 pase server
cd parseServer 
npm run start