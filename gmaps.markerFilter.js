GMaps.prototype.markerFilter = function(conditions) {
  var filtered_markers = [], i = 0, detail, marker;

  for (i = 0; i < this.markers.length; i++) {
    marker = this.markers[i];

    if (conditions instanceof Array) {
      if (conditions.indexOf(marker.detail.id) > -1) {
        filtered_markers.push(marker);
      }
    }

    else if (conditions instanceof Function) {
      if (conditions.call(marker.detail) === true) {
        filtered_markers.push(marker);
      }
    }

    else if (conditions instanceof Object) {
      for (var c in conditions) {
        if (marker.detail[c] == conditions[c]) {
          filtered_markers.push(marker);
          break;
        }
      }
    }
  }

  return filtered_markers;
};