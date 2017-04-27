var headers = {
    'X-Parse-Application-Id' :  '19453386',
    'X-Parse-REST-API-Key' : '1234',
    'Content-Type' : 'application/json'
}
//處理地圖顯示
var geocoder;
var map, popup;
var markers = [];
function initialize() {
  geocoder = new google.maps.Geocoder();
  popup = new google.maps.InfoWindow();
  showDeviceList(deviceList);
  var latlng = new google.maps.LatLng(25.048215,121.517123);        // map center
  var mapOptions = {
    zoom: 18,
    center: latlng,
    disableDoubleClickZoom: true
  }
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
}

/*
function codeAddress() {
  var address = document.getElementById("address").value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      document.getElementById("lat").value=results[0].geometry.location.lat();
      document.getElementById("lng").value=results[0].geometry.location.lng();
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });
      showAddress(results[0], marker);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

  // 設定 marker 的訊息泡泡
function showAddress(result, marker) {
      var popupContent = result.formatted_address;
      popup.setContent(popupContent);
      popup.open(map, marker);
}
  
function getAddress() {
      var xPosition = new google.maps.LatLng(document.getElementById("lat2").value, document.getElementById("lng2").value)
      // 將經緯度透過 Google map Geocoder API 反查地址
      geocoder.geocode({
        'latLng': xPosition
      }, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
              if (results) {
                  document.getElementById("address2").value=results[0].formatted_address;
                  alert("ADD: " + results[0].formatted_address);
              }
          } else {
              alert("Reverse Geocoding failed because: " + status);
          }
      });
}
*/

function getMarkList() {

}

function addMark(mark) {
    var connectLights;
    if (mark.connection == "Connection") {
        connectLights = '#0000CC';
    } else {
        connectLights = '#666666'; 
    }

    var marker = new google.maps.Marker({
        map: map,
        title:mark.mac,
        mac:mark.mac,
        deviceType: mark.deviceType,
        remarks:mark.remarks,
        status:mark.status,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FFFFFF',
            fillOpacity: 1,
            strokeColor: connectLights,
            strokeWeight: 3,
            scale: 6
        },
        position: new google.maps.LatLng(mark.longitude, mark.latitude)
    });
    marker.addListener('click', clickMarker);
    marker.addListener('dblclick', dblclickMarker);
    markers.push(marker);
}

function clickMarker() {
    deviceList.value = this.mac;
    moveMapCenter(this.mac);
}

function dblclickMarker() {
    openDevice(this);
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
          popup.setContent(markers[i].remarks+" : "+ markers[i].status);
          popup.open(map, markers[i]);
          break;
       }
    }
}

function showDeviceList(deviceList) {
  $.ajax({
      url: "http://192.168.1.3:1337/parse/classes/deviceList",
      type: 'get',
      contentType: "application/json;",
      headers: headers,
      success:function (data, textStatus, status) {
          var liststr = '';
          var NumOfJData = data['results'].length;
          var markList = new Array(NumOfJData);

          for (var i = 0; i < NumOfJData; i++) {
              var index = deviceList.options.length;
              deviceList.options[index] = new Option(data["results"][i]["mac"]+" "+data["results"][i]["deviceType"], data["results"][i]["mac"]);
              deviceList.selectedIndex = index;
              var mark = 
              {
                  "mac"              :data["results"][i]["mac"],
                  "deviceType"  :data["results"][i]["deviceType"],
                  "latitude"        :data["results"][i]["latitude"],
                  "longitude"     :data["results"][i]["longitude"],
                  "remarks"       :data["results"][i]["remarks"],
                  "connection"  :data["results"][i]["connectionStatus"],
                  "status"           :data["results"][i]["status"]
              }
              addMark(mark);
          }
          setMapOnAll();
      },
      error: function(data, textStatus, errorThrown){
          alert("ERROR");
      }
  });
}

function openDevice(marker) {
  var josnStr = {
      "targetGateway": "HS000000000009",
      "targetDevice": marker.mac,
      "deviceType": marker.deviceType,
      "processingState": "wait",
      "command": "open"
    };
  $.ajax({
      url: "http://192.168.1.3:1337/parse/classes/cacheCommand",
      type: 'post',
      headers: headers,
      data : JSON.stringify(josnStr),
      success:function (status) {
          alert("OK");
      },
      error: function(data, textStatus, errorThrown){
          alert("ERROR");
      }
  });
}

function get() { 
    $.ajax({
        url: "http://192.168.1.3:1337/parse/classes/cacheCommand",
        type: 'get',
        contentType: "application/json;",
        headers: headers,
        data: 'where={"gatewayNumber":"HS000000000009"}',
        success:function (data, textStatus, status) {
          if (data["results"].length == 0) {
               alert("0");
          }else{
              alert("1");
          }
        },
        error: function(data, textStatus, errorThrown){
            alert("ERROR");
        }
    });
}