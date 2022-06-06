
var lateness_1_max = 3;
var lateness_2_max = 6;
var lateness_3_max = 10;

// ----------------------------------------//
//              Marker colors             //

var marker_default = {
  radius: 5,
  fillColor: "#000000",
  color: "#000000", //black
  weight: 1,
  opacity: 1,
  fillOpacity: 1,
};

var marker_late_1 = {
radius: 5,
fillColor: "#21b824", //green
color: "#000000",
weight: 1,
opacity: 0.1,
fillOpacity: 0.8,
}

var marker_late_2 = {
radius: 5,
fillColor: "#ffff00", //yellow
color: "#000000",
weight: 1,
opacity: 0.4,
fillOpacity: 0.8,
}

var marker_late_3 = {
radius: 5,
fillColor: "#f28816", //orange
color: "#000000",
weight: 1,
opacity: 0.4,
fillOpacity: 0.8,
}

var marker_late_4 = {
radius: 5,
fillColor: "#ff0000", //red
color: "#000000",
weight: 2,
opacity: 1,
fillOpacity: 0.8
}

var marker_error = {
icon: L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  className: 'blinking' // Look at CSS that makes it blink
})
}
// ----------------------------------- //



// ----------------------------------- //
//              Create map             //

// Center of Luxembourg when looking on a map
let LUX_CENTER_POS = [49.8142371307, 6.098083879]

var map = L.map("map").setView(LUX_CENTER_POS, 10);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                minZoom: 1,
                zoomControl: true,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: 'pk.eyJ1IjoiM3FoNCIsImEiOiJja3NqYW53NXQxc2l2Mm5vZmF0cGVydnYxIn0.TF0GeHY58O9gdLTT88Sb0g'
            }).addTo(map);



// ----------------------------------- //
//                 Logic               //

var markers_green = new L.layerGroup();
var markers_yellow = new L.layerGroup();
var markers_orange = new L.layerGroup();
var markers_red = new L.layerGroup();
var markers_others = new L.layerGroup();

const busstops = [];

function update_markers() {
  L.geoJSON(buses,{
    onEachFeature: onEachFeature,
    pointToLayer: function(feature, latlng) {
      if (feature.properties.late <= lateness_1_max) {
        var marker = L.circleMarker(latlng, marker_late_1).addTo(markers_green);
      }
      else if (feature.properties.late > lateness_1_max && feature.properties.late <= lateness_2_max) {
        var marker =  L.circleMarker(latlng, marker_late_2).addTo(markers_yellow);
      }
      else if (feature.properties.late > lateness_2_max && feature.properties.late <= lateness_3_max) {
        var marker = L.circleMarker(latlng, marker_late_3).addTo(markers_orange);
      }
      else if (feature.properties.late > lateness_3_max) {
        var marker = L.circleMarker(latlng, marker_late_4)
        markers_red.addLayer(marker);
      }
      else if (feature.properties.late == "ERROR") {
        //var marker = L.marker(latlng, marker_error); //Produces huge lags if lots of Errors
        var marker = L.circleMarker(latlng, marker_default).addTo(markers_others);
      }

      else {
        //var marker = L.circleMarker(latlng, marker_default).addTo(markers_others);
        var marker = L.circleMarker(latlng, marker_default).addTo(markers_others);
      };
      //console.log(marker);
      busstops.push(latlng);
      return marker;
    },
  })

  function onEachFeature(feature, layer) {
    var popupContent = feature.properties.name;

    if (!(feature.properties.late == "ERROR")) {
      layer.bindTooltip("<center>" + popupContent + "<br> Id: " + feature.properties.id + "<br> Late: " + feature.properties.late + " minutes </center>");
    }
    else if (feature.properties.late == "ERROR") {
      layer.bindTooltip("<center>" + popupContent + "<br> Id: " + feature.properties.id + "<br> Late: " + feature.properties.late + " minutes </center><br> Coordinates:" + feature.geometry.coordinates);
    }
  }

  markers_green.addTo(map)
  markers_yellow.addTo(map)
  markers_orange.addTo(map)
  markers_red.addTo(map)
  markers_others.addTo(map)
}

//update_markers()
var intervalId = window.setInterval(function(){
  update_markers();
  
  //L.geoJSON(buses).addTo(map);
}, 2000); //equals 30 seconds

