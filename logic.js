// Store API key Query
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    createFeatures(data.features);
    console.log(data.features)
});

function createFeatures(earthquakeData) {
    // define function and create a pop up for specific selection
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // function to create circle radius
    function radiusSize(magnitude) {
        return magnitude * 15500;
    }

    // Define function to set the circle color based on the magnitude
    function circleColor(magnitude) {
        if (magnitude < 1) {
            return "#ccff33"
        } else if (magnitude < 2) {
            return "#ffff33"
        } else if (magnitude < 3) {
            return "#ffcc33"
        } else if (magnitude < 4) {
            return "#ff9933"
        } else if (magnitude < 5) {
            return "#ff6633"
        } else {
            return "#ff3333"
        }
    }
    // create geojson layer with reseize and color
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (earthquakeData, latlng) {
            return L.circle(latlng, {
                radius: radiusSize(earthquakeData.properties.mag),
                color: circleColor(earthquakeData.properties.mag),
                fillOpacity: 1
            });
        },
        onEachFeature: onEachFeature
    });

    // create map
    createMap(earthquakes);
}
function createMap(earthquakes) {

    // streetmap and darkmap 
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // define basemaps
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // overlay the map
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // create maps/layers
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // layer controller with overlay
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // legend color function
    function getColor(d) {
        return d > 5 ? '#ff3333' :
            d > 4 ? '#ff6633' :
                d > 3 ? '#ff9933' :
                    d > 2 ? '#ffcc33' :
                        d > 1 ? '#ffff33' :
                            '#ccff33';
    }
    //legned to map
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            mags = [0, 1, 2, 3, 4, 5],
            labels = [];
        // Density loop.label
        div.innerHTML += "<h3>Magnitude</h3>"
        for (var i = 0; i < mags.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
                mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
}