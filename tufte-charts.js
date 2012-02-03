(function() {
  var barChart, extents, getContext, nearestExtents, randomBar, randomScatter, randomSpark, render, scatterPlot, sparkLine, viewport;

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

  viewport.prototype.toView = function(pt) {
    return {
      x: this.vx + (pt.x - this.x) * this.xscale + this.xoff,
      y: this.vy + (this.y + this.h - pt.y) * this.yscale + this.yoff
    };
  };

  sparkLine = function(id, points) {
    var context, elem, max, min, n, next, pt, start, view, _i, _j, _len, _len2;
    n = points.length - 1;
    min = points[0].y;
    max = min;
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      pt = points[_i];
      min = Math.min(pt.y, min);
      max = Math.max(pt.y, max);
    }
    elem = $('#' + id);
    view = new viewport(0, min, n, max - min, 0, 0, elem.width() - 1, elem.height() - 1);
    context = getContext(id);
    context.strokeStyle = elem.css('color');
    context.lineWidth = 1;
    context.beginPath();
    start = view.toView(points[0]);
    context.moveTo(start.x, start.y);
    for (_j = 0, _len2 = points.length; _j < _len2; _j++) {
      pt = points[_j];
      next = view.toView(pt);
      context.lineTo(next.x, next.y);
    }
    return context.stroke();
  };

  barChart = function(id, values) {
    var br, context, elem, max, n, p0, p25, p50, p75, pn, tl, v, view, x, _i, _len, _ref, _results;
    n = values.length - 1;
    max = values[0];
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      v = values[_i];
      max = Math.max(v, max);
    }
    elem = $('#' + id);
    view = new viewport(0, 0, n + 1, max, 0, 0, elem.width() - 1, elem.height() - 1);
    context = getContext(id);
    context.fillStyle = elem.css('color');
    context.strokeStyle = elem.css('color');
    context.lineWidth = 1;
    p0 = view.toView({
      x: 0.25,
      y: 0
    });
    pn = view.toView({
      x: n + 0.75,
      y: 0
    });
    context.drawLine(p0.x, p0.y, pn.x, pn.y);
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
    _results = [];
    for (x = 0, _ref = n + 1; 0 <= _ref ? x < _ref : x > _ref; 0 <= _ref ? x++ : x--) {
      tl = view.toView({
        x: 0.25 + x,
        y: values[x]
      });
      br = view.toView({
        x: 0.75 + x,
        y: 0
      });
      context.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
      context.drawLine(tl.x, p25.y, br.x, p25.y);
      context.drawLine(tl.x, p50.y, br.x, p50.y);
      _results.push(context.drawLine(tl.x, p75.y, br.x, p75.y));
    }
    return _results;
  };

  extents = function(min, max) {
    var ddx, delta, divisor, dx;
    dx = Math.abs(max - min);
    ddx = dx / 10;
    divisor = 1;
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

  scatterPlot = function(id, points) {
    var context, elem, extent, h, max, min, n, p, pt, ptDelta, ptMax, ptMin, view, x, y, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
    n = points.length - 1;
    min = {
      x: points[0].x,
      y: points[0].y
    };
    max = {
      x: min.x,
      y: min.y
    };
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      pt = points[_i];
      min.x = Math.min(pt.x, min.x);
      min.y = Math.min(pt.y, min.y);
      max.x = Math.max(pt.x, max.x);
      max.y = Math.max(pt.y, max.y);
    }
    elem = $('#' + id);
    extent = nearestExtents(min, max);
    h = elem.height() - 1;
    view = new viewport(extent.x.min, extent.y.min, extent.x.max - extent.x.min, extent.y.max - extent.y.min, 3, 3, elem.width() - 7, elem.height() - 7);
    context = getContext(id);
    context.fillStyle = elem.css('color');
    for (_j = 0, _len2 = points.length; _j < _len2; _j++) {
      pt = points[_j];
      p = view.toView(pt);
      context.beginPath();
      context.arc(p.x, p.y, 2, 0, 2 * Math.PI, true);
      context.closePath();
      context.fill();
    }
    context.strokeStyle = elem.css('color');
    ptMin = view.toView(min);
    ptMax = view.toView(max);
    context.drawLine(ptMin.x, h - 3, ptMax.x, h - 3);
    context.drawLine(3, ptMin.y, 3, ptMax.y);
    ptMin = view.toView({
      x: extent.x.min,
      y: extent.y.min
    });
    ptMax = view.toView({
      x: extent.x.max,
      y: extent.y.max
    });
    ptDelta = view.toView({
      x: extent.x.min + extent.x.delta,
      y: extent.y.min + extent.y.delta
    });
    for (x = _ref = ptMin.x, _ref2 = ptMax.x, _ref3 = ptDelta.x - ptMin.x; _ref <= _ref2 ? x <= _ref2 : x >= _ref2; x += _ref3) {
      context.drawLine(x, h, x, h - 3);
    }
    _results = [];
    for (y = _ref4 = ptMin.y, _ref5 = ptMax.y, _ref6 = ptDelta.y - ptMin.y; _ref4 <= _ref5 ? y <= _ref5 : y >= _ref5; y += _ref6) {
      _results.push(context.drawLine(0, y, 3, y));
    }
    return _results;
  };

  randomSpark = function() {
    var n, result;
    result = [];
    for (n = 0; n < 100; n++) {
      result[n] = {
        x: n,
        y: Math.random() + n / 50
      };
    }
    return result;
  };

  randomBar = function() {
    var n, result;
    result = [];
    for (n = 0; n <= 10; n++) {
      result[n] = Math.random();
    }
    return result;
  };

  randomScatter = function() {
    var n, result, _results;
    result = [];
    _results = [];
    for (n = 0; n < 100; n++) {
      _results.push(result[n] = {
        x: Math.random() * 300 + n,
        y: Math.random() * 100 + n * 5
      });
    }
    return _results;
  };

  render = function() {
    sparkLine('test_canvas', randomSpark());
    barChart('bar_chart', randomBar());
    return scatterPlot('scatter', randomScatter());
  };

  $(function() {
    return render();
  });

}).call(this);
