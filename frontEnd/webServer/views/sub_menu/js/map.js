var geocoder;
var map, popup;
var markers = [];

var myStyles = [
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    }
];

function initializeMap(centerLatitude, centerLongitude) {
    geocoder = new google.maps.Geocoder();
    popup = new google.maps.InfoWindow();
    var latlng = new google.maps.LatLng(centerLatitude,centerLongitude);        // map center
    var mapOptions = {
        zoom: 18,
        center: latlng,
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        streetViewControl: false,
        styles: myStyles
    }
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
}

function clearMarkers() {
    setMapOnAll(null);
    markers = [];
}

function setMarkerToMap(marker, mapTarget) {
    marker.setMap(mapTarget);
}

function setMapOnAll(mapTarget) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(mapTarget);
    }
}

function moveMapCenter(mac) {
    for (var i = 0; i < markers.length; i++) {
       if(markers[i].mac == mac) {
          map.panTo(markers[i].position);
          //popup.setContent(markers[i].remarks);
          //popup.open(map, markers[i]);
          break;
       }
    }
}