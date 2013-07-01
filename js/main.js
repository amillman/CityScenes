// Generated by CoffeeScript 1.6.3
(function() {
  var DataFetcher, DestinationPoint, Display, Map, Navigator, Station, Waypoint, initialize, loadWeather, markers,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    _this = this;

  Waypoint = (function() {
    function Waypoint(lat, lng, title, description, icon, shadow) {
      this.title = title;
      this.description = description != null ? description : "";
      this.icon = icon;
      this.shadow = shadow;
      this.location = new google.maps.LatLng(lat, lng);
    }

    Waypoint.prototype.show = function(map) {
      var marker, options;
      options = {
        position: this.location,
        map: map.gmap,
        title: this.title,
        icon: this.icon,
        shadow: this.shadow
      };
      marker = new google.maps.Marker(options);
      return marker;
    };

    return Waypoint;

  })();

  Station = (function(_super) {
    __extends(Station, _super);

    function Station(station) {
      var thisMarker;
      if (station.availableBikes > 0 && station.statusValue === "In Service") {
        thisMarker = markers.circle("green");
        this.available = true;
      } else {
        thisMarker = markers.circle("red");
        this.available = false;
      }
      Station.__super__.constructor.call(this, station.latitude, station.longitude, station.stationName, "", thisMarker);
    }

    return Station;

  })(Waypoint);

  DestinationPoint = (function(_super) {
    __extends(DestinationPoint, _super);

    function DestinationPoint(type, item) {
      this.type = type;
      DestinationPoint.__super__.constructor.call(this, item.latitude, item.longitude, item.title, item.description, markers.goldStar);
    }

    return DestinationPoint;

  })(Waypoint);

  DataFetcher = (function() {
    function DataFetcher() {}

    DataFetcher.stations = [];

    DataFetcher.destinations = [];

    DataFetcher.prototype.fetch = function(callback) {
      var _this = this;
      return this._fetchStations(function(err, data) {
        _this.stations = data;
        return _this._fetchDestinations(function(err, destinations, destinationTypes) {
          _this.destinations = destinations;
          _this.destinationTypes = destinationTypes;
          return callback(null, {
            stations: _this.stations,
            destinations: _this.destinations,
            destinationTypes: _this.destinationTypes
          });
        });
      });
    };

    DataFetcher.prototype.show = function(map) {
      var destinationArray, destinationClusterer, p, stationArray;
      stationArray = (function() {
        var _i, _len, _ref, _results;
        _ref = this.stations;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          p = _ref[_i];
          _results.push(p.show(map));
        }
        return _results;
      }).call(this);
      destinationArray = (function() {
        var _i, _len, _ref, _results;
        _ref = this.destinations;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          p = _ref[_i];
          _results.push(p.show(map));
        }
        return _results;
      }).call(this);
      return destinationClusterer = new MarkerClusterer(map.gmap, destinationArray);
    };

    DataFetcher.prototype._fetchStations = function(callback) {
      return $.getJSON('bikedata/index.php', function(data) {
        var stationData, stationPoint, stationPoints, _i, _len, _ref;
        stationPoints = [];
        _ref = data.stationBeanList;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          stationData = _ref[_i];
          stationPoint = new Station(stationData);
          stationPoints.push(stationPoint);
        }
        return callback(null, stationPoints);
      });
    };

    DataFetcher.prototype._fetchDestinations = function(callback) {
      var _this = this;
      return $.getJSON('locations/index.php', function(data) {
        return async.concat(data, _this._fetchDestinationFile, function(err, results) {
          var i;
          return callback(err, results, (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              i = data[_i];
              _results.push(i.slice(0, -4));
            }
            return _results;
          })());
        });
      });
    };

    DataFetcher.prototype._fetchDestinationFile = function(filename, callback) {
      var type,
        _this = this;
      type = filename.slice(0, -4);
      return $.get('locations/' + filename, function(data) {
        return $.csv.toObjects(data, {}, function(err, data) {
          var item, itemWaypoint, waypoints, _i, _len;
          waypoints = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            item = data[_i];
            itemWaypoint = new DestinationPoint(type, item);
            waypoints.push(itemWaypoint);
          }
          return callback(null, waypoints);
        });
      });
    };

    return DataFetcher;

  })();

  markers = {
    film: "img/noun_project_16712.png",
    circle: function(color) {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 0.8,
        scale: 5,
        strokeWeight: 3,
        strokeColor: "white"
      };
    },
    goldStar: {
      path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
      fillColor: "yellow",
      fillOpacity: 0.8,
      scale: 0.07,
      strokeColor: "gold",
      strokeWeight: 3
    }
  };

  loadWeather = function() {
    var feedUrl, jsonUrl;
    feedUrl = "http://weather.yahooapis.com/forecastrss?w=12761716&u=f";
    jsonUrl = "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=" + encodeURIComponent(feedUrl) + "&callback=?";
    return $.getJSON(jsonUrl, function(data) {
      var match, re, weatherString;
      weatherString = data.responseData.feed.entries[0].contentSnippet;
      re = /Current Conditions:\n(.*?)\n/;
      match = weatherString.match(re);
      $("#weather").text(match[1]);
      match[1] = match[1].toLowerCase();
      if (match[1].indexOf("fair") !== -1 || match[1].indexOf("sunny") !== -1 || match[1].indexOf("hot") !== -1 || match[1].indexOf("clear") !== -1) {
        return $(".weather-icon").attr('id', 'ico-sun');
      } else if (match[1].indexOf("rain") !== -1 || match[1].indexOf("shower") !== -1 || match[1].indexOf("drizzle") !== -1) {
        return $(".weather-icon").attr('id', 'ico-rain');
      } else if (match[1].indexOf("thunder") !== -1) {
        return $(".weather-icon").attr('id', 'ico-thunder');
      } else if (match[1].indexOf("snow") !== -1) {
        return $(".weather-icon").attr('id', 'ico-snow');
      } else {
        return $(".weather-icon").attr('id', 'ico-cloud');
      }
    });
  };

  Navigator = (function() {
    function Navigator(map, stations, destinations, destinationTypes) {
      var i, options, _i, _len, _ref;
      this.map = map;
      this.stations = stations;
      this.destinations = destinations;
      this.destinationTypes = destinationTypes;
      this.geocoder = new google.maps.Geocoder();
      this.directionsDisplays = [];
      _ref = [0, 1, 2];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        options = {};
        if (i === 0 || i === 2) {
          options.preserveViewport = true;
        }
        this.directionsDisplays[i] = new google.maps.DirectionsRenderer(options);
        this.directionsDisplays[i].setMap(this.map.gmap);
      }
    }

    Navigator.prototype._directions = function(options, callback) {
      var directionsService;
      directionsService = new google.maps.DirectionsService();
      return directionsService.route(options, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          console.log("Direction Result", result);
          return callback(null, result);
        }
      });
    };

    Navigator.prototype._distance = function(LatLng1, LatLng2) {
      return Math.pow(LatLng1.lat() - LatLng2.lat(), 2) + Math.pow(LatLng1.lng() - LatLng2.lng(), 2);
    };

    Navigator.prototype._distance_raw = function(a, b) {
      return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);
    };

    Navigator.prototype._LatLng_to_raw = function(LatLng) {
      return [LatLng.lat(), LatLng.lng()];
    };

    Navigator.prototype._sort_array_by_distance = function(array) {
      var compare;
      compare = function(a, b) {
        if (a[0] < b[0]) {
          return -1;
        }
        if (a[0] > b[0]) {
          return 1;
        }
        return 0;
      };
      array.sort(compare);
      return array;
    };

    Navigator.prototype.geocode = function(address, callback) {
      return this.geocoder.geocode({
        address: address
      }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          return callback(null, results[0].geometry.location);
        }
      });
    };

    Navigator.prototype.nearestStation = function(location) {
      var distance, minDistance, nearest, station, _i, _len, _ref;
      minDistance = Infinity;
      nearest = null;
      _ref = this.stations;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        station = _ref[_i];
        if (station.available) {
          distance = this._distance(station.location, location);
          if (distance < minDistance) {
            nearest = station;
            minDistance = distance;
          }
        }
      }
      return nearest;
    };

    Navigator.prototype._nearestDestinations = function(path, count, types) {
      var a, all, availableDestinations, destination, i, list, point, sortedDestinations, uniqueDestinations, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1;
      availableDestinations = [];
      _ref = this.destinations;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        destination = _ref[_i];
        if (_ref1 = destination.type, __indexOf.call(types, _ref1) >= 0) {
          availableDestinations.push(destination);
        }
      }
      console.log("availableDestinations", availableDestinations);
      all = [];
      for (_j = 0, _len1 = path.length; _j < _len1; _j++) {
        point = path[_j];
        a = [point.jb, point.kb];
        list = [];
        for (_k = 0, _len2 = availableDestinations.length; _k < _len2; _k++) {
          destination = availableDestinations[_k];
          list.push([this._distance_raw(a, this._LatLng_to_raw(destination.location)), destination]);
        }
        list = this._sort_array_by_distance(list).slice(0, +count + 1 || 9e9);
        all = all.concat(list);
      }
      sortedDestinations = (function() {
        var _l, _len3, _ref2, _results;
        _ref2 = this._sort_array_by_distance(all);
        _results = [];
        for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
          i = _ref2[_l];
          _results.push(i[1]);
        }
        return _results;
      }).call(this);
      console.log("sortedDestinations", sortedDestinations);
      uniqueDestinations = [];
      for (_l = 0, _len3 = sortedDestinations.length; _l < _len3; _l++) {
        destination = sortedDestinations[_l];
        if (__indexOf.call(uniqueDestinations, destination) < 0 && uniqueDestinations.length < count) {
          uniqueDestinations.push(destination);
        }
      }
      console.log("uniqueDestinations", uniqueDestinations);
      return uniqueDestinations;
    };

    Navigator.prototype._destinationsToDirectionsWaypoints = function(destinations) {
      var i;
      return (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = destinations.length; _i < _len; _i++) {
          i = destinations[_i];
          _results.push({
            location: i.location
          });
        }
        return _results;
      })();
    };

    Navigator.prototype.calculate = function(start, end, destinationCount, userDestinationTypes, callback) {
      var _this = this;
      return this.geocode(start, function(err, location) {
        var startLoc;
        startLoc = location;
        return _this.geocode(end, function(err, location) {
          var endLoc, endStation, options, startStation;
          endLoc = location;
          startStation = _this.nearestStation(startLoc);
          endStation = _this.nearestStation(endLoc);
          options = {
            origin: startStation.location,
            destination: endStation.location,
            travelMode: google.maps.TravelMode.BICYCLING
          };
          return _this._directions(options, function(err, result) {
            var DirectionsWaypoints, destinations;
            destinations = _this._nearestDestinations(result.routes[0].overview_path, destinationCount, userDestinationTypes);
            console.log("Destinations", destinations);
            DirectionsWaypoints = _this._destinationsToDirectionsWaypoints(destinations);
            console.log("DirectionsWaypoints", DirectionsWaypoints);
            options = [];
            options.push({
              origin: startLoc,
              destination: startStation.location,
              travelMode: google.maps.TravelMode.WALKING
            });
            options.push({
              origin: startStation.location,
              destination: endStation.location,
              travelMode: google.maps.TravelMode.BICYCLING,
              optimizeWaypoints: true,
              waypoints: DirectionsWaypoints
            });
            options.push({
              origin: endStation.location,
              destination: endLoc,
              travelMode: google.maps.TravelMode.WALKING
            });
            console.log("Directions Options", options);
            return async.map(options, _this._directions, function(err, results) {
              console.log("Directions Results", results);
              _this._print(results, startStation, destinations, endStation);
              return callback(null, result);
            });
          });
        });
      });
    };

    Navigator.prototype._print = function(results, startStation, destinations, endStation) {
      var i, midTitles, titles, total_time, _i, _j, _len, _len1, _ref, _ref1, _results;
      $(".directions").html("");
      titles = [];
      titles.push(["Start", startStation.title]);
      midTitles = [startStation.title].concat((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = destinations.length; _i < _len; _i++) {
          i = destinations[_i];
          _results.push(i.title);
        }
        return _results;
      })());
      midTitles.push(endStation.title);
      titles.push(midTitles);
      titles.push([endStation.title, "End"]);
      total_time = 0;
      _ref = [0, 1, 2];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        total_time += this._routeTime(results[i]);
      }
      this._printTime(total_time);
      _ref1 = [0, 1, 2];
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        i = _ref1[_j];
        this._printRoute(results[i], titles[i]);
        _results.push(this.directionsDisplays[i].setDirections(results[i]));
      }
      return _results;
    };

    Navigator.prototype._routeTime = function(result) {
      var leg, total_time, _i, _len, _ref;
      total_time = 0;
      _ref = result.routes[0].legs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        leg = _ref[_i];
        total_time += leg.duration.value;
      }
      return total_time;
    };

    Navigator.prototype._printTime = function(total_time) {
      var hours, minutes, time_wrap;
      minutes = Math.ceil(total_time / 60);
      hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
      if (hours > 0) {
        time_wrap = '<div class="dist-time-total">Total Travel Time: ' + hours + ' hours, ' + minutes + ' minutes' + '</div><br/>';
      } else {
        time_wrap = '<div class="dist-time-total">Total Travel Time: ' + minutes + ' minutes' + '</div><br/>';
      }
      return $(time_wrap).appendTo('div.directions');
    };

    Navigator.prototype._printRoute = function(result, titles) {
      var arrival, arrival_string, departure, departure_string, end_wrap, i, instr_text, item, leg, leg_end, leg_wrap, start_wrap, step, step_wrap, waypoint_order, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _results;
      console.log("Printing result", result);
      console.log("Printing titles", titles);
      leg_end = [];
      waypoint_order = result.routes[0].waypoint_order;
      departure_string = result.routes[0].legs[0].start_address;
      departure = departure_string.split(",");
      start_wrap = '<hr/><div class="departure"><b>' + titles[0] + '</b><br/>' + departure[0] + '<br/>';
      _ref = departure.slice(1);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        start_wrap += item + ',';
      }
      start_wrap = start_wrap.substring(0, start_wrap.lastIndexOf(','));
      start_wrap += '<br/><br/></div>';
      $(start_wrap).appendTo('div.directions');
      $(".directions").attr('id', result.routes[0].legs[0].travel_mode);
      _ref1 = result.routes[0].legs;
      _results = [];
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        leg = _ref1[i];
        leg_end.push(leg.end_address);
        leg_wrap = '<ol class="directions">';
        $(leg_wrap).appendTo('div.directions');
        _ref2 = leg.steps;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          step = _ref2[_k];
          instr_text = step.instructions.replace('<div>', '<br/><span>');
          instr_text = step.instructions.replace('</div>', '</span>');
          step_wrap = "<li>" + instr_text + '<br/><div class="dist-time">' + step.distance.text + " - about " + step.duration.text + "</div></li>";
          $(step_wrap).appendTo('ol.directions:last-child');
        }
        leg_wrap = '<div class="dist-time-lg">' + leg.distance.text + " - about " + leg.duration.text + "</div><hr><br/>";
        $(leg_wrap).appendTo('div.directions');
        arrival_string = leg.end_address;
        arrival = arrival_string.split(",");
        if (i !== result.routes[0].legs.length - 1) {
          end_wrap = '</ol><div class="waypoint"><b>' + titles[waypoint_order[i] + 1] + '</b><br/>' + arrival[0] + '<br/>';
        } else {
          end_wrap = '</ol><div class="arrival"><b>' + titles[titles.length - 1] + '</b><br/>' + arrival[0] + '<br/>';
        }
        _ref3 = arrival.slice(1);
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          item = _ref3[_l];
          end_wrap += item + ',';
        }
        end_wrap = end_wrap.substring(0, end_wrap.lastIndexOf(','));
        end_wrap += '<br/><br/></div>';
        _results.push($(end_wrap).appendTo('div.directions'));
      }
      return _results;
    };

    return Navigator;

  })();

  Display = (function() {
    function Display() {
      this.loading_modal = $("#loading_modal");
      this.loading_modal.modal();
    }

    Display.prototype._initControls = function() {
      var $elem, $typeElem, type, _i, _len, _ref,
        _this = this;
      $typeElem = $('<label class="checkbox type_checkbox"><input type="checkbox" checked><span class="type_label"></span></label>');
      _ref = this.destinationTypes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        $elem = $typeElem.clone();
        $elem.find('.type_label').text(type);
        $elem.find('input').attr('name', type);
        $elem.appendTo('#destination_types');
      }
      return $("#directions_form").submit(function(e) {
        var end, start, stops, types;
        _this.loading_modal.modal("show");
        e.preventDefault();
        start = $("#start").val();
        end = $("#end").val();
        stops = $("#stops").val();
        types = [];
        $("#destination_types input").each(function() {
          if ($(this).is(":checked")) {
            return types.push($(this).attr("name"));
          }
        });
        _this.nav.calculate(start, end, stops, types, function(err, data) {
          console.log(data);
          return _this.loading_modal.modal("hide");
        });
        return false;
      });
    };

    Display.prototype.load = function() {
      var _this = this;
      loadWeather();
      this.map = new Map();
      this.map.load();
      this.fetcher = new DataFetcher();
      return this.fetcher.fetch(function(err, result) {
        _this.fetcher.show(_this.map);
        _this.destinationTypes = result.destinationTypes;
        console.log("destinationTypes", _this.destinationTypes);
        _this.nav = new Navigator(_this.map, result.stations, result.destinations, result.destinationTypes);
        _this._initControls();
        return _this.loading_modal.modal("hide");
      });
    };

    return Display;

  })();

  Map = (function() {
    function Map() {}

    Map.prototype.load = function() {
      var bikeLayer, mapOptions;
      mapOptions = {
        center: new google.maps.LatLng(40.7444123, -73.9935986),
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      google.maps.visualRefresh = true;
      this.gmap = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
      bikeLayer = new google.maps.BicyclingLayer();
      return bikeLayer.setMap(this.gmap);
    };

    return Map;

  })();

  initialize = function() {
    var disp;
    disp = new Display();
    return disp.load();
  };

  $(document).ready(function() {
    return initialize();
  });

}).call(this);
