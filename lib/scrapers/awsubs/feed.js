const cheerio = require('cheerio');
const fetch = require('node-fetch');

const config = require('./config');

/**
 *
 * @param {Integer} page
 */
const feedScraper = async (page) => {
    const url = `${config.baseUrl}/page/${page}`;

    try {
        const response = await fetch(url);
        const text = await response.text();

        // Parse the response html with cheerio
        const $ = cheerio.load(text);
        // Get the posts element
        const postsElem = $('.aztanime:not(:contains(Other))');

        // Init var to contain posts
        const posts = [];

        postsElem.each((i, postElem) => {
            // Get the title element
            const titleElem = $(postElem).find('h1 a');

            // Push it to posts
            posts.push({
                title: titleElem.text(),
                url: titleElem.attr('href'),
                thumbnailUrl: $(postElem).find('.thumbnail img').attr('src'),
            });
        });

        const feed = {
            provider: {
                name: config.name,
                url,
            },
            posts,
        };

        return feed;
    } catch (err) {
        throw err;
    }
};

module.exports = feedScraper;
