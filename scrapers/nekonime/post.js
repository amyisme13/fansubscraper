const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

const { baseUrl } = require('./config');

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
                const url = `${baseUrl}/?p=${urls[i]}`;
                promises.push(axios.get(url));
            } else {
                promises.push(axios.get(urls[i]));
            }
        }
    } else if (typeof urls === 'number') {
        const url = `${baseUrl}/?p=${urls}`;
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
                    thumbnail_others: [],
                    series: '',
                    series_url: '',
                    released_at: '',
                    dllink: [],
                };

                // Get each elem needed for the post
                const postIdElem = $('[rel=shortlink]');
                const titleElem = $('.dchanzititle h1');
                const seriesElem = $('.taxonomy.category');
                const seriesurlElem = $('.loliinfo a:contains(Episodes)');
                const datetimeElem = $('.dchanztitle-small > b:nth-child(4)');
                const thumbnailElem = $('.boxcontent p .crazy_lazy');
                let dllinkElems = $('.download > ul > li');
                if (dllinkElems.not(':has(li)').text() === '') {
                    dllinkElems = $('.download > ul > li > ul > li');
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
                const episodeNum = episodePos > 0 ? titleSplit[episodePos + 1] : '1';

                // Get the datetime of the post
                const datetimeText = datetimeElem.text().toLowerCase();
                const datetime = moment(datetimeText, 'MMM Do YYYY -- h-mm a');

                // Get other thumbnails url
                const srcsetText = thumbnailElem.attr('srcset');
                const srcset = srcsetText.split(', ');
                const thumbnailOthers = [];
                srcset.forEach((src) => {
                    // Define thumbnailOther schema
                    const thumbnailOther = {
                        width: '',
                        url: '',
                    };

                    // Split the source to get url & width
                    const srcSplit = src.split(' ');

                    // Put in schema
                    const [srcUrl, srcWidth] = srcSplit;
                    thumbnailOther.width = srcUrl;
                    thumbnailOther.url = srcWidth;

                    thumbnailOthers.push(thumbnailOther);
                });

                // Init var to contain dllinks
                const dllinks = [];
                // Get the download links
                dllinkElems.each((i, dllinkElem) => {
                    // Define the dllink schema
                    const dllink = {
                        title: '',
                        items: [],
                    };

                    // Get elem needed
                    const dlTitleElem = $(dllinkElem).find('strong');
                    const itemElems = $(dllinkElem).find('a');

                    // Init var to contain items
                    const items = [];

                    // Foreach itemElem get item
                    itemElems.each((j, itemElem) => {
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
                    dllink.title = dlTitleElem.text();
                    dllink.items = items;

                    // Push to dllinks container
                    dllinks.push(dllink);
                });

                // Put in schema
                post.post_id = parseInt(postId, 10);
                post.title = titleElem.text();
                post.episode = episodeNum;
                post.url = response.config.url;
                post.thumbnail_url = thumbnailElem.attr('data-src');
                post.thumbnail_others = thumbnailOthers;
                post.series = seriesElem.text();
                post.series_url = seriesurlElem.attr('href');
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
