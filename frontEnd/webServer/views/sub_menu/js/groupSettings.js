function initialize() {
    initializeMap(25.048215,121.517123);
    getGroupList();
    /*
    $(document).ready( function() {
        $('.demo').each( function() {
            $(this).minicolors({
                change: function(value, opacity) {
                    if( !value ) return;
                    if( opacity ) value += ', ' + opacity;
                    if( typeof console === 'object' ) {
                        console.log(value);
                    }
                }
            });
        });
    });
    */
}

function leftClickMarker() {
    //moveMapCenter(this.mac);
    popup.setContent(this.remarks);
    popup.open(map, this);
}

function rightClickMarker() {
     if(this.select == false) {
        this.icon.strokeColor = '#CC0000';
        this.select = true;
     } else {
         this.icon.strokeColor = '#666666';
        this.select = false;
     }
     setMarkerToMap(this, map);
}

function createMarker(markerData) {
    var connectLights;
    var switchLights;
    connectLights = '#666666'; 
    switchLights = '#EEEE00';

    var marker = new google.maps.Marker({
        map: map,
        draggable:true,
        title:markerData["mac"],
        mac:markerData["mac"],
        deviceType: markerData.deviceType,
        remarks:markerData["remarks"],
        status:markerData["status"],
        connectionStatus:markerData["connectionStatus"],
        select:false,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: switchLights,
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
    marker.addListener('click', leftClickMarker);
    marker.addListener('rightclick', rightClickMarker);
    markers.push(marker);
}

function showDevice() {
    sendGetRequestToREST("deviceList","", function(error, data, textStatus, status) {
        if(error) {
            alert("error : " + error);
        } else {
            var liststr = '';
            var NumOfJData = data['results'].length;
            var markList = new Array(NumOfJData);
            clearMarkers();
            for (var i = 0; i < NumOfJData; i++) {
                var marker =  createMarker(data["results"][i]);
                addMarker(marker);
            }
            setMapOnAll(map);
        }
    });
}

function getGroupList() {
    sendGetRequestToREST("groupList","", function(error, data, textStatus, status) {
        if(error) { 
            alert("error : " + error);
        } else {
            var numOfJData = data['results'].length;
            if(numOfJData == 0) {
                    groupList.options[0] = new Option("Have Not Group");
                    groupList.selectedIndex = 0;
                    showDevice();
            } else {
                for (var i = 0; i < numOfJData; i++) {
                    groupList.options[i] = new Option(data["results"][i]["mac"]+" "+data["results"][i]["deviceType"], data["results"][i]["mac"]);
                    groupList.selectedIndex = i;
                }
            }
        }
    });
}

function setGroup() {
    var groupName = prompt("輸入 Group 名稱","");
    if( groupName != null) {
        groupName = groupName.trim();
        if( groupName != "" ) {
            alert(groupName +"設定成功." + $(".groupColor").val());
        }
    }
}

function saveCoordinates() {

  /*
    var s="", longitude, latitude;
    var t="";
    alert('XXXX : '+markers[0].position.lng());
    alert('XXXX : '+markers[0].position.lat());
    */
   // showDevice();
  /*
    for (var i = 0; i < markers.length; i++) {
          longitude = s[0];
          latitude = s[1];
          t +=  markers[i].mac + " "+longitude+" : "+latitude;
          t += "\n";
    }
    sendRequest();
    alert('t : '+t);
    */
    
}
