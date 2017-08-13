const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

module.exports = (urls, callback) => {
    // Init var is {urls} array
    let isArray = false
    // Init var to contain axios promises
    let promises = []
    
    // If {urls} is an array
    // Make request to each url in {urls}
    if(typeof urls === 'object') {
        isArray = true
        for(let i = 0; i < urls.length; i++) {
            if(typeof urls[i] === 'number') {
                let url = `${process.env.NEKONIME_BASE_URL}/?p=${urls[i]}`
                promises.push(axios.get(url))
            } else {
                promises.push(axios.get(urls[i]))
            }
        }
    } else if(typeof urls === 'number') {
        let url = `${process.env.NEKONIME_BASE_URL}/?p=${urls}`
        promises.push(axios.get(url))
    } else {
        promises.push(axios.get(urls))
    }

    axios.all(promises)
        .then((responses) => {
            // Init var to contain posts
            let posts = []

            responses.forEach((response) => {
                // Parse the response html with cheerio
                const $ = cheerio.load(response.data);

                // Define the post schema
                let post = {
                    post_id: 0,
                    title: "",
                    episode: "",
                    url: "",
                    thumbnail_url: "",
                    thumbnail_others: [],
                    series: "",
                    series_url: "",
                    released_at: "",
                    dllink: []
                }

                // Get each elem needed for the post
                const postIdElem = $('[rel=shortlink]')
                const titleElem = $('.dchanzititle h1')
                const seriesElem = $('.taxonomy.category')
                const seriesurlElem = $('.loliinfo a:contains(Episodes)')
                const datetimeElem = $('.dchanztitle-small > b:nth-child(4)')
                const dllinkElems = $('.download > ul > li')
                const thumbnailElem = $('.boxcontent p .crazy_lazy')
                
                // Get the post id from shortlink
                const postIdUrl = postIdElem.attr('href')
                const pPos = postIdUrl.indexOf('p=')
                const postId = postIdUrl.slice(pPos + 2)

                // Get the episode from title
                const titleSplit = titleElem.text().toLowerCase().split(' ')
                const episodePos = titleSplit.indexOf('episode')
                const episodeNum = (episodePos > 0) ? titleSplit[episodePos + 1] : '1';

                // Get the datetime of the post
                const datetimeText = datetimeElem.text().toLowerCase()
                const datetime = moment(datetimeText, 'MMM Do YYYY -- h-mm a')

                // Get other thumbnails url
                const srcsetText = thumbnailElem.attr('srcset')
                const srcset = srcsetText.split(', ')
                let thumbnailOthers = []
                srcset.forEach((src) => {
                    // Define thumbnailOther schema
                    let thumbnailOther = {
                        width: "",
                        url: ""
                    }

                    // Split the source to get url & width
                    const srcSplit = src.split(' ')

                    // Put in schema 
                    thumbnailOther.width = srcSplit[1]
                    thumbnailOther.url = srcSplit[0]
                    console.log(src)

                    thumbnailOthers.push(thumbnailOther)
                })

                // Init var to contain dllinks 
                let dllinks = []
                // Get the download links
                dllinkElems.each((i, dllinkElem) => {
                    // Define the dllink schema
                    let dllink = {
                        title: "",
                        items: []
                    }

                    // Get elem needed
                    const titleElem = $(dllinkElem).find('strong')
                    const itemElems = $(dllinkElem).find('a')

                    // Init var to contain items
                    let items = []

                    // Foreach itemElem get item
                    itemElems.each((i, itemElem) => {
                            // Define item schema
                            let item = {
                                source: "",
                                url: ""
                            }

                            // Put in schema
                            item.source = $(itemElem).text()
                            item.url = $(itemElem).attr('href')

                            // Push into items container
                            items.push(item)
                        })

                    // Put in schema
                    dllink.title = titleElem.text()
                    dllink.items = items

                    // Push to dllinks container
                    dllinks.push(dllink)
                })

                // Put in schema
                post.post_id = parseInt(postId)
                post.title = titleElem.text()
                post.episode = episodeNum
                post.url = response.config.url
                post.thumbnail_url = thumbnailElem.attr('data-src')
                post.thumbnail_others = thumbnailOthers
                post.series = seriesElem.text()
                post.series_url = seriesurlElem.attr('href')
                post.released_at = datetime.toJSON()
                post.dllink = dllinks

                // Push to posts
                posts.push(post)
            })

            if(isArray) {
                // If {urls} is array send the whole array
                callback(null, posts)
            } else {
                // If not, only send the first one
                callback(null, posts[0])
            }
        })
        .catch((err) => {
            callback(err)
        })
}