const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

module.exports = (urls, callback) => {
    // Init var is {urls} array
    let isArray = false;
    // Init var to contain axios promises
    const promises = [];

    // If {urls} is an array
    // Make request to each url in {urls}
    if (typeof urls === 'object') {
        isArray = true;
        for (let i = 0; i < urls.length; i++) {
            if (typeof urls[i] === 'number') {
                const url = `${process.env.AWSUBS_BASE_URL}/?p=${urls[i]}`;
                promises.push(axios.get(url));
            } else {
                promises.push(axios.get(urls[i]));
            }
        }
    } else if (typeof urls === 'number') {
        const url = `${process.env.AWSUBS_BASE_URL}/?p=${urls}`;
        promises.push(axios.get(url));
    } else {
        promises.push(axios.get(urls));
    }

    axios
        .all(promises)
        .then((responses) => {
            // Init var to contain posts
            const posts = [];

            responses.forEach((response) => {
                // Parse the response html with cheerio
                const $ = cheerio.load(response.data);

                // Define the post schema
                const post = {
                    post_id: 0,
                    title: '',
                    episode: '',
                    url: '',
                    thumbnail_url: '',
                    series: '',
                    series_url: '',
                    released_at: '',
                    dllink: [],
                };

                // Get each elem needed for the post
                const postIdElem = $('[rel=shortlink]');
                const titleElem = $('.featured2 > h1');
                const seriesElem = $('.kategori a');
                const datetimeElem = $('.kategori');
                const dllinkTitleElems = $('.dl-box .dl-title');
                const thumbnailElem = $('.fpost .separator img');

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
                const episodeNum = episodePos > 0 ? titleSplit[episodePos + 1] : '1';

                // Get the datetime of the post
                const katText = datetimeElem.text().toLowerCase();
                const startIndex = katText.indexOf('dirilis:') + 9;
                const endIndex = katText.indexOf('|', startIndex) - 1;
                const datetimeText = katText.slice(startIndex, endIndex);
                const datetime = moment(datetimeText, 'MMMM Do- YYYY- h-mm a');

                // Init var to contain dllinks
                const dllinks = [];
                // Get the download links
                dllinkTitleElems.each((i, dllinkTitleElem) => {
                    // Define the dllink schema
                    const dllink = {
                        title: '',
                        items: [],
                    };

                    // Init var to contain items
                    const items = [];

                    // Get items elem
                    const itemElems = $(dllinkTitleElem).next();

                    // Foreach itemElem get item
                    itemElems.find('a').each((j, itemElem) => {
                        // Define item schema
                        const item = {
                            source: '',
                            url: '',
                        };

                        // Put in schema
                        item.source = $(itemElem).text();
                        item.url = $(itemElem).attr('href');

                        // Push into items container
                        items.push(item);
                    });

                    // Put in schema
                    dllink.title = $(dllinkTitleElem).text();
                    dllink.items = items;

                    // Push to dllinks container
                    dllinks.push(dllink);
                });

                // Put in schema
                post.post_id = parseInt(postId, 10);
                post.title = titleElem.text();
                post.episode = episodeNum;
                post.url = response.config.url;
                post.thumbnail_url = thumbnailElem.attr('src');
                post.series = seriesElem.text();
                post.series_url = process.env.AWSUBS_BASE_URL + seriesElem.attr('href');
                post.released_at = datetime.toJSON();
                post.dllink = dllinks;

                // Push to posts
                posts.push(post);
            });

            if (isArray) {
                // If {urls} is array send the whole array
                callback(null, posts);
            } else {
                // If not, only send the first one
                callback(null, posts[0]);
            }
        })
        .catch((err) => {
            callback(err);
        });
};
