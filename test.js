(function() {
  var boxData, byDay, colors, formatTime, north, render, round, south, times, total, trafficScatter;

  this.tufte = window.tufte;

  trafficScatter = function() {
    var i, result, time, _ref;
    result = [];
    for (i = 0, _ref = times.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      time = times[i];
      if (time === 0) time = 24;
      result[i] = {
        x: time,
        y: south[i] + north[i]
      };
    }
    return result;
  };

  formatTime = function(hour) {
    if (hour === 0) {
      return "" + (hour + 12) + " am";
    } else if (hour < 12) {
      return "" + hour + " am";
    } else if (hour > 12) {
      return "" + (hour - 12) + " pm";
    } else {
      return "" + hour + " pm";
    }
  };

  round = function(num, digits) {
    var mult;
    mult = Math.pow(10, digits);
    return Math.round(num * mult) / mult;
  };

  times = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0];

  north = [6, 12, 13, 12, 18, 18, 12, 7, 15, 18, 15, 22, 19, 11, 10, 2, 5, 2, 3, 1, 5, 10, 14, 11, 14, 19, 16, 20, 21, 23, 18, 13, 13, 12, 14, 11, 22, 17, 17, 9, 6, 5, 2, 1, 1, 4, 6, 13, 16, 8, 15, 9, 9, 8, 18, 6, 3, 2, 3, 10, 5, 1];

  south = [35, 37, 37, 51, 38, 57, 51, 37, 41, 29, 27, 37, 58, 38, 36, 32, 36, 18, 9, 1, 2, 6, 21, 29, 32, 42, 33, 40, 34, 35, 32, 34, 31, 28, 43, 47, 56, 60, 53, 44, 32, 11, 3, 2, 2, 3, 7, 19, 16, 31, 24, 25, 31, 18, 19, 18, 4, 6, 10, 31, 10, 2];

  colors = ['#D74939', '#267F8D', '#87B72D'];

  total = function() {
    var i, result, _ref;
    result = [];
    for (i = 0, _ref = north.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      result[i] = north[i] + south[i];
    }
    return result;
  };

  byDay = function() {
    var hour, i, j, result, x, _ref, _ref2;
    result = [];
    i = 0;
    for (x = 0, _ref = times.length; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
      hour = times[x];
      if (hour === 0) i++;
      if (i > 2) break;
      if (result[i] === void 0) {
        result[i] = [];
        for (j = 0; j < 24; j++) {
          result[i][j] = 0;
        }
      }
      result[i][hour] = north[x] + south[x];
    }
    for (i = 0, _ref2 = result.length; 0 <= _ref2 ? i < _ref2 : i > _ref2; 0 <= _ref2 ? i++ : i--) {
      result[i] = new tufte.barChartSeries(result[i], colors[i]);
    }
    return result;
  };

  boxData = function() {
    var data, hour, i, result, _ref;
    result = [];
    for (i = 0, _ref = north.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      hour = times[i];
      total = north[i] + south[i];
      if (result[hour] === void 0) result[hour] = [];
      data = result[hour];
      data[data.length] = total;
    }
    return result;
  };

  render = function() {
    var all, i;
    i = tufte.sparkline('north', north, 0, 60);
    $('#north-max').text("" + (formatTime(times[i])) + ", " + north[i] + " cars");
    i = tufte.sparkline('south', south, 0, 60);
    $('#south-max').text("" + (formatTime(times[i])) + ", " + south[i] + " cars");
    all = total();
    i = tufte.sparkline('all', all, 0, 80);
    $('#all-max').text("" + (formatTime(times[i])) + ", " + all[i] + " cars");
    tufte.barChart('bar_chart', all);
    total = south.reduce(function(x, s) {
      return x + s;
    });
    $('#south-note').text(("" + total + " cars in " + times.length + " hours,") + (" average " + (round(total / times.length, 1)) + " cars/hour") + (" or about " + (round(times.length * 60 / total, 1)) + " minutes between cars"));
    tufte.multipleBarChart('by_day', byDay());
    tufte.scatterPlot('scatter', trafficScatter());
    tufte.dotDashPlot('dotdash', trafficScatter());
    return tufte.boxPlot('box', boxData());
  };

  $(function() {
    return render();
  });

}).call(this);
