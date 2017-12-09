const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

module.exports = (url, cb) => {
    axios.get(url).then((res) => {
        const $ = cheerio.load(res.data);

        const anime = {};

        // Get episode number position in title
        const titleSplit = $('.featured2 > h1')
            .text()
            .toLowerCase()
            .split(' ');
        const episodePos = titleSplit.indexOf('episode');

        // Get release time text
        const katText = $('.kategori')
            .text()
            .toLowerCase();
        const startIndex = katText.indexOf('dirilis:') + 9;
        const endIndex = katText.indexOf('|', startIndex) - 1;
        const slicedKatText = katText.slice(startIndex, endIndex);

        anime.title = $('.featured2 > h1').text();
        anime.episode = episodePos > 0 ? titleSplit[episodePos + 1] : '1';
        anime.series = $('.kategori > a').text();
        anime.series_url = process.env.AWSUBS_BASE_URL + $('.kategori > a').attr('href');
        anime.date = moment(slicedKatText, 'MMMM Do- YYYY- h-mm a').toJSON();
        anime.url = url;

        cb(anime);
    });
};
