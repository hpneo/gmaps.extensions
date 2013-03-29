GMaps.prototype.loadFromGeoJSON = function() {
  var self = this;

  var addMarker = function(coordinates) {
    self.addMarker({
      lat: coordinates[1],
      lng: coordinates[0]
    });
  };

  var drawPolyline = function(coordinates) {
    var path = [],
        i = 0,
        coordinate;

    for (i = 0; i < coordinates.length; i++) {
      coordinate = coordinates[i];
      path.push([
        coordinate[1],
        coordinate[0]
      ]);
    }

    self.drawPolyline({
      path: path
    });
  };

  var drawPolygon = function(coordinates) {
    self.drawPolygon({
      useGeoJSON: true,
      paths: coordinates
    });
  };

  var addToMap = function(content) {
    switch (content.type) {
      case 'FeatureCollection':
        for(var i = 0; i < content.features.length; i++) {
          addToMap(content.features[i]);
        }
      break;
      case 'Feature':
        addToMap(content.geometry);
      break;
      case 'GeometryCollection':
        for(var i = 0; i < content.geometries.length; i++) {
          addToMap(content.geometries[i]);
        }
      break;
      case 'Point':
        addMarker(content.coordinates);
      break;
      case 'MultiPoint':
        for(var i = 0; i < content.coordinates.length; i++) {
          addMarker(content.coordinates[i]);
        }
      break;
      case 'LineString':
        drawPolyline(content.coordinates);
      break;
      case 'MultiLineString':
        for(var i = 0; i < content.coordinates.length; i++) {
          drawPolyline(content.coordinates[i]);
        }
      break;
      case 'Polygon':
        drawPolygon(content.coordinates);
      break;
      case 'MultiPolygon':
        for(var i = 0; i < content.coordinates.length; i++) {
          drawPolygon(content.coordinates[i]);
        }
      break;
    }
  };

  if (arguments[0].url) {
    var options = arguments[0],
        url = options.url;

    if ('jQuery' in window) {
      $.getJSON(url, function(content) {
        addToMap(content);
      });
    }
    else {
      // native xhr
      var xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);

      xhr.onload = function() {
        content = JSON.parse(xhr.responseText);
        addToMap(content);
      };

      xhr.send();
    }
  }
  else {
    var content = arguments[0],
        options = arguments[1];

    addToMap(content);
  }
};

GMaps.prototype.toJSON = function() {
  var self = this;
  var json = {
    type : 'FeatureCollection',
    features : []
  };

  for (var i = 0; i < self.markers.length; i++) {
    var position = self.markers[i].getPosition();

    json.features.push({
      type : 'Feature',
      geometry : {
        type : 'Point',
        coordinates : [ position.lng(), position.lat() ],
        properties : self.markers[i].details
      }
    });
  }

  for (var i = 0; i < self.polylines.length; i++) {
    var path = self.polylines[i].getPath();
    var original_path = [];

    // LineString
    if (path.getAt(0).lat) {
      for (var j = 0; j < path.getLength(); j++) {
        original_path.push([
          path.getAt(j).lng(),
          path.getAt(j).lat()
        ]);
      }

      json.features.push({
        type : 'Feature',
        geometry : {
          type : 'LineString',
          coordinates : original_path
        }
      });
    }
    // MultiLineString
    else {
      for (var j = 0; j < path.getLength(); j++) {
        var inner_path = [];

        for (var k = 0; k < path.getAt(j).getLength(); k++) {
          inner_path.push([
            path.getAt(j).getAt(k).lng(),
            path.getAt(j).getAt(k).lat()
          ]);
        }

        original_path.push(inner_path);
      }

      json.features.push({
        type : 'Feature',
        geometry : {
          type : 'MultiLineString',
          coordinates : original_path
        }
      });
    }
  }

  for (var i = 0; i < self.polygons.length; i++) {
    var paths = self.polygons[i].getPaths();

    for (var p = 0; p < paths.getLength(); p++) {
      var path = paths.getAt(p);
      var original_path = [];

      // Polygon
      if (path.getAt(0).getAt(0).lat) {
        for (var j = 0; j < path.getLength(); j++) {
          var inner_path = [];
          
          for (var k = 0; k < path.getAt(j).getLength(); k++) {
            inner_path[j].push([
              path.getAt(j).getAt(k).lng(),
              path.getAt(j).getAt(k).lat()
            ]);
          }

          original_path.push(inner_path);
        }

        json.features.push({
          type : 'Feature',
          geometry : {
            type : 'Polygon',
            coordinates : original_path
          }
        });
      }
      // MultiPolygon
      else {
        for (var j = 0; j < path.length; j++) {
          var inner_path = [];

          for (var k = 0; k < path[j].length; k++) {
            var inner_path_2 = [];

            for (var l = 0; l < path[j][k].length; l++) {
              inner_path_2.push([
                path.getAt(j).getAt(k).getAt(l).lng(),
                path.getAt(j).getAt(k).getAt(l).lat()
              ]);
            }

            inner_path.push(inner_path_2);
          }

          original_path.push(inner_path);
        }

        json.features.push({
          type : 'Feature',
          geometry : {
            type : 'MultiPolygon',
            coordinates : original_path
          }
        });
      }
    }
  }

  return json;
};