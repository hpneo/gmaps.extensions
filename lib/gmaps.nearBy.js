GMaps.prototype.nearBy = function(options) {
  var latlng = options.from || options.origin,
      within = options.within || options.radius,
      unit = options.unit || 'km',
      lat,
      lng,
      ordered_markers,
      filtered_markers = [];

  var toRadians = function(number) {
    return number * Math.PI / 180;
  };

  var getDistance = function(lat1, lng1, lat2, lng2, unit) {
    var earth_radius = 6371;

    if (unit == 'mi') {
      earth_radius = 3959;
    }

    lat1 = parseFloat(lat1);
    lat2 = parseFloat(lat2);

    lng1 = parseFloat(lng1);
    lng2 = parseFloat(lng2);

    var distance_lat = toRadians(lat2 - lat1);
    var distance_lng = toRadians(lng2 - lng1);

    lat1 = toRadians(lat1);
    lat2 = toRadians(lat2);

    var a = Math.sin(distance_lat / 2) * Math.sin(distance_lat / 2) + Math.sin(distance_lng / 2) * Math.sin(distance_lng / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = earth_radius * c;

    return distance;
  }

  if (latlng instanceof google.maps.LatLng) {
    lat = latlng.lat();
    lng = latlng.lng();
  }
  else {
    lat = latlng[0];
    lng = latlng[1];
  }

  ordered_markers = this.markers.slice(0).sort(function(a, b) {
    var position_a = a.getPosition();
    var position_b = b.getPosition();

    a.distance = getDistance(lat, lng, position_a.lat(), position_a.lng());
    b.distance = getDistance(lat, lng, position_b.lat(), position_b.lng());

    return a.distance - b.distance;
  });


  if (within != undefined) {
    for (var i = 0; i < ordered_markers.length; i++) {
      var marker = ordered_markers[i];
      
      if (marker.distance <= within) {
        filtered_markers.push(marker);
      }
    }
  }
  else {
    filtered_markers = ordered_markers;
  }

  return filtered_markers;
};