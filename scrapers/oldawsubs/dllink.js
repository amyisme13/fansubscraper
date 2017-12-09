const axios = require('axios');
const cheerio = require('cheerio');

module.exports = (url, cb) => {
    axios.get(url).then((res) => {
        const linkTitles = ['Solidfiles', 'Mirror', 'GoogleDrive'];
        const links = [];

        const $ = cheerio.load(res.data);
        const titleEls = $('.dl-box .dl-title');

        titleEls.each((i, el) => {
            const title = $(el).text();
            const itemsEl = $(el).next();
            const items = [];

            itemsEl.find('a').each((j, jEl) => {
                const linkTitle = $(jEl).text();
                // Commented to get all the link provided
                // if(linkTitles.indexOf(linkTitle) >= 0) {
                items.push({
                    source: linkTitle,
                    url: $(jEl).attr('href'),
                });
                // }
            });

            links.push({
                title,
                items,
            });
        });

        cb(links);
    });
};
