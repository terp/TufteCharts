# This is free and unencumbered software released into the public domain.
@tufte = window.tufte ? {}

safeMax = (max, x) ->
	if max == undefined
		x
	else if x != undefined
		Math.max max, x
	else
		max

safeMin = (min, x) ->
	if min == undefined
		x
	else if x != undefined
		Math.min min, x
	else
		min

minMax = (values) ->
	min = undefined
	max = undefined
	for x in values
		min = safeMin min, x
		max = safeMax max, x
	{ min: min, max: max }

stats = (values) ->
	min = undefined
	max = undefined
	total = 0
	count = 0
	for x in values
		min = safeMin min, x
		max = safeMax max, x
		total += x if x != undefined
		count++
	avg = total / count
	diff = 0
	for x in values
		diff += (x - avg) * (x - avg)
	{ min: min, max: max, total: total, count: count, avg: avg, stdev: Math.sqrt diff / count }

minMaxPt = (points) ->
	min = { x: undefined, y: undefined }
	max = { x: min.x, y: min.y }
	for pt in points
		min.x = safeMin min.x, pt.x
		min.y = safeMin min.y, pt.y
		max.x = safeMax max.x, pt.x
		max.y = safeMax max.y, pt.y
	{ min: min, max: max }	

getContext = (id) ->
	return document.getElementById(id).getContext('2d')

viewport = (x, y, w, h, vx, vy, vw, vh) ->
	this.x = x
	this.y = y
	this.w = w
	this.h = h
	this.vx = vx
	this.vy = vy
	this.vw = vw
	this.vh = vh
	this.xscale = vw / w
	this.yscale = vh / h
	this.scale = Math.min(this.xscale, this.yscale)
	this.xoff = (vw - this.xscale * w) / 2
	this.yoff = (vh - this.yscale * h) / 2

tufte.viewport = viewport

viewport.prototype.toViewX = (x) ->
	this.vx + (x - this.x) * this.xscale + this.xoff

viewport.prototype.toViewY = (y) ->
	this.vy + (this.y + this.h - y) * this.yscale + this.yoff

viewport.prototype.toView = (pt) ->
	{
		x: this.toViewX pt.x
		y: this.toViewY pt.y
	}

tufte.sparkline = (id, values, min, max) ->
	n = values.length - 1
	elem = $('#' + id)
	view = new viewport 0, min, n, max - min, 0, 2, elem.width(), elem.height()-3
	context = getContext id
	context.strokeStyle = elem.css('color')
	context.lineWidth = 1
	context.beginPath()
	i = 0
	x = 0
	y = values[0]
	context.moveTo view.toViewX(0), view.toViewY(values[0])
	for val in values
		if (val > y)
			y = val
			x = i
		context.lineTo view.toViewX(i), view.toViewY(val)
		i++
	context.stroke()
	context.fillStyle = elem.css('color')
	context.fillCircle view.toViewX(x), view.toViewY(values[x]), 2
	return x

tufte.barChart = (id, values) ->
	n = values.length - 1
	max = values[0]
	for v in values
		max = Math.max v, max
	elem = $('#' + id)
	view = new viewport 0, 0, 2 * n + 1, max, 0, 0, elem.width(), elem.height()-1
	context = getContext id
	context.fillStyle = elem.css('color')
	context.strokeStyle = elem.css('color')
	context.lineWidth = 1
	p0 = view.toView { x: 0, y: 0 }
	pn = view.toView { x: 2*n+1, y: 0 }
	context.drawLine p0.x, p0.y, pn.x, pn.y
	for x in [0..n]
		tl = view.toView { x: 2*x, y: values[x] }
		br = view.toView { x: 2*x+1, y: 0 }
		context.fillRect tl.x, tl.y, br.x - tl.x, br.y - tl.y
	context.strokeStyle = elem.css('background-color')
	p25 = view.toView { x: 0, y: 0.25*max }
	p50 = view.toView { x: 0, y: 0.50*max }
	p75 = view.toView { x: 0, y: 0.75*max }
	w = elem.width()
	context.drawLine 0, p25.y, w, p25.y
	context.drawLine 0, p50.y, w, p50.y
	context.drawLine 0, p75.y, w, p75.y

tufte.barChartSeries = (values, color) ->
	this.values = values
	this.color = color

