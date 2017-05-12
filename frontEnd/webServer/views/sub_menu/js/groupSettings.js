function initialize() {
    initializeMap(25.048215,121.517123);
    getGroupList();
    showDevice();
    $(document).ready( function() {
        $('.groupColor').each( function() {
            $(this).minicolors({
                change: function(value, opacity) {
                    if( !value ) return;
                    if( opacity ) value += ', ' + opacity;
                    if( typeof console == 'object' ) {
                        console.log(value);
                    }
                }
            });
        });
    });
    
}

function leftClickMarker() {
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
            } else {
                for (var i = 0; i < numOfJData; i++) {
                    groupList.options[i] = new Option(data["results"][i]["groupName"]);
                    groupList.options[i].value = data["results"][i]["objectId"];
                    groupList.selectedIndex = i;
                }
            }
        }
    });
}

function addGroup() {
    var groupName = prompt("輸入 Group 名稱","");
    if( groupName != null) {
        groupName = groupName.trim();
        if( groupName != "" ) {
            var groupInformation = {
                groupName : groupName,
                groupColor : $(".groupColor").val(),
                groupMember : [
                ],
            };

            for( i=0; i<markers.length;i++) {
                if(markers[i].select == true) {
                    groupInformation.groupMember.push(markers[i].mac);
                }
            }
            sendPostRequestToREST("groupList", groupInformation, function(error, data, textStatus, status) { 
                if(error) { 
                    alert("error : " + error);
                } else {
                    alert(groupName +"設定成功.");
                    getGroupList();
                }
            });
        }
    }
}

function updateGroup() {
    var groupID='';
    var groupInformation = {
        groupColor : $(".groupColor").val(),
        groupMember : [
        ],
    };

    for( i=0; i<markers.length;i++) {
        if(markers[i].select == true) {
            groupInformation.groupMember.push(markers[i].mac);
        }
    }
    sendPutRequestToREST("groupList/"+groupList.value, groupInformation, function(error, data, textStatus, status) { 
        if(error) { 
            alert("error : " + error);
        } else {
            alert("更新成功.");
        }
    });
    
}