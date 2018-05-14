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

    var projection = d3.geoPolyhedralWaterman()
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

            var voronoi = d3.voronoi().extent([[-180, -90], [180, 90 ]]);
            var polygons = voronoi.polygons(positions);

            var group = svg.append("g").selectAll("path").data(polygons).enter()
                .append("path")
                .attr("d", polygonToPath)
                .attr("fill", color)

    })

      function polygonToPath(polygon, i) {
            var points = d3.range(0, polygon.length).map(function(i) {return polygon[i]});
            points.push(points[0])

            if (i === 3835) {
              return ""
            }

            return path({
              "type": "Feature",
              "geometry": {
                  "type": "Polygon",
                  "coordinates": [
                      points
                    ]
                  }
    })
}
}
