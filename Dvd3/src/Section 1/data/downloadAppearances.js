var https = require('https');
var cheerio = require('cheerio');
var idl = require('image-downloader');

var mapping = {
    "waylon smithers, jr.": "waylon smithers",
    "charles montgomery burns" : "c. montgomery burns",
    "abraham simpson" : "grampa simpson",
    "irving zitsofsky" : "doctor zitsofsky"
}

var options = {
    host: 'simpsonswiki.com',
    path: '/wiki/Simpsons_Roasting_on_an_Open_Fire/Appearances'
}
var request = https.request(options, function (res) {
    var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
        var loaded = cheerio.load(data);

        var allNames = loaded('ul.gallery.mw-gallery-traditional').first().find('div.gallerytext a').map(function(i, d) {return loaded(d).text()}).toArray();
        var allImageUrls = loaded('ul.gallery.mw-gallery-traditional').first().find('img').map(function(i, d) {return loaded(d).attr("src")}).toArray();

        allNames.forEach(function (d, i) {

            var name = mapping[d.toLowerCase()] ? mapping[d.toLowerCase()] : d.toLowerCase();

            var options = {
                url: allImageUrls[i],
                dest: './images/' + name + ".png",
                done: function(e, filename, image) {
                    if (e) {
                        console.log("Error while downloading ' "+ filename +" ': "  + e.message);
                    }
                    console.log('File saved to', filename);
                },
            };
            idl(options);
        });
    });
});

request.on('error', function (e) {
    console.log("Error while getting wikisimpsons data: " + e.message);
});
request.end();
