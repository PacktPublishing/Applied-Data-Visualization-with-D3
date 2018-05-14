var margin = {top: 60, right: 0, bottom: 100, left: 40},
    width = 700 - margin.left - margin.right,
    height = 330 - margin.top - margin.bottom;

var elementsPerLine = 20,
    gridSize = Math.floor(width / elementsPerLine),
    legendElementWidth = gridSize * 2,
    buckets = 10,
    secondsPerElement = 30;

var addDiagram = function (tsvFile, title) {

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    var chartGroup = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var textGroup = svg.append("g");

    d3.csv(tsvFile,
        function (d) {
            var minute = +d.minute;
            var column = minute % elementsPerLine;
            return {
                column: column,
                value: +d.count,
                row: Math.floor(minute / elementsPerLine)
            };
        },
        function (error, data) {

            var totalHeight = (Math.ceil(data.length / elementsPerLine)) * (gridSize) + margin.top + margin.bottom;
            svg.attr('height', totalHeight);

            var maxValue = d3.max(data, function(d) {return d.value});

            var colorScale = d3.scaleQuantize()
                .range(d3.range(0, buckets ).map(function(i) {
                    return d3.interpolateSpectral((i+1)/buckets);
                }))
                .domain([0, maxValue]);

            chartGroup.selectAll("rect")
                .data(data)
                .enter().append("rect")
                .attr("x", function (d) { return (d.column) * gridSize; })
                .attr("y", function (d) { return (d.row - 1) * gridSize; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "column bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", function(d) {return(colorScale(d.value))});

            chartGroup.selectAll("text")
                .data(d3.range(0, Math.ceil(data.length / elementsPerLine)))
                .enter().append("text")
                .text(function(d, i) {return Math.round(i * elementsPerLine * secondsPerElement / 60) + "m."})
                .attr("class", "mono")
                .attr("text-anchor", "end")
                .attr("y", function(d, i) {return i * gridSize})
                .attr("dx", -5)
                .attr("dy", -5)


            var legendPos = ((Math.floor(data.length / elementsPerLine) + 1) * (gridSize));

            var legend = chartGroup.selectAll(".legend")
                .data(d3.range(0, buckets))

            var newLegends = legend.enter().append("g")
                .attr("class", "legend")

            newLegends.append("rect")
                .attr("x", function (d, i) { return legendElementWidth * i; })
                .attr("y", legendPos)
                .attr("width", legendElementWidth)
                .attr("height", gridSize / 2)
                .style("fill", function (d, i) { return colorScale.range()[i]; })

            newLegends.append("text")
                .attr("class", "mono")
                .text(function (d, i) { return "≥ " + Math.round(maxValue / (buckets) * i); })
                .attr("x", function (d, i) { return legendElementWidth * i; })
                .attr("y", legendPos + gridSize);

            textGroup.append("text")
                .attr("x", 0)
                .attr("y", 20)
                .attr("class", "title")
                .text(title);

        });
};

function show() {
     addDiagram("data/TheBigLebowski.csv", "The Big Lebowski");
}
