const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

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
            
            // Init var to contain posts promises
            let postsPromises = []
            // Foreach posts url, make a new request
            postsURL.forEach((postURL) => {
                postsPromises.push(axios.get(postURL))
            })

            axios.all(postsPromises)
                .then((postResponses) => {
                    // init var to contain posts
                    let posts = []

                    postResponses.forEach((postResponse) => {
                        // Parse the response html with cheerio
                        const $ = cheerio.load(postResponse.data);

                        // Define the post schema
                        let post = {
                            title: "",
                            episode: "",
                            url: "",
                            thumbnail_url: "",
                            series: "",
                            series_url: "",
                            released_at: "",
                            dllink: ""
                        }

                        // Get each elem needed for the post
                        const titleElem = $('.dchanzititle h1')
                        const seriesElem = $('.taxonomy.category')
                        const seriesurlElem = $('.loliinfo a:contains(Episodes)')
                        const datetimeElem = $('.dchanztitle-small > b:nth-child(4)')
                        const thumbnailElem = $('.boxcontent p .crazy_lazy')

                        // Get the episode from title
                        const titleSplit = titleElem.text().toLowerCase().split(' ')
                        const episodePos = titleSplit.indexOf('episode')
                        const episodeNum = (episodePos > 0) ? titleSplit[episodePos + 1] : '1';

                        // Get the datetime of the post
                        const datetimeText = datetimeElem.text().toLowerCase()
                        const datetime = moment(datetimeText, 'MMM Do YYYY -- h-mm a')

                        // Put in schema
                        post.title = titleElem.text()
                        post.episode = episodeNum
                        post.url = postResponse.config.url
                        post.thumbnail_url = thumbnailElem.attr('data-src')
                        post.series = seriesElem.text()
                        post.series_url = seriesurlElem.attr('href')
                        post.released_at = datetime.toJSON()
                        post.dllink = 'Not Supported Yet'

                        // Push to posts
                        posts.push(post)
                    })
                    
                    callback(null, posts)
                })
                .catch((err) => {
                    callback(err)
                })
        })
        .catch((err) => {
            callback(err)
        })
}