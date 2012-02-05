# This is free and unencumbered software released into the public domain.

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

viewport.prototype.toViewX = (x) ->
	this.vx + (x - this.x) * this.xscale + this.xoff

viewport.prototype.toViewY = (y) ->
	this.vy + (this.y + this.h - y) * this.yscale + this.yoff

viewport.prototype.toView = (pt) ->
	{
		x: this.toViewX pt.x
		y: this.toViewY pt.y
	}

sparkline = (id, values, min, max) ->
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

barChart = (id, values) ->
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
	context.strokeStyle = elem.css('background-color')
	p25 = view.toView { x: 0, y: 0.25*max }
	p50 = view.toView { x: 0, y: 0.50*max }
	p75 = view.toView { x: 0, y: 0.75*max }
	for x in [0...n+1]
		tl = view.toView { x: 2*x, y: values[x] }
		br = view.toView { x: 2*x+1, y: 0 }
		context.fillRect tl.x, tl.y, br.x - tl.x, br.y - tl.y
		context.drawLine tl.x, p25.y, br.x, p25.y
		context.drawLine tl.x, p50.y, br.x, p50.y
		context.drawLine tl.x, p75.y, br.x, p75.y

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

scatterPlot = (id, points) ->
	n = points.length - 1
	min = { x: points[0].x, y: points[0].y }
	max = { x: min.x, y: min.y }
	for pt in points
		min.x = Math.min pt.x, min.x
		min.y = Math.min pt.y, min.y
		max.x = Math.max pt.x, max.x
		max.y = Math.max pt.y, max.y
	elem = $('#' + id)
	extent = nearestExtents min, max
	h = elem.height() - 1
	view = new viewport extent.x.min, extent.y.min, extent.x.max - extent.x.min, \
		extent.y.max - extent.y.min, 4, 2, elem.width()-7, elem.height()-7
	context = getContext id
	context.fillStyle = elem.css('color')
	for pt in points
		p = view.toView pt
		context.fillCircle p.x, p.y, 2
	context.strokeStyle = elem.css('color')
	context.drawLine view.toViewX(min.x), h - 4, view.toViewX(max.x), h - 4
	context.drawLine 4, view.toViewY(min.y), 4, view.toViewY(max.y)
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
