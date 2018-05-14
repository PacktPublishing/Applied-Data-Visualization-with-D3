function show() {

    'use strict';

    var margin = {top: 20, bottom: 20, right: 120, left: 100},
        width = 800 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (width/2 + 100) + "," + height/2 + ")");

    var tree = d3.tree()
        .size([360, 300])
        .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    var stratify = d3.stratify();
    var colorScale = d3.scaleSequential(d3.interpolateSpectral).domain([0,12]);

    var root;
    var currentRoot;

    d3.select("button").on("click", exportAsSVG);

    d3.csv('./data/cats.csv', function(loaded) {
        root = stratify(loaded);
        tree(root);

        var colorGroups = root.descendants().filter(function(node) {return node.depth === 2});
        colorGroups.forEach(function(group, i) {
            group.descendants().forEach(function(node) {node.data.group = i;})
        });

        currentRoot =_.cloneDeep(root);

        update();
    });

    function update() {

        tree(currentRoot);

        var currentRootKV = currentRoot.descendants().reduce(function(kv, el) {kv[el.data.id] = el; return kv},{});

        var toRender = root.descendants().map(function(el) {
            if (currentRootKV[el.data.id]) {
                var newNode = currentRootKV[el.data.id];
                return newNode;
            } else {
                var fromRoot = _.cloneDeep(el);
                var parent = fromRoot.parent;
                while (!currentRootKV[parent.data.id]) {
                    parent = parent.parent;
                }
                var newParent = currentRootKV[parent.data.id];

                fromRoot.hidden = true;
                fromRoot.x = newParent.x;
                fromRoot.y = newParent.y;

                fromRoot.parent.x = newParent.x;
                fromRoot.parent.y = newParent.y;

                return fromRoot;
            }
        });

        var links = chart.selectAll(".link")
            .data(toRender.slice(1));

        var linksEnter = links.enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal({x:0, y:0, parent: {x:0, y:0}}))
            .style("stroke", function(d) {return colorScale(d.data.group)});

        links.merge(linksEnter)
            .transition().duration(2000).attr("d", diagonal);

        var nodes = chart.selectAll(".node").data(toRender);

        var nodesEnter = nodes.enter().append("g")
                .attr("class", "node")
                .on("click", click)

        nodesEnter.append("circle")
            .attr("r", 2.5)
            .style("fill", function(d) {return colorScale(d.data.group)});

        nodesEnter.append("text")
            .attr("dy", ".31em")

        var nodesUpdate = nodes.merge(nodesEnter);

        nodesUpdate.transition().duration(2000)
            .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; })
            .style("opacity", function(d) { return !d.hidden ? 1 : 0} )
            .on("end", function(d) {d.hidden ? d3.select(this).attr("display", "none"): ""})
            .on("start", function(d) {!d.hidden ? d3.select(this).attr("display", ""): ""});

        nodesUpdate.select("text")
            .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
            .text(function(d) {return d.data.name; })
            .style("text-anchor", function(d) {
                if (d.x < 180 && d.children) return "end"
                else if (d.x < 180 && !d.children) return "start"
                else if (d.x >= 180 && !d.children) return "end"
                else if (d.x >= 180 && d.children) return "start"
            })
            .transition().duration(2000)
                .attr("transform", function(d) {
                    return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")";
                })
    }

    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;

            d3.select(this).select("circle").style("stroke", "red");
            d3.select(this).select("circle").style("stroke-width", "2");
        } else {
            d.children = d._children;
            d._children = null;

            d3.select(this).select("circle").style("r", 2.5);
            d3.select(this).select("circle").style("stroke", "");
        }
        update();
    }

    function diagonal(d) {
        return "M" + project(d.x, d.y)
            + "C" + project(d.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
            + " " + project(d.parent.x, d.parent.y);
    }

    function project(x, y) {
        var angle = (x - 90) / 180 * Math.PI, radius = y;
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }

    function exportAsSVG() {

        d3.text('./css/D04-04.css', function(externalStyles) {
            var svgString = nodeToSVGString(d3.select('svg').node(), externalStyles);

            svgString2SVG(svgString);
        });
    }

    function nodeToSVGString( svgNode, cssText ) {
        appendCSS( cssText, svgNode )
        console.log(svgNode);
        return new XMLSerializer().serializeToString(svgNode);

        function appendCSS( cssText, element ) {
            var styleElement = document.createElement("style");
            styleElement.setAttribute("type","text/css");
            styleElement.innerHTML = cssText;

            (element.hasChildNodes() && element.children)
                ? element.insertBefore( styleElement, element.children[0])
                : element.insertBefore( styleElement, null );
        }
    }

    function svgString2SVG( svgString, width, height, callback ) {

        var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        saveAs(blob, "radial-tree.svg");
    }
}
