@tufte = window.tufte

trafficScatter = ->
	result = []
	for i in [0...times.length]
		time = times[i]
		if (time == 0)
			time = 24
		result[i] = { x: time, y: south[i] + north[i] }
	return result

formatTime = (hour) ->
	if hour == 0
		return "#{hour + 12} am"
	else if hour < 12
		return "#{hour} am"
	else if hour > 12
		return "#{hour - 12} pm"
	else
		return "#{hour} pm"

round = (num, digits) ->
	mult = Math.pow 10, digits
	Math.round(num * mult) / mult

times = [11,12,13,14,15,16,17,18,19,20,21,22,23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,16,17,18,19,20,21,22,23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,16,17,18,19,20,21,22,23, 0]
north = [ 6,12,13,12,18,18,12, 7,15,18,15,22,19,11,10, 2, 5, 2, 3, 1, 5,10,14,11,14,19,16,20,21,23,18,13,13,12,14,11,22,17,17, 9, 6, 5, 2, 1, 1, 4, 6,13,16, 8,15, 9, 9, 8,18, 6, 3, 2, 3,10, 5, 1]
south = [35,37,37,51,38,57,51,37,41,29,27,37,58,38,36,32,36,18, 9, 1, 2, 6,21,29,32,42,33,40,34,35,32,34,31,28,43,47,56,60,53,44,32,11, 3, 2, 2, 3, 7,19,16,31,24,25,31,18,19,18, 4, 6,10,31,10, 2]
colors = ['#D74939','#267F8D','#87B72D']

total = ->
	result = []
	for i in [0...north.length]
		result[i] = north[i] + south[i]
	return result

byDay = ->
	result = []
	i = 0
	for x in [0..times.length]
		hour = times[x]
		i++ if hour == 0
		break if i > 2
		if result[i] == undefined
			result[i] = []
			for j in [0...24]
				result[i][j] = 0
		result[i][hour] = north[x] + south[x]
	for i in [0...result.length]
		result[i] = new tufte.barChartSeries result[i], colors[i]
	result

boxData = ->
	result = []
	for i in [0...north.length]
		hour = times[i]
		total = north[i] + south[i]
		if result[hour] == undefined
			result[hour] = []
		data = result[hour]
		data[data.length] = total
	result

render = ->
	i = tufte.sparkline 'north', north, 0, 60
	$('#north-max').text "#{formatTime times[i]}, #{north[i]} cars"
	i = tufte.sparkline 'south', south, 0, 60
	$('#south-max').text "#{formatTime times[i]}, #{south[i]} cars"
	all = total()
	i = tufte.sparkline 'all', all, 0, 80
	$('#all-max').text "#{formatTime times[i]}, #{all[i]} cars"
	tufte.barChart 'bar_chart', all
	total = south.reduce (x, s) -> x + s
	$('#south-note').text "#{total} cars in #{times.length} hours," + \
		" average #{round total / times.length, 1} cars/hour" + \
		" or about #{round times.length * 60 / total, 1} minutes between cars"
	tufte.multipleBarChart 'by_day', byDay()
	tufte.scatterPlot 'scatter', trafficScatter()
	tufte.dotDashPlot 'dotdash', trafficScatter()
	tufte.boxPlot 'box', boxData()

$ ->
	render()