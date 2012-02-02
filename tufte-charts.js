(function() {
  var barChart, getContext, randomBar, randomSpark, render, sparkLine, viewport;

  getContext = function(id) {
    return document.getElementById(id).getContext('2d');
  };

  viewport = function(x, y, w, h, vw, vh) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
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
      x: (pt.x - this.x) * this.xscale + this.xoff,
      y: (this.y + this.h - pt.y) * this.yscale + this.yoff
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
    view = new viewport(0, min, n, max - min, elem.width() - 1, elem.height() - 1);
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
    view = new viewport(0, 0, n + 1, max, elem.width() - 1, elem.height() - 1);
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
    context.beginPath();
    context.moveTo(p0.x, p0.y);
    context.lineTo(pn.x, pn.y);
    context.stroke();
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
      context.beginPath();
      context.moveTo(tl.x, p25.y);
      context.lineTo(br.x, p25.y);
      context.stroke();
      context.beginPath();
      context.moveTo(tl.x, p50.y);
      context.lineTo(br.x, p50.y);
      context.stroke();
      context.beginPath();
      context.lineTo(tl.x, p75.y);
      context.lineTo(br.x, p75.y);
      _results.push(context.stroke());
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

  render = function() {
    sparkLine('test_canvas', randomSpark());
    return barChart('bar_chart', randomBar());
  };

  $(function() {
    return render();
  });

}).call(this);
