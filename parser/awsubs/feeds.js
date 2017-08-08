const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

module.exports = function(_page = 10, cb) {
    let promises = [];
    for(let i = 1; i <= _page; i++) {
        promises.push(axios.get('http://awsubs.co/page/' + i))
    }
    
    axios.all(promises)
        .then((results) => {
            let feeds = [];
            
            results.forEach((res) => {
                let $ = cheerio.load(res.data);
                const seriesEls = $('.aztanime:not(:contains(Other))');

                seriesEls.each((i, el) => {
                    let episode = {};
                    
                    let titleSplit = $(el).find('h1 a').text().toLowerCase().split(' ');
                    let episodePos = titleSplit.indexOf('episode');

                    let katText = $(el).find('.kategori').text().toLowerCase();
                    let slicedKatText = katText.slice(katText.indexOf('released on') + 12);

                    episode.title = $(el).find('h1 a').text();
                    episode.episode = (episodePos > 0) ? titleSplit[episodePos + 1] : '1'; 
                    episode.anime = $(el).find('.kategori a').text();
                    episode.url = $(el).find('h1 a').attr('href');
                    episode.dllink = process.env.BASE_URL + '/awsubs/dl/' + encodeURIComponent($(el).find('h1 a').attr('href'));
                    episode.date = moment(slicedKatText.slice(0, slicedKatText.indexOf('\r')), 'MMMM Do- YYYY').format('YYYY-MM-DD');

                    feeds.push(episode);
                });
            });

            cb(feeds);
        });
}