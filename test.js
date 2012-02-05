var formatTime, north, randomBar, randomScatter, render, round, south, times, total;

randomBar = function() {
  var n, result;
  result = [];
  for (n = 0; n <= 10; n++) {
    result[n] = Math.random();
  }
  return result;
};

randomScatter = function() {
  var i, n, result, _ref;
  result = [];
  for (n = 0; n < 100; n++) {
    result[n] = {
      x: Math.random() * 300 + n,
      y: Math.random() * 100 + n * 5
    };
  }
  result = [];
  for (i = 0, _ref = times.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    result[i] = {
      x: times[i],
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

times = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4];

north = [6, 12, 13, 12, 18, 18, 12, 7, 15, 18, 15, 22, 19, 11, 10, 2, 5, 2, 3, 1, 5, 10, 14, 11, 14, 19, 16, 20, 21, 23, 18, 13, 13, 12, 14, 11, 22, 17, 17, 9, 6, 5];

south = [35, 37, 37, 51, 38, 57, 51, 37, 41, 29, 27, 37, 58, 38, 36, 32, 36, 18, 9, 1, 2, 6, 21, 29, 32, 42, 33, 40, 34, 35, 32, 34, 31, 28, 43, 47, 56, 60, 53, 44, 32, 11];

total = function() {
  var i, result, _ref;
  result = [];
  for (i = 0, _ref = north.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    result[i] = north[i] + south[i];
  }
  return result;
};

render = function() {
  var all, i;
  i = sparkline('north', north, 0, 60);
  $('#north-max').text("" + (formatTime(times[i])) + ", " + north[i] + " cars");
  i = sparkline('south', south, 0, 60);
  $('#south-max').text("" + (formatTime(times[i])) + ", " + south[i] + " cars");
  all = total();
  i = sparkline('all', all, 0, 80);
  $('#all-max').text("" + (formatTime(times[i])) + ", " + all[i] + " cars");
  barChart('bar_chart', south);
  total = south.reduce(function(x, s) {
    return x + s;
  });
  $('#south-note').text(("" + total + " cars in " + times.length + " hours,") + (" average " + (round(total / times.length, 1)) + " cars/hour") + (" or " + (round(times.length * 60 / total, 1)) + " minutes between cars"));
  return scatterPlot('scatter', randomScatter());
};

$(function() {
  return render();
});
