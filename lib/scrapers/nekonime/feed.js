const cheerio = require('cheerio');
const fetch = require('node-fetch');

const config = require('./config');

/**
 *
 * @param {Integer} page
 */
const feedParser = async (page) => {
  const url = `${config.baseUrl}/page/${page}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Parse the response html with cheerio
    const $ = cheerio.load(text);
    // Get the posts element
    const postsElem = $('.dramagrid li .thumb a');

    // Init var to contain posts
    const posts = [];

    postsElem.each((i, postElem) => {
      // Push it to posts
      posts.push({
        title: $(postElem).text(),
        url: $(postElem).attr('href'),
        thumbnailUrl: $(postElem)
          .find('img')
          .attr('src'),
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

module.exports = feedParser;
