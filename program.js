var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var setpos = false;
var pos;
var start;
var waypts = [];
var mapPage=0;
var posMarker;
var bookmarks=[1,2,3,4,5,6,7,8,9];
Parse.initialize("Bzt9uDt1PFnDVO0Y7kx8XyR0EHKbxKU7VqivOnko", "8fk0zhEQCeEnbXNBpyQdhIxZTpIrfxcMNK9QCutF");
var user = new Parse.User();
var username=prompt('enter username');
var password = prompt('enter password');
user.set("username", username);
console.log('pass');
user.set("password", password);
user.signUp(null, {
  success: function(user) {
    // Hooray! Let them use the app now.
  },
  error: function(user, error) {
    // Show the error message somewhere and let the user try again.
    alert("Error: " + error.code + " " + error.message);
  }
}); 
function checkInvites(){
  var invite = Parse.Object.extend("sessions");
  var query = new Parse.Query(invite);
  query.equalTo("user", "bubbba");
  query.find({
    success: function(results) {
      console.log("Successfully retrieved " + results.length + " scores.");
      // Do something with the returned Parse.Object values
      for (var i = 0; i < results.length; i++) {
        var object = results[i];
        //console.log('object.id + ' - ' + object.get(\'user\')');
		var items = document.getElementById("bookmarks");
		var item = document.createElement("li");
		item.innerHTML = object.get('user')+' '+ object.id;
		items.appendChild(item);
		var btn = document.createElement("BUTTON");        // Create a <button> element
		var t = document.createTextNode("accept");       // Create a text node
		btn.appendChild(t);   		// Append the text to <button>
		btn.id=object.id;
		items.appendChild(btn);
      }
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
}
setInterval('checkInvites()',10000);
var GameScore = Parse.Object.extend("GameScore");
var gameScore = new GameScore();
gameScore.save(null, {
  success: function(gameScore) {
    // Execute any logic that should take place after the object is saved.
    alert('New object created with objectId: ' + gameScore.id);
  },
  error: function(gameScore, error) {
    // Execute any logic that should take place if the save fails.
    // error is a Parse.Error with an error code and message.
    alert('Failed to create new object, with error code: ' + error.message);
  }
});

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var chicago = new google.maps.LatLng(41.850033, -87.6500523);
  var mapOptions = {
    zoom: 6,
    center: chicago
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      var infowindow = new google.maps.InfoWindow({
        map: map,
        position: pos,
        content: 'Location found using HTML5.'
      });

      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}
function addWay(){
  var selectedMode = document.getElementById('mode').value;
  if(selectedMode!='TRANSIT'){
  waypts.push({location:document.getElementById('waypoints').value,stopover:true});
}
else{
  waypts.push(document.getElementById('waypoints').value)
}
  alert("added: " + document.getElementById('waypoints').value);
  for(var i = 0; i<waypts.length;i++){
    console.log(waypts[i]);
  }
  console.log("worked THANK BEJEEBUS");
}
function calcRoute() {
  console.log("started");
  posMarker=null;
  var selectedMode = document.getElementById('mode').value;
  if (setpos===false){
  start = document.getElementById('start').value;
  }
  var end = document.getElementById('end').value;
  if(selectedMode!= 'TRANSIT'){
    var request = {
      origin: start,
      destination: end,
      waypoints: waypts,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode[selectedMode]
    };
  }
 /* else{
     var request = {
      origin: start,
      destination: end,
      waypoints: waypts,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode[selectedMode]
    };   
}*/
 else if(mapPage===0){
  console.log('1st to 2nd');
    var request = {
      origin: start,
      destination: waypts[0],
      travelMode: google.maps.TravelMode[selectedMode]
    };
  }
  else if(mapPage===waypts.length){
    console.log('end');
    var request = {
      origin: waypts[waypts.length-1],
      destination: end,
      travelMode: google.maps.TravelMode[selectedMode]
    };
  }
  else {
    console.log('middle');
    var request = {
      origin: waypts[mapPage-1],
      destination: waypts[mapPage],
      travelMode: google.maps.TravelMode[selectedMode]
    };
  }


  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
      var summaryPanel = document.getElementById('directions_panel');
      summaryPanel.innerHTML = '';
      // For each route, display summary information.
      for (var i = 0; i < route.legs.length; i++) {
        var routeSegment = i + 1;
        summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment + '</b><br>';
        summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
        summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
        summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
      }
    }
  });
}
function setCurrentPos(){
  setpos=!setpos;
  if(setpos===true){
    start = pos;
  }
  console.log(start);
  console.log("pos set");
  posMarker = new google.maps.Marker({
      position: pos,
      map: map,
      title: 'Your Pos'
  });
}
function nextPage(){
  if(mapPage!=waypts.length+1){
    mapPage++;
    calcRoute();
  }
}
function backPage(){
  if(mapPage!= 0){
  mapPage--;
  calcRoute();
  }
}
function addBookmarks(){
    var items = document.getElementById("bookmarks");
    var item = document.createElement("li");
    item.innerHTML = document.getElementById('bookmarkTxt').value;
    items.appendChild(item);
}
google.maps.event.addDomListener(window, 'load', initialize);