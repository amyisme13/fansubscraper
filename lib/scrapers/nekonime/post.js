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
        const titleElem = $('.dchanzititle h1');
        const seriesElem = $('.taxonomy.category');
        const seriesurlElem = $('.loliinfo a:contains(Episodes)');
        const datetimeElem = $('.dchanztitle-small > b:nth-child(4)');
        const thumbnailElem = $('.boxcontent p .crazy_lazy');
        let downloadElems = $('.download > ul > li');
        if (downloadElems.not(':has(li)').text() === '') {
            downloadElems = $('.download > ul > li > ul > li');
        }

        // Get the post id from shortlink
        const postIdUrl = postIdElem.attr('href');
        const pPos = postIdUrl.indexOf('p=');
        const postId = postIdUrl.slice(pPos + 2);

        // Get the episode from title
        const titleSplit = titleElem
            .text()
            .toLowerCase()
            .split(' ');
        const episodePos = titleSplit.indexOf('episode');
        const episodeStr = episodePos > 0 ? titleSplit[episodePos + 1] : -1;
        const episodeNum = parseInt(episodeStr, 10);

        // Get the datetime of the post
        const datetimeText = datetimeElem.text().toLowerCase();
        const datetime = moment(datetimeText, 'MMM Do YYYY -- h-mm a');

        // Get other thumbnails url
        const srcsetText = thumbnailElem.attr('srcset');
        const srcset = srcsetText.split(', ');
        const thumbnailOthers = [];
        srcset.forEach((src) => {
            // Split the source to get url & width
            const [srcUrl, srcWidth] = src.split(' ');

            thumbnailOthers.push({
                width: parseInt(srcWidth, 10),
                url: srcUrl,
            });
        });

        // Init var to contain downloads
        const downloads = [];
        // Get the download links
        downloadElems.each((i, downloadElem) => {
            // Get elem needed
            const dlTitleElem = $(downloadElem).find('strong');
            const sourceElems = $(downloadElem).find('a');

            // Init var to contain sources
            const sources = [];

            // Foreach sourceElem get source
            sourceElems.each((j, sourceElem) => {
                // Push into sources container
                sources.push({
                    name: $(sourceElem).text(),
                    url: $(sourceElem).attr('href'),
                });
            });

            // Push to downloads container
            downloads.push({
                title: dlTitleElem.text(),
                sources,
            });
        });

        const seriesUrl = seriesurlElem.length > 0 ? seriesurlElem.attr('href') : config.baseUrl;

        const post = {
            provider: {
                name: config.name,
                url,
            },
            postId: parseInt(postId, 10),
            title: titleElem.text(),
            episode: Number.isNaN(episodeNum) ? -1 : episodeNum,
            url,
            thumbnailUrl: thumbnailElem.attr('data-src'),
            series: seriesElem.text(),
            seriesUrl,
            releasedAt: datetime.toJSON(),
            downloads,
            additional: {
                thumbnailOthers,
            },
        };
        return post;
    } catch (err) {
        throw err;
    }
};

module.exports = postParser;
