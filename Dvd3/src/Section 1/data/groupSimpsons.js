const d3 = require('d3');
const fs = require('fs');
const _ = require('lodash');


d3.queue()
    .defer(d3.csv, "file:simpsons-s18e01.csv")
    .defer(d3.csv, "file:locations.csv")
    .defer(d3.csv, "file:characters.csv")
    .await(function (error, season, locations, characters) {
        process(season, locations, characters)
    });

function process(rows, locations, characters) {

    var sanitizeLocations = {
        "21": "20",
        "23": "20",
        "18": "17",
        "11": "10"
    };

    var removeCharacters = [
        "7", "12", "13", "20", "24", "27", "34", "35",
        "36", "37", "33", "21", "28", "32", "4", "19", "23"];

    var rows = rows.filter(function(d) {return !_.includes(removeCharacters, d.character_id)});

    var locationGroups = {};
    rows.forEach(function(d) {
        var checkId = sanitizeLocations[d.location_id] ? sanitizeLocations[d.location_id] : d.location_id;

        if (!locationGroups[checkId]) {
            var location = {
                id: checkId,
                name: d.raw_location_text,
                persons: []
            };
            locationGroups[checkId] = location;
        }
        locationGroups[checkId].persons.push(d.character_id);
    });

    var links = Object.keys(locationGroups).map(function(groupKey) {
        var data = locationGroups[groupKey];
        var counts = _.countBy(data.persons);

        return Object.keys(counts).map(function(key) {
            return {
                source: "c_" + key,
                target: "l_" + data.id,
                value: counts[key]
            }
        });
    });

    var finalLinks = _.flatten(links);

    var uniqCharacters = _.uniqBy(finalLinks, 'source')
            .map(function(el) {return el.source});
    var filteredCharacters = characters.filter(function(loc) {
        return _.includes(uniqCharacters, "c_" + loc.id);
    }).map(function(el) {
        el.id = "c_" + el.id;
        el.type = "character";
        return el;
    });


    var counted = _.countBy(finalLinks, function(d) {console.log(d); return d.target});
    var locationsToRemove = _.filter(Object.keys(counted), function(d) {return counted[d] === 1});

    var filteredFinalLinks = _.filter(finalLinks, function(d) {
        return !_.includes(locationsToRemove, d.target);
    })

    var uniqLocations = _.uniqBy(filteredFinalLinks, 'target')
        .map(function(el) {return el.target});
    var filteredLocations = locations.filter(function(loc) {
        return _.includes(uniqLocations, "l_" + loc.id);
    }).map(function(el) {
        el.id = "l_" + el.id;
        el.type = "location";
        return el;
    });


    var output = {
        links: filteredFinalLinks,
        characters: filteredCharacters,
        locations: filteredLocations
    };


    fs.writeFile('./graph.json', JSON.stringify(output));
};
