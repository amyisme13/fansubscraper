const axios = require('axios');
const cheerio = require('cheerio');
const Series = require('../../schemas/series');

module.exports = function(url, cb) {
    axios.get(url)
        .then((res) => {
            let $ = cheerio.load(res.data);
            const animesEls = $('.title-cell a.series');
            let animes = [];

            animesEls.each((i, el) => {
                let anime = {};

                // Khusus untuk beberapa nama anime yg menggunakan '@'
                const exception = ['11911', '15261'];
                if(exception.indexOf($(el).attr('rel')) >= 0) {
                    let title = $(el).attr('title');
                    let openPos = title.indexOf('[email');
                    let closePos = title.indexOf('>');
                    let cuttedTitle = title.slice(0, openPos) + title.slice(closePos + 2);
                    
                    anime.title = cuttedTitle.replace('*/', 'iDOLM@STER');
                } else {
                    anime.title = $(el).text();
                }
                anime.url = $(el).attr('href');
                anime.series_id = $(el).attr('rel');

                Series.findOne({series_id: anime.series_id}, (err, animedb) => {
                    if(!animedb) {
                        let series = new Series(anime);
                        series.save();
                    }
                });

                animes.push(anime);
            });
            
            cb(animes);
        });
}