tufte.multipleBarChart = (id, seriesArray) ->
	ns = seriesArray.length
	n = 0
	min = 0
	max = 0
	for s in seriesArray
		n = Math.max n, s.values.length - 1
		x = minMax s.values
		min = Math.min min, x.min
		max = Math.max max, x.max
	elem = $('#' + id)
	view = new viewport 0, min, (ns + 1) * (n + 1) - 1, max - min, 0, 0, elem.width(), elem.height()-1
	context = getContext id
	context.fillStyle = elem.css('color')
	context.strokeStyle = elem.css('color')
	context.lineWidth = 1
	p0 = view.toView { x: 0, y: 0 }
	pn = view.toView { x: (ns+1)*(n+1)-1, y: 0 }
	context.drawLine p0.x, p0.y, pn.x, pn.y
	for i in [0...ns]
		context.fillStyle = seriesArray[i].color
		values = seriesArray[i].values
		for x in [0..n]
			y = values[x]
			continue if y == undefined
			tl = view.toView { x: (ns+1)*x + i, y: y }
			br = view.toView { x: (ns+1)*x + i + 1, y: 0 }
			context.fillRect tl.x, tl.y, br.x - tl.x, br.y - tl.y
	context.strokeStyle = elem.css('background-color')
	p25 = view.toView { x: 0, y: 0.25*max }
	p50 = view.toView { x: 0, y: 0.50*max }
	p75 = view.toView { x: 0, y: 0.75*max }
	w = elem.width()
	context.drawLine 0, p25.y, w, p25.y
	context.drawLine 0, p50.y, w, p50.y
	context.drawLine 0, p75.y, w, p75.y

extents = (min, max) ->
	dx = Math.abs max - min
	ddx = dx / 10
	divisor = 1
	while ddx > 10
		ddx /= 10
		divisor /= 10
	while ddx < 1
		ddx *= 10
		divisor *= 10
	ddx = Math.ceil ddx
	delta = ddx / divisor
	min = delta * Math.floor min / delta
	max = delta * Math.ceil max / delta
	return { min: min, max: max, delta: delta }

nearestExtents = (minPt, maxPt) ->
	ext_x = extents minPt.x, maxPt.x
	ext_y = extents minPt.y, maxPt.y
	return { x: ext_x, y: ext_y }

CanvasRenderingContext2D.prototype.drawLine = (x1, y1, x2, y2) ->
	this.beginPath()
	this.moveTo x1, y1
	this.lineTo x2, y2
	this.stroke()

CanvasRenderingContext2D.prototype.fillCircle = (x, y, r) ->
	this.beginPath()
	this.arc x, y, r, 0, 2 * Math.PI, true
	this.fill()

tufte.scatterPlot = (id, points) ->
	n = points.length - 1
	bounds = minMaxPt points
	elem = $('#' + id)
	extent = nearestExtents bounds.min, bounds.max
	h = elem.height() - 1
	view = new viewport extent.x.min, extent.y.min, extent.x.max - extent.x.min, \
		extent.y.max - extent.y.min, 4, 2, elem.width()-7, elem.height()-7
	context = getContext id
	context.fillStyle = elem.css('color')
	for pt in points
		p = view.toView pt
		context.fillCircle p.x, p.y, 2
	context.strokeStyle = elem.css('color')
	context.drawLine view.toViewX(bounds.min.x), h - 4, view.toViewX(bounds.max.x), h - 4
	context.drawLine 4, view.toViewY(bounds.min.y), 4, view.toViewY(bounds.max.y)
	ptMin = view.toView { x: extent.x.min, y: extent.y.min }
	ptMax = view.toView { x: extent.x.max, y: extent.y.max }
	delta = {
		x: view.toViewX(extent.x.min + extent.x.delta) - ptMin.x, 
		y: view.toViewY(extent.y.min + extent.y.delta) - ptMin.y
	}
	for x in [ptMin.x..ptMax.x] by delta.x
		context.drawLine x, h, x, h - 4
	for y in [ptMin.y..ptMax.y] by delta.y
		context.drawLine 0, y, 4, y

tufte.dotDashPlot = (id, points) ->
	n = points.length - 1
	bounds = minMaxPt points
	elem = $('#' + id)
	extent = nearestExtents bounds.min, bounds.max
	h = elem.height() - 1
	view = new viewport extent.x.min, extent.y.min, extent.x.max - extent.x.min, \
		extent.y.max - extent.y.min, 4, 2, elem.width()-7, elem.height()-7
	context = getContext id
	context.fillStyle = elem.css('color')
	context.strokeStyle = elem.css('color')
	for pt in points
		p = view.toView pt
		context.fillCircle p.x, p.y, 2
		context.drawLine p.x, h - 4, p.x, h
		context.drawLine 0, p.y, 4, p.y

tufte.boxPlot = (id, data) ->
	n = data.length - 1
	min = undefined
	max = undefined
	series = []
	for arr in data
		info = stats arr
		info.data = arr
		series[series.length] = info
		min = safeMin min, info.min
		max = safeMax max, info.max
	elem = $('#' + id)
	extent = extents min, max
	view = new viewport 0, extent.min, n+1, extent.max - extent.min, \
		4, 2, elem.width() - 7, elem.height() - 7
	context = getContext id
	context.fillStyle = elem.css('color')
	context.strokeStyle = elem.css('color')
	for i in [0...series.length]
		info = series[i]
		p = view.toView { x: i + 0.5, y: info.avg }
		context.fillCircle p.x, p.y, 2
		context.drawLine p.x, view.toViewY(info.max), p.x, view.toViewY(info.avg + info.stdev)
		context.drawLine p.x, view.toViewY(info.avg - info.stdev), p.x, view.toViewY(info.min)
		context.drawLine 0, p.y, 3, p.y
