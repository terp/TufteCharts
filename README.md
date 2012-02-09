TufteCharts
===========
This library covers some basic charting using CoffeeScript to render on an HTML5 Canvas. See the `index.html` and `test.coffee` files for example usage. The ideas are borrowed from the chapter *Data-Ink Maximization* in Edward Tufte's *The Visual Display of Quantitative Information*.

To start, I've just got a few charts:

* Sparkline

* Bar

* Scatter

* Dot-Dash

All the charts currently draw from the CSS `color` and `background-color` properties to infer how to render the data.

The sparkline is best used in a small canvas, due to the nature of its intent.

The bar chart includes 25% markers on the bars and a slim baseline.

The scatter plot includes a range-frame.

TODO
----
I'll be adding multiple series to the scatter plot soon, along with some additional means of annotating the data. I'm also planning to add some more chart styles, including the modified box plot.