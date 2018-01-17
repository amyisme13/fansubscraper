const cheerio = require('cheerio');
const fetch = require('node-fetch');

const config = require('./config');
const pageone = require('./special/pageone');

/**
 *
 * @param {Integer} page
 */
const feedParser = async (page, sandbox = true) => {
  const url = `${config.baseUrl}/page/${page}`;

  // Page 1 has its own scraper, because fuck nekonime
  if (parseInt(page, 10) === 1) {
    const posts = await pageone(sandbox);
    return {
      provider: {
        name: config.name,
        url,
      },
      posts,
    };
  }

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Parse the response html with cheerio
    const $ = cheerio.load(text);
    // Get the posts element
    const postsElem = $('article.type-post');

    // Init var to contain posts
    const posts = [];

    postsElem.each((i, postElem) => {
      // if it's an article, then skip
      const badgeElem = $(postElem).find('span.term-badge');
      if (badgeElem.text() === 'Artikel') {
        return;
      }

      const titleElem = $(postElem).find('h2.title a.post-title');
      const thumbElem = $(postElem).find('a.img-holder');

      // Push it to posts
      posts.push({
        title: titleElem.text().trim(),
        url: titleElem.attr('href'),
        thumbnailUrl: thumbElem.css('background-image').slice(4, -1),
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
