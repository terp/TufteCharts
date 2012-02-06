var barChart, dotDashPlot, extents, getContext, nearestExtents, scatterPlot, sparkline, viewport;

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

sparkline = function(id, values, min, max) {
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

barChart = function(id, values) {
  var br, context, elem, max, n, p0, p25, p50, p75, pn, tl, v, view, x, _i, _len, _ref, _results;
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
      x: 2 * x,
      y: values[x]
    });
    br = view.toView({
      x: 2 * x + 1,
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

scatterPlot = function(id, points) {
  var context, delta, elem, extent, h, max, min, n, p, pt, ptMax, ptMin, view, x, y, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _results;
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
  view = new viewport(extent.x.min, extent.y.min, extent.x.max - extent.x.min, extent.y.max - extent.y.min, 4, 2, elem.width() - 7, elem.height() - 7);
  context = getContext(id);
  context.fillStyle = elem.css('color');
  for (_j = 0, _len2 = points.length; _j < _len2; _j++) {
    pt = points[_j];
    p = view.toView(pt);
    context.fillCircle(p.x, p.y, 2);
  }
  context.strokeStyle = elem.css('color');
  context.drawLine(view.toViewX(min.x), h - 4, view.toViewX(max.x), h - 4);
  context.drawLine(4, view.toViewY(min.y), 4, view.toViewY(max.y));
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
  for (x = _ref = ptMin.x, _ref2 = ptMax.x, _ref3 = delta.x; _ref <= _ref2 ? x <= _ref2 : x >= _ref2; x += _ref3) {
    context.drawLine(x, h, x, h - 4);
  }
  _results = [];
  for (y = _ref4 = ptMin.y, _ref5 = ptMax.y, _ref6 = delta.y; _ref4 <= _ref5 ? y <= _ref5 : y >= _ref5; y += _ref6) {
    _results.push(context.drawLine(0, y, 4, y));
  }
  return _results;
};

dotDashPlot = function(id, points) {
  var context, elem, extent, h, max, min, n, p, pt, view, _i, _j, _len, _len2, _results;
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
  view = new viewport(extent.x.min, extent.y.min, extent.x.max - extent.x.min, extent.y.max - extent.y.min, 4, 2, elem.width() - 7, elem.height() - 7);
  context = getContext(id);
  context.fillStyle = elem.css('color');
  context.strokeStyle = elem.css('color');
  _results = [];
  for (_j = 0, _len2 = points.length; _j < _len2; _j++) {
    pt = points[_j];
    p = view.toView(pt);
    context.fillCircle(p.x, p.y, 2);
    context.drawLine(p.x, h - 4, p.x, h);
    _results.push(context.drawLine(0, p.y, 4, p.y));
  }
  return _results;
};
