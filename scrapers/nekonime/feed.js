const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

const postScraper = require('./post')

module.exports = (_page, callback) => {
    // Init var to contain axios promises
    let promises = []
    
    // If {_page} is an array
    // Make request to awsubs page {_page[i]}
    if(typeof _page === 'object') {
        for(let i = 0; i < _page.length; i++) {
            let url = `${process.env.NEKONIME_BASE_URL}/page/${_page[i]}`
            promises.push(axios.get(url))
        }
    } else {
        let url = `${process.env.NEKONIME_BASE_URL}/page/${_page}`
        promises.push(axios.get(url))
    }

    axios.all(promises)
        .then((responses) => {
            // Init var to contain posts URL
            let postsURL = []

            responses.forEach((response) => {
                // Parse the response html with cheerio
                const $ = cheerio.load(response.data);
                // Get the posts element
                const postsElem = $('.dramagrid li .thumb a');
                // Get each post url and push it to postsURL array
                postsElem.each((i, postElem) => {
                    postsURL.push($(postElem).attr('href'))
                })
            })

            // Using the post scraper, scrape each url
            postScraper(postsURL, (err, posts) => {
                if(err) {
                    callback(err)
                }
                
                // Update each post dllinks
                // Instead of the download link turn into /dl/links
                for(let i = 0; i < posts.length; i++) {
                    posts[i].dllink = `${process.env.BASE_URL}/nekonime/dl/` + encodeURIComponent(posts[i].url)
                }

                callback(err, posts)
            })
        })
        .catch((err) => {
            callback(err)
        })
}