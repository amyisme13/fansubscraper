const cheerio = require('cheerio');
const fetch = require('node-fetch');
const moment = require('moment');

const config = require('./config');

/**
 *
 * @param {String} url
 */
const postParser = async (url) => {
    try {
        const response = await fetch(url);
        const text = await response.text();

        // Parse the response html with cheerio
        const $ = cheerio.load(text);

        // Get each elem needed for the post
        const postIdElem = $('[rel=shortlink]');
        const titleElem = $('.featured2 > h1');
        const seriesElem = $('.kategori a');
        const datetimeElem = $('.kategori');
        const downloadTitleElems = $('.dl-box .dl-title');
        const thumbnailElem = $('.fpost img');

        // Get the post id from shortlink
        const postIdUrl = postIdElem.attr('href');
        const pPos = postIdUrl.indexOf('p=');
        const postId = postIdUrl.slice(pPos + 2);

        // Get the episode from title
        const titleSplit = titleElem
            .text()
            // Fak u awsub
            .replace(/\u00a0/g, ' ')
            .toLowerCase()
            .split(' ');
        const episodePos = titleSplit.indexOf('episode');
        const episodeStr = episodePos > 0 ? titleSplit[episodePos + 1] : -1;
        const episodeNum = parseInt(episodeStr, 10);

        // Get the datetime of the post
        const katText = datetimeElem.text().toLowerCase();
        const startIndex = katText.indexOf('dirilis:') + 9;
        const endIndex = katText.indexOf('|', startIndex) - 1;
        const datetimeText = katText.slice(startIndex, endIndex);
        const datetime = moment(datetimeText, 'MMMM Do- YYYY- h-mm a');

        // Init var to contain downloads
        const downloads = [];
        // Get the download links
        downloadTitleElems.each((i, downloadTitleElem) => {
            // Init var to contain sources
            const sources = [];

            // Get sources elem
            const sourcesElems = $(downloadTitleElem).next();

            // Foreach sourcesElem get source
            sourcesElems.find('a').each((j, sourceElem) => {
                // Push into sources container
                sources.push({
                    name: $(sourceElem).text(),
                    url: $(sourceElem).attr('href'),
                });
            });

            // Push to downloads container
            downloads.push({
                title: $(downloadTitleElem).text(),
                sources,
            });
        });

        const post = {
            provider: {
                name: config.name,
                url,
            },
            postId: parseInt(postId, 10),
            title: titleElem.text(),
            episode: Number.isNaN(episodeNum) ? -1 : episodeNum,
            url,
            thumbnailUrl: thumbnailElem.attr('src'),
            series: seriesElem.text(),
            seriesUrl: config.baseUrl + seriesElem.attr('href'),
            releasedAt: datetime.toJSON(),
            downloads,
        };

        return post;
    } catch (err) {
        throw err;
    }
};

module.exports = postParser;
