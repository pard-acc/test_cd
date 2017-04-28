//--------------------------------------
var host = '192.168.1.3:1337';  //後端位置
var headers = {                        //Parse Server API Key
    'X-Parse-Application-Id' :  '19453386',
    'X-Parse-REST-API-Key' : '1234',
    'Content-Type' : 'application/json'
}
var gateway ='HS000000000009'; // 該帳號所屬 Gateway -> 暫時寫死
//---------------------------------------
var geocoder;
var map, popup;
var markers = [];

var myStyles =[
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    }
];

function initialize() {
  geocoder = new google.maps.Geocoder();
  popup = new google.maps.InfoWindow();
  showDeviceList();
  var latlng = new google.maps.LatLng(25.048215,121.517123);        // map center
  var mapOptions = {
    zoom: 18,
    center: latlng,
    disableDoubleClickZoom: true,
    styles: myStyles
  }
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
}

function clickMarker() {
    deviceList.value = this.mac;
    moveMapCenter(this.mac);
}

function dblclickMarker() {
    switchDevice(this);
}


function setMapOnAll() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function moveMapCenter(mac) {
    for (var i = 0; i < markers.length; i++) {
       if(markers[i].mac == mac) {
          map.panTo(markers[i].position);
          popup.setContent(markers[i].remarks);
          popup.open(map, markers[i]);
          break;
       }
    }
}

function createMarker(markerData) {
    var connectLights;
    var SwitchLights;
    if (markerData["connectionStatus"] == "Connection") {
        connectLights = '#0000CC';
    } else {
        connectLights = '#666666'; 
    }

    if (markerData["status"] == "true") {
        SwitchLights = '#EEEE00';
    } else {
        SwitchLights = '#666666'; 
    }

    var marker = new google.maps.Marker({
        map: map,
        title:markerData["mac"],
        mac:markerData["mac"],
        deviceType: markerData.deviceType,
        remarks:markerData["remarks"],
        status:markerData["status"],
        connectionStatus:markerData["connectionStatus"],
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: SwitchLights,
            fillOpacity: 1,
            strokeColor: connectLights,
            strokeWeight: 3,
            scale: 6
        },
        position: new google.maps.LatLng(markerData["longitude"], markerData["latitude"])
    });
    return marker;
}

function addMarker(marker) {
    marker.addListener('click', clickMarker);
    if (marker.connectionStatus == 'Connection') {
        marker.addListener('dblclick', dblclickMarker);
    }
    markers.push(marker);
}

function showDeviceList() {
  markers=[];
  $.ajax({
      url: 'http://'+host+'/parse/classes/deviceList',
      type: 'get',
      contentType: "application/json;",
      headers: headers,
      success:function (data, textStatus, status) {
          var liststr = '';
          var NumOfJData = data['results'].length;
          var markList = new Array(NumOfJData);

          for (var i = 0; i < NumOfJData; i++) {
              deviceList.options[i] = new Option(data["results"][i]["mac"]+" "+data["results"][i]["deviceType"], data["results"][i]["mac"]);
              deviceList.selectedIndex = i;
              var marker =  createMarker(data["results"][i]);
              addMarker(marker);
          }
          setMapOnAll();
      },
      error: function(data, textStatus, errorThrown){
          alert("ERROR");
      }
  });
}

//-----
//點擊設備切換開及關
//-----
function switchDevice(marker) {
  var command;
  if(marker.status == "false") {
    command = "open";
  } 
  else
  {
    command = "close";
  }

  var josnStr = {
      "targetGateway": gateway,
      "targetDevice": marker.mac,
      "deviceType": marker.deviceType,
      "processingState": "wait",
      "command": command
    };
  $.ajax({
      url: 'http://'+host+'/parse/classes/cacheCommand',
      type: 'post',
      headers: headers,
      data : JSON.stringify(josnStr),
      success:function (status) {
          setTimeout('showDeviceList()',1000);
          alert(marker.deviceType + ' : ' + marker.mac + ' : ' + command);
      },
      error: function(data, textStatus, errorThrown){
          alert("ERROR");
      }
  });
}