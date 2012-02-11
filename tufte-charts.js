(function() {
  var extents, getContext, minMax, minMaxPt, nearestExtents, safeMax, safeMin, stats, viewport, _ref;

  this.tufte = (_ref = window.tufte) != null ? _ref : {};

  safeMax = function(max, x) {
    if (max === void 0) {
      return x;
    } else if (x !== void 0) {
      return Math.max(max, x);
    } else {
      return max;
    }
  };

  safeMin = function(min, x) {
    if (min === void 0) {
      return x;
    } else if (x !== void 0) {
      return Math.min(min, x);
    } else {
      return min;
    }
  };

  minMax = function(values) {
    var max, min, x, _i, _len;
    min = void 0;
    max = void 0;
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      x = values[_i];
      min = safeMin(min, x);
      max = safeMax(max, x);
    }
    return {
      min: min,
      max: max
    };
  };

  stats = function(values) {
    var avg, count, diff, max, min, total, x, _i, _j, _len, _len2;
    min = void 0;
    max = void 0;
    total = 0;
    count = 0;
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      x = values[_i];
      min = safeMin(min, x);
      max = safeMax(max, x);
      if (x !== void 0) total += x;
      count++;
    }
    avg = total / count;
    diff = 0;
    for (_j = 0, _len2 = values.length; _j < _len2; _j++) {
      x = values[_j];
      diff += (x - avg) * (x - avg);
    }
    return {
      min: min,
      max: max,
      total: total,
      count: count,
      avg: avg,
      stdev: Math.sqrt(diff / count)
    };
  };

  minMaxPt = function(points) {
    var max, min, pt, _i, _len;
    min = {
      x: void 0,
      y: void 0
    };
    max = {
      x: min.x,
      y: min.y
    };
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      pt = points[_i];
      min.x = safeMin(min.x, pt.x);
      min.y = safeMin(min.y, pt.y);
      max.x = safeMax(max.x, pt.x);
      max.y = safeMax(max.y, pt.y);
    }
    return {
      min: min,
      max: max
    };
  };

  getContext = function(id) {
    return document.getElementById(id).getContext('2d');
  };

  viewport = function(x, y, w, h, vx, vy, vw, vh) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = vx;
    this.vy = vy;
    this.vw = vw;
    this.vh = vh;
    this.xscale = vw / w;
    this.yscale = vh / h;
    this.scale = Math.min(this.xscale, this.yscale);
    this.xoff = (vw - this.xscale * w) / 2;
    return this.yoff = (vh - this.yscale * h) / 2;
  };

  tufte.viewport = viewport;

  viewport.prototype.toViewX = function(x) {
    return this.vx + (x - this.x) * this.xscale + this.xoff;
  };

  viewport.prototype.toViewY = function(y) {
    return this.vy + (this.y + this.h - y) * this.yscale + this.yoff;
  };

  viewport.prototype.toView = function(pt) {
    return {
      x: this.toViewX(pt.x),
      y: this.toViewY(pt.y)
    };
  };

  tufte.sparkline = function(id, values, min, max) {
    var context, elem, i, n, val, view, x, y, _i, _len;
    n = values.length - 1;
    elem = $('#' + id);
    view = new viewport(0, min, n, max - min, 0, 2, elem.width(), elem.height() - 3);
    context = getContext(id);
    context.strokeStyle = elem.css('color');
    context.lineWidth = 1;
    context.beginPath();
    i = 0;
    x = 0;
    y = values[0];
    context.moveTo(view.toViewX(0), view.toViewY(values[0]));
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      val = values[_i];
      if (val > y) {
        y = val;
        x = i;
      }
      context.lineTo(view.toViewX(i), view.toViewY(val));
      i++;
    }
    context.stroke();
    context.fillStyle = elem.css('color');
    context.fillCircle(view.toViewX(x), view.toViewY(values[x]), 2);
    return x;
  };

  tufte.barChart = function(id, values) {
    var br, context, elem, max, n, p0, p25, p50, p75, pn, tl, v, view, w, x, _i, _len;
    n = values.length - 1;
    max = values[0];
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      v = values[_i];
      max = Math.max(v, max);
    }
    elem = $('#' + id);
    view = new viewport(0, 0, 2 * n + 1, max, 0, 0, elem.width(), elem.height() - 1);
    context = getContext(id);
    context.fillStyle = elem.css('color');
    context.strokeStyle = elem.css('color');
    context.lineWidth = 1;
    p0 = view.toView({
      x: 0,
      y: 0
    });
    pn = view.toView({
      x: 2 * n + 1,
      y: 0
    });
    context.drawLine(p0.x, p0.y, pn.x, pn.y);
    for (x = 0; 0 <= n ? x <= n : x >= n; 0 <= n ? x++ : x--) {
      tl = view.toView({
        x: 2 * x,
        y: values[x]
      });
      br = view.toView({
        x: 2 * x + 1,
        y: 0
      });
      context.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
    }
    context.strokeStyle = elem.css('background-color');
    p25 = view.toView({
      x: 0,
      y: 0.25 * max
    });
    p50 = view.toView({
      x: 0,
      y: 0.50 * max
    });
    p75 = view.toView({
      x: 0,
      y: 0.75 * max
    });
    w = elem.width();
    context.drawLine(0, p25.y, w, p25.y);
    context.drawLine(0, p50.y, w, p50.y);
    return context.drawLine(0, p75.y, w, p75.y);
  };

  tufte.barChartSeries = function(values, color) {
    this.values = values;
    return this.color = color;
  };

  tufte.multipleBarChart = function(id, seriesArray) {
    var br, context, elem, i, max, min, n, ns, p0, p25, p50, p75, pn, s, tl, values, view, w, x, y, _i, _len;
    ns = seriesArray.length;
    n = 0;
    min = 0;
    max = 0;
    for (_i = 0, _len = seriesArray.length; _i < _len; _i++) {
      s = seriesArray[_i];
      n = Math.max(n, s.values.length - 1);
      x = minMax(s.values);
      min = Math.min(min, x.min);
      max = Math.max(max, x.max);
    }
    elem = $('#' + id);
    view = new viewport(0, min, (ns + 1) * (n + 1) - 1, max - min, 0, 0, elem.width(), elem.height() - 1);
    context = getContext(id);
    context.fillStyle = elem.css('color');
    context.strokeStyle = elem.css('color');
    context.lineWidth = 1;
    p0 = view.toView({
      x: 0,
      y: 0
    });
    pn = view.toView({
      x: (ns + 1) * (n + 1) - 1,
      y: 0
    });
    context.drawLine(p0.x, p0.y, pn.x, pn.y);
    for (i = 0; 0 <= ns ? i < ns : i > ns; 0 <= ns ? i++ : i--) {
      context.fillStyle = seriesArray[i].color;
      values = seriesArray[i].values;
      for (x = 0; 0 <= n ? x <= n : x >= n; 0 <= n ? x++ : x--) {
        y = values[x];
        if (y === void 0) continue;
        tl = view.toView({
          x: (ns + 1) * x + i,
          y: y
        });
        br = view.toView({
          x: (ns + 1) * x + i + 1,
          y: 0
        });
        context.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
      }
    }
    context.strokeStyle = elem.css('background-color');
    p25 = view.toView({
      x: 0,
      y: 0.25 * max
    });
    p50 = view.toView({
      x: 0,
      y: 0.50 * max
    });
    p75 = view.toView({
      x: 0,
      y: 0.75 * max
    });
    w = elem.width();
    context.drawLine(0, p25.y, w, p25.y);
    context.drawLine(0, p50.y, w, p50.y);
    return context.drawLine(0, p75.y, w, p75.y);
  };

  extents = function(min, max) {
    var ddx, delta, divisor, dx;
    dx = Math.abs(max - min);
    ddx = dx / 10;
    divisor = 1;
    while (ddx > 10) {
      ddx /= 10;
      divisor /= 10;
    }
    while (ddx < 1) {
      ddx *= 10;
      divisor *= 10;
    }
    ddx = Math.ceil(ddx);
    delta = ddx / divisor;
    min = delta * Math.floor(min / delta);
    max = delta * Math.ceil(max / delta);
    return {
      min: min,
      max: max,
      delta: delta
    };
  };

  nearestExtents = function(minPt, maxPt) {
    var ext_x, ext_y;
    ext_x = extents(minPt.x, maxPt.x);
    ext_y = extents(minPt.y, maxPt.y);
    return {
      x: ext_x,
      y: ext_y
    };
  };

  CanvasRenderingContext2D.prototype.drawLine = function(x1, y1, x2, y2) {
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    return this.stroke();
  };

  CanvasRenderingContext2D.prototype.fillCircle = function(x, y, r) {
    this.beginPath();
    this.arc(x, y, r, 0, 2 * Math.PI, true);
    return this.fill();
  };

  tufte.scatterPlot = function(id, points) {
    var bounds, context, delta, elem, extent, h, n, p, pt, ptMax, ptMin, view, x, y, _i, _len, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _results;
    n = points.length - 1;
    bounds = minMaxPt(points);
    elem = $('#' + id);
    extent = nearestExtents(bounds.min, bounds.max);
    h = elem.height() - 1;
    view = new viewport(extent.x.min, extent.y.min, extent.x.max - extent.x.min, extent.y.max - extent.y.min, 4, 2, elem.width() - 7, elem.height() - 7);
    context = getContext(id);
    context.fillStyle = elem.css('color');
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      pt = points[_i];
      p = view.toView(pt);
      context.fillCircle(p.x, p.y, 2);
    }
    context.strokeStyle = elem.css('color');
    context.drawLine(view.toViewX(bounds.min.x), h - 4, view.toViewX(bounds.max.x), h - 4);
    context.drawLine(4, view.toViewY(bounds.min.y), 4, view.toViewY(bounds.max.y));
    ptMin = view.toView({
      x: extent.x.min,
      y: extent.y.min
    });
    ptMax = view.toView({
      x: extent.x.max,
      y: extent.y.max
    });
    delta = {
      x: view.toViewX(extent.x.min + extent.x.delta) - ptMin.x,
      y: view.toViewY(extent.y.min + extent.y.delta) - ptMin.y
    };
    for (x = _ref2 = ptMin.x, _ref3 = ptMax.x, _ref4 = delta.x; _ref2 <= _ref3 ? x <= _ref3 : x >= _ref3; x += _ref4) {
      context.drawLine(x, h, x, h - 4);
    }
    _results = [];
    for (y = _ref5 = ptMin.y, _ref6 = ptMax.y, _ref7 = delta.y; _ref5 <= _ref6 ? y <= _ref6 : y >= _ref6; y += _ref7) {
      _results.push(context.drawLine(0, y, 4, y));
    }
    return _results;
  };

  tufte.dotDashPlot = function(id, points) {
    var bounds, context, elem, extent, h, n, p, pt, view, _i, _len, _results;
    n = points.length - 1;
    bounds = minMaxPt(points);
    elem = $('#' + id);
    extent = nearestExtents(bounds.min, bounds.max);
    h = elem.height() - 1;
    view = new viewport(extent.x.min, extent.y.min, extent.x.max - extent.x.min, extent.y.max - extent.y.min, 4, 2, elem.width() - 7, elem.height() - 7);
    context = getContext(id);
    context.fillStyle = elem.css('color');
    context.strokeStyle = elem.css('color');
    _results = [];
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      pt = points[_i];
      p = view.toView(pt);
      context.fillCircle(p.x, p.y, 2);
      context.drawLine(p.x, h - 4, p.x, h);
      _results.push(context.drawLine(0, p.y, 4, p.y));
    }
    return _results;
  };

  tufte.boxPlot = function(id, data) {
    var arr, context, elem, extent, i, info, max, min, n, p, series, view, _i, _len, _ref2, _results;
    n = data.length - 1;
    min = void 0;
    max = void 0;
    series = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      arr = data[_i];
      info = stats(arr);
      info.data = arr;
      series[series.length] = info;
      min = safeMin(min, info.min);
      max = safeMax(max, info.max);
    }
    elem = $('#' + id);
    extent = extents(min, max);
    view = new viewport(0, extent.min, n + 1, extent.max - extent.min, 4, 2, elem.width() - 7, elem.height() - 7);
    context = getContext(id);
    context.fillStyle = elem.css('color');
    context.strokeStyle = elem.css('color');
    _results = [];
    for (i = 0, _ref2 = series.length; 0 <= _ref2 ? i < _ref2 : i > _ref2; 0 <= _ref2 ? i++ : i--) {
      info = series[i];
      p = view.toView({
        x: i + 0.5,
        y: info.avg
      });
      context.fillCircle(p.x, p.y, 2);
      context.drawLine(p.x, view.toViewY(info.max), p.x, view.toViewY(info.avg + info.stdev));
      context.drawLine(p.x, view.toViewY(info.avg - info.stdev), p.x, view.toViewY(info.min));
      _results.push(context.drawLine(0, p.y, 3, p.y));
    }
    return _results;
  };

}).call(this);
