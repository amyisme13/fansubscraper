const axios = require('axios');
const cheerio = require('cheerio');
const Series = require('../../schemas/series');

module.exports = (url, cb) => {
    axios.get(url).then((res) => {
        const $ = cheerio.load(res.data);
        const animesEls = $('.title-cell a.series');
        const animes = [];

        animesEls.each((i, el) => {
            const anime = {};

            // Khusus untuk beberapa nama anime yg menggunakan '@'
            const exception = ['11911', '15261'];
            if (exception.indexOf($(el).attr('rel')) >= 0) {
                const title = $(el).attr('title');
                const openPos = title.indexOf('[email');
                const closePos = title.indexOf('>');
                const cuttedTitle = title.slice(0, openPos) + title.slice(closePos + 2);

                anime.title = cuttedTitle.replace('*/', 'iDOLM@STER');
            } else {
                anime.title = $(el).text();
            }
            anime.url = $(el).attr('href');
            anime.series_id = $(el).attr('rel');

            Series.findOne({ series_id: anime.series_id }, (err, animedb) => {
                if (!animedb) {
                    const series = new Series(anime);
                    series.save();
                }
            });

            animes.push(anime);
        });

        cb(animes);
    });
};
