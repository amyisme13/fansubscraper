const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

module.exports = function(url, cb) {
    axios.get(url)
        .then((res) => {
            let $ = cheerio.load(res.data);

            let anime = {};

            // Get episode number position in title
            let titleSplit = $('.featured2 > h1').text().toLowerCase().split(' ');
            let episodePos = titleSplit.indexOf('episode');

            // Get release time text
            let katText = $('.kategori').text().toLowerCase();
            let startIndex = katText.indexOf('dirilis:') + 9;
            let endIndex = katText.indexOf('|', startIndex) - 1;
            let slicedKatText = katText.slice(startIndex, endIndex);
            
            anime.title = $('.featured2 > h1').text();
            anime.episode = (episodePos > 0) ? titleSplit[episodePos + 1] : '1';
            anime.series = $('.kategori > a').text();
            anime.series_url = process.env.AWSUBS_BASE_URL + $('.kategori > a').attr('href');
            anime.date = moment(slicedKatText, 'MMMM Do- YYYY- h-mm a').toJSON();
            anime.url = url;

            cb(anime);
        });
}