/*var line = L.polyline(L.geoJSON(route_222))
animatedMarker = L.animatedMarker(line.getLatLngs());
map.addLayer(animatedMarker);
function abs(){
  var myMovingMarker = L.Marker.movingMarker([[49.61070993807422, 6.13861083984375],[49.624500843559666,6.04969024658203]],
    [20000], {"color":"red"}).addTo(map);
  myMovingMarker.start();
}

function createMovingMarker() {
  L.geoJSON(route_222, {
    onEachFeature: function(feature, latlng) {
      newMovingMarker = L.Marker.movingMarker([[feature.geometry.coordinates[0][0][1], feature.geometry.coordinates[0][0][0]], [feature.geometry.coordinates[50][0][1],feature.geometry.coordinates[50][0][0]]], [30000], {"color": "#000000","fillcolor":"#00000"}).addTo(map);
      newMovingMarker.start();
    }
  })
}

abs()
createMovingMarker()

async function bus_move() {
  await update_markers();
  console.log(busstops[0]);
  newMovingMarker = L.Marker.movingMarker(busstops,[5000]).addTo(map);


  busstops.forEach(add_stop);
  function add_stop(stop, index, array) {
    if (index!=0){
      newMovingMarker.addLatLng([stop], [2000]);
    }
  };

  newMovingMarker.start();
}

bus_move();

function new_bus() {
  console.log(bus);
  stops = bus["222"];
  newMovingMarker = L.Marker.movingMarker([stops[0], stops[stops.length-1]], [20000]).addTo(map);

  stops.forEach(add_latlng);
  function add_latlng(stop, index, array){
    if (index!=0 && index!=stops.length-1) {
      newMovingMarker.addLatLng(stop, [2000]);
    }
  }

  newMovingMarker.start();
}

new_bus();

var today = new Date();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
console.log(time)
*/


// Distance between 2 coordinates
//  https://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
//  http://www.movable-type.co.uk/scripts/latlong.html

function toRad(angle) {
  return angle * Math.PI / 180;
}
function calc_distance(point1, point2) {
  var R = 6371;
  var lat1 = point1[0];
  var lon1 = point1[1];
  var lat2 = point2[0];
  var lon2 = point2[1];
  var x1 = lat2-lat1;
  var x2 = lon2-lon1;
  var dLat = toRad(x1);
  var dLon = toRad(x2);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon/2) * Math.sin(dLon/2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var distance = R * c;

  return distance * 1000
}
// Distance //


// Time difference
function time_diff(time1, time2) {
  var t1 = new Date("01/01/2021/" + time1);
  //console.log(t1);
  var t2 = new Date("01/01/2021/" + time2);
  var divider = 1;
  var time_difference = (Math.abs(t1-t2)/divider);

  return time_difference
}
a = time_diff("10:00:00", "10:00:30");
console.log(a);
// Time difference //


function Bus() {
  //console.log(Object.keys(buslines));
  buslines_keys = Object.keys(buslines);

  buslines_keys.forEach(create_busline);

  function create_busline(busline_name) {
    //console.log(busline_name);
    busline_stops = buslines[busline_name]["stops"];  // returns a dict: {"StopPoint" : ["Stopname", [lat, lng]]}
    busline_timetable = buslines[busline_name]["timetable"]; // returns a nested list: [["StopPoint", "HH:MM:SS"], ["StopPoint", "HH:MM:SS"]]

    first_stop = busline_stops[busline_timetable[0][0]][1];
    last_stop = busline_stops[busline_timetable[busline_timetable.length-1][0]][1];
    //console.log(first_stop);
    //console.log(last_stop);
    time = time_diff(busline_timetable[0][1], busline_timetable[busline_timetable.length-1][1]);

    movingBusMarker = new L.Marker.movingMarker([[first_stop[1], first_stop[0]], [last_stop[1], last_stop[0]]], [1]).addTo(map);
    movingBusMarker.bindTooltip(busline_name);
    
    busline_timetable.forEach(create_way);

    function create_way(stoppoint, index) {
      if (index !=0 && index !=busline_timetable.length-1) {
        //console.log(stoppoint[0]);
        stoppoint_name = stoppoint[0];
        stoppoint_coordinates = busline_stops[stoppoint_name][1];
        //console.log(stoppoint_coordinates);
        stoppoint_before = busline_timetable[index-1][0];
        before_coords = busline_stops[stoppoint_before][1];
        distance = calc_distance(before_coords, stoppoint_coordinates);
        time = time_diff(stoppoint[1], busline_timetable[index-1][1])
        //speed = distance * 6
        movingBusMarker.addLatLng([stoppoint_coordinates[1], stoppoint_coordinates[0]], [time]);
      }  //neither last nor first
    };

    movingBusMarker.start();

  }
}

Bus();


// 340 11min
// time matches