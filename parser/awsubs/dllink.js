const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(url, cb) {
    axios.get(url)
        .then((res) => {
            const linkTitles = [
                'Solidfiles', 'Mirror', 'GoogleDrive'
            ];
            let links = [];

            const $ = cheerio.load(res.data);
            const titleEls = $('.dl-box .dl-title');
            
            titleEls.each((i, el) => {
                let title = $(el).text();
                let itemsEl = $(el).next();
                let items = [];

                itemsEl.find('a').each((i, el) => {
                    let linkTitle = $(el).text();
                    // Commented to get all the link provided
                    // if(linkTitles.indexOf(linkTitle) >= 0) {
                        items.push({
                            source: linkTitle,
                            url: $(el).attr('href')
                        });
                    // }
                });

                links.push({
                    title: title,
                    items: items
                });
            });

            cb(links)
        });
}