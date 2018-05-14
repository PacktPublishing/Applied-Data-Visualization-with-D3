function show() {

    'use strict';

    var margin = {top: 20, bottom: 20, right: 20, left: 20},
        width = 1100 - margin.left - margin.right,
        height = 750 - margin.top - margin.bottom;

    var CHAR_SIZE = 25;
    var LOC_SIZE = 5;

    d3.select(".chart").append("defs").append("clipPath")
        .attr("id","clip-1")
        .append("circle")
        .attr("r", CHAR_SIZE)

    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.xml("data/simpsons_logo.svg").mimeType("image/svg+xml").get(function(error, xml) {
        var logoAndText = svg.append("g")
            .attr("class", "title")
        logoAndText.node().appendChild(xml.documentElement);
        logoAndText.select("svg g").attr("transform", "translate(-55 -140) scale(0.4)")

        logoAndText.append("text").text("Characters & Locations")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (width/2) + ", 50)")
    });
}
