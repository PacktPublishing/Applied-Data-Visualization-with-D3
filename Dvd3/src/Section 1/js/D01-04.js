function show() {

    'use strict';

    var margin = {top: 200, bottom: 120, right: 50, left: 200},
        width = 900 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

    var svg = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ","
            + margin.top + ")");

    d3.xml("data/simpsons_logo.svg").mimeType("image/svg+xml").get(function(error, xml) {
        var logoAndText = svg.append("g")
            .attr("transform", "translate(-180 -200)")
            .attr("class", "title")
        logoAndText.node().appendChild(xml.documentElement);
        logoAndText.select("svg g").attr("transform", "translate(-55 -140) scale(0.4)")

        svg.append("text").text("~ Appearances together in all seasons ~")
            .attr("text-anchor", "middle")
            .attr("class", "title")
            .attr("transform", "translate(" + (width/2) + " " + -160 +")");
    });

    d3.queue()
        .defer(d3.csv, "./data/appear_together_all.csv")
        .defer(d3.csv, "./data/characters.csv")
        .await(function (error, words, characters) {
            process(words, characters)
        });

    function process(data, characters) {

        var characterKV = characters.reduce(function (res, el) {
            res[el.id] = el;
            return res;
        }, {});

        var toIds = data.map(function (d) { return d.from });
        var fromIds = data.map(function (d) { return d.to });
        var uniqueIds = _.uniq(toIds.concat(fromIds));

        var max = d3.max(data, function (d) { return +d.value });
        var cv = d3.scaleLog().base(10).domain([1, max]).range([0, 1]);
        var color = function (v) {
            return v == 0 ? d3.rgb(255, 255, 255) : d3.interpolateBlues(cv(v));
        };
        var x = d3.scaleBand().range([0, width]).domain(d3.range(0, uniqueIds.length)).paddingInner([0.05]);

        var uniqueCounts = determineTotalValue(uniqueIds, data);
        var uniqueTargets = determineTotalCount(uniqueIds, data);

        var idsEnriched = uniqueIds.map(function (d, i) {
            return { id: d, total: uniqueCounts[i], counts: uniqueTargets[i]}
        });

        var sorts = [sortTotal, sortCounts];
        var toShow = prepareData(data, idsEnriched, sorts[0]);
        show(toShow);

        function prepareData(data, idsEnriched, sort) {
            var idsEnriched = sort(idsEnriched);
            var matrix = [];
            uniqueIds.forEach(function (id, i) {
                matrix[i] = Array.apply(null, Array(uniqueIds.length)).map(Number.prototype.valueOf, 0);
            });

            data.forEach(function (d) {
                var n = _.findIndex(idsEnriched, {id: d.from});
                var m = _.findIndex(idsEnriched, {id: d.to});
                matrix[n][m] = +d.value;
                matrix[m][n] = +d.value;
            });

            var mappedData = idsEnriched.map(function (d, i) {
                return {id: d.id, row: matrix[i]}
            });

            return mappedData;
        }

        function show(toShow) {

            var row = svg.selectAll(".row")
                .data(toShow, function (d) { return d.id });
            var newRows = row.enter()
                .append("g")
                .attr("class", "row")
                .on("click", function (d) {
                    sorts.reverse();
                    show(prepareData(data, idsEnriched, sorts[0]));
                })

            newRows.merge(row)
                .transition().duration(2000)
                    .attr("transform", function (d, i) {
                        return "translate(0," + x(i) + ")";
                    })
                .each(function (d, i) {
                    var rectangles = d3.select(this).selectAll("rect").data(d.row)

                    rectangles.enter().append("rect")
                        .merge(rectangles)
                        .attr("x", function (d, j) { return x(j)})
                        .attr("height", x.bandwidth())
                        .attr("width", x.bandwidth())
                        .attr("data-r", function(e, j) {return i})
                        .attr("data-c", function(e, j) {return j})
                        .on("mouseover", mouseOver)
                        .on("mouseout", mouseOut)
                        .transition().duration(2000)
                            .attr("fill", function (e, j) {
                                return i == j ? d3.rgb(200, 200, 200) : color(e);
                            });
                });

            var topText = svg.selectAll(".top").data(toShow, function (d) { return d.id })

            topText.enter()
                .append("text")
                .attr("class", "top")
                .attr("dx", "0.5em")
                .text(function (e, j) { return characterKV[toShow[j].id].name})
                .attr("text-anchor", "begin")
                .merge(topText)
                .transition().duration(2000)
                    .attr("transform", function (d, j) {
                        return "translate(" + (x(j) + (x.bandwidth())) + " 0) rotate(-90)"
                    });

            newRows.append("text")
                .attr("dy", "0.8em")
                .attr("dx", "-0.3em")
                .attr("fill", "black")
                .attr("class", "left")
                .attr("text-anchor", "end")
                .text((function (d, i) {
                    return characterKV[d.id].name
                }));

            svg.append("text")
                .attr("class","legend")
                .attr("transform", "translate(" + (width/2) + " " + (height+100) + ")")
                .text("")
        }

        function mouseOver(d) {
            var r = +d3.select(this).attr("data-r");
            var c = +d3.select(this).attr("data-c");

            d3.selectAll("rect").filter(function(e) {return +d3.select(this).attr("data-c") === c})
                .filter(function(e) {return +d3.select(this).attr("data-r") < r})
                .attr("opacity","0.3")
            d3.selectAll("rect").filter(function(e) {return +d3.select(this).attr("data-r") === r})
                .filter(function(e) {return +d3.select(this).attr("data-c") < c}).attr("opacity","0.3")
            d3.selectAll(".legend").text("~ " + d + " ~")
        }

        function mouseOut(d) {
            d3.selectAll("rect").attr("opacity", "1")
        }

        function determineTotalValue(uniqueIds, data) {
            var uniqueCounts = uniqueIds.map(function (d) {
                var toCount = _.filter(data, {to: d}).reduce(function (initial, d) {
                    return initial + +d.value
                }, 0);
                var fromCount = _.filter(data, {from: d}).reduce(function (initial, d) {
                    return initial + +d.value
                }, 0);

                return toCount + fromCount;
            });

            return uniqueCounts;
        }

        function determineTotalCount(uniqueIds, data) {
            var uniqueTargets = uniqueIds.map(function (d) {
                var toCount = _.filter(data, {to: d}).length
                var fromCount = _.filter(data, {from: d}).length

                return toCount + fromCount;
            });

            return uniqueTargets;
        }

        function sortCounts(data) {
            return _.sortBy(data, ["counts"]).reverse()
        }

        function sortTotal(data) {
            return _.sortBy(data, ["total"]).reverse()
        }
    };
};
