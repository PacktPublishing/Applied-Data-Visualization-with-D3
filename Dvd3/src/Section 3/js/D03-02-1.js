function show() {

    'use strict';
    var margin = {top: 20, bottom: 20, right: 20, left: 20},
        width = 1650 - margin.left - margin.right,
        height = 950 - margin.top - margin.bottom;

    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var projection = d3.geoNaturalEarth()
    var path = d3.geoPath().projection(projection);
    var outline = {type: "Sphere"}
    projection.fitSize([width, height], outline);
    var color = function() {return d3.interpolateBrBG(Math.random())};

    svg.append("defs").append("clipPath")
        .attr("id","clip-1")
        .append("path").attr("d", path(outline));

    d3.csv("data/ml_airports.csv",
        function(row) {return {
            name: row.name,
            lat: +row.lat,
            lon: +row.lon
        }},
        function (data) {

            var positions = data.map(function(row) {return [row.lon, row.lat]})

             svg.selectAll("circle").data(positions).enter()
                 .append("circle")
                 .attr("cx", function (d) {
                     return projection([d[0], d[1]])[0]
                 })
                 .attr("cy", function (d) {
                     return projection([d[0], d[1]])[1]
                 })
                 .attr("r", 2)


    })


}
