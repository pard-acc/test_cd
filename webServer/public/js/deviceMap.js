//處理地圖顯示
var geocoder;
var map, popup;
function initialize() {

  geocoder = new google.maps.Geocoder();
  popup = new google.maps.InfoWindow();

  var latlng = new google.maps.LatLng(25.1023602,121.5463038);        // map center
  var mapOptions = {
    zoom: 16,
    center: latlng
  }
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
}


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
              }
          } else {
              alert("Reverse Geocoding failed because: " + status);
          }
      });
}
