const d3 = require('d3');
const fs = require('fs');
const srt = require('srt');
const _ = require('lodash');


var timePeriod = 30;

d3.queue()
    .defer(d3.text, "file:dwList.txt")
    .defer(d3.text, "file:swearnet.srt")
    .await(function (error, dwList, subs) {

        var dirties = dwList.split("\n");
        var srts = srt.fromString(subs.replace(/\r\n/g, "\n"));

        var timedWords = [];
        var allKeys = Object.keys(srts);
        allKeys.forEach(function(key) {
            var startTime = srts[key].startTime;
            var endTime = srts[key].endTime;

            var totalTime = endTime - startTime;
            var words = srts[key].text.match(/[a-zA-Z]+/g);

            if (words) {
                var timePerCharacter = totalTime / words.length;
                words.forEach(function(word, i) {
                    timedWords.push({
                        word: word,
                        time: startTime + (timePerCharacter * i)
                    });
                });
            }
        });

        var lastElement = srts[allKeys.slice(-1)[0]];
        var endTime = lastElement.endTime;

        var onlySW = timedWords.filter(function(timed) {
            return _.includes(dirties, timed.word)
        })

        var grouped = _.groupBy(onlySW, function(timed) {
            return Math.floor((timed.time / (1000 * timePeriod)));
        })


        var groupedPerMinute = d3.range(0, Math.floor(endTime / (1000 * timePeriod)) + 1).map(function(i) {
            return grouped[i] ?
            { minute: i, count: grouped[i].length} :
            { minute: i, count: 0}
        });

        fs.writeFile('./sw-1.csv', d3.csvFormat(groupedPerMinute))
    });
