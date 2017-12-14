const axios = require('axios');
const cheerio = require('cheerio');

const postScraper = require('./post');
const { baseUrl } = require('./config');

module.exports = page =>
    new Promise((resolve, reject) => {
        // Init var to contain axios promises
        const promises = [];

        // If {_page} is an array
        // Make request to awsubs page {_page[i]}
        if (typeof page === 'object') {
            for (let i = 0; i < page.length; i++) {
                const url = `${baseUrl}/page/${page[i]}`;
                promises.push(axios.get(url));
            }
        } else {
            const url = `${baseUrl}/page/${page}`;
            promises.push(axios.get(url));
        }

        axios
            .all(promises)
            .then((responses) => {
                // Init var to contain posts URL
                const postsURL = [];

                responses.forEach((response) => {
                    // Parse the response html with cheerio
                    const $ = cheerio.load(response.data);
                    // Get the posts element
                    const postsElem = $('.dramagrid li .thumb a');
                    // Get each post url and push it to postsURL array
                    postsElem.each((i, postElem) => {
                        postsURL.push($(postElem).attr('href'));
                    });
                });

                // Using the post scraper, scrape each url
                postScraper(postsURL, (err, oriPosts) => {
                    if (err) {
                        reject(err);
                    }
                    const updatedPosts = oriPosts;

                    // Update each post dllinks
                    // Instead of the download link turn into /dl/links
                    for (let i = 0; i < updatedPosts.length; i++) {
                        updatedPosts[i].dllink = `${
                            process.env.BASE_URL
                        }/nekonime/dl/${encodeURIComponent(updatedPosts[i].url)}`;
                    }

                    resolve(updatedPosts);
                });
            })
            .catch((err) => {
                reject(err);
            });
    });
