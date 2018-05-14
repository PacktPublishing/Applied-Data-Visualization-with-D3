function show() {

    'use strict';
    var margin = {top: 20, bottom: 20, right: 20, left: 30},
        width = 1000 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var cp1 = {x: 230, y: 200};
    var cp2 = {x: 290, y: 10};
    var cp3 = {x: 300, y: 200};

    drawPath();

    function drawPath() {

        var circles = svg.selectAll("circle").data([cp1, cp2, cp3])
        circles.enter().append("circle")
            .attr("r", 5)
            .attr("fill", "blue")
            .attr("class","cp1")
                .call(d3.drag().on("drag", dragcp))
            .merge(circles)
                .attr("cx", function(d) {return d.x})
                .attr("cy", function(d) {return d.y});

        var line = svg.selectAll(".line").data([0])
        line.enter().append("path")
            .attr("class","line").merge(line)
            .attr("d", getPath)
            .attr("stroke", "black")
            .attr("fill", "none");
    };

    function getPath() {
        var path = d3.path();
        path.moveTo(100, 20);
        path.lineTo(200, 160);
        path.quadraticCurveTo(cp1.x, cp1.y, 250, 120);
        path.bezierCurveTo(cp2.x, cp2.y, cp3.x, cp3.y, 400, 150);
        path.lineTo(500, 90);

        return path.toString();
    }

    function dragcp() {
        var ev = d3.event;
        ev.subject.x = ev.x;
        ev.subject.y = ev.y;
        drawPath();
    }


}
