const cheerio = require('cheerio');
const fetch = require('node-fetch');
const moment = require('moment');

const config = require('./config');

/**
 *
 * @param {String} url
 */
const postParser = async (url) => {
  try {
    const response = await fetch(url);
    const text = await response.text();

    // Parse the response html with cheerio
    const $ = cheerio.load(text);

    // Get each elem needed for the post
    const postIdElem = $('article.type-post');
    const titleElem = $('article.type-post h1.single-post-title');
    const seriesElem = $('article.type-post .term-badge a');
    const seriesurlElem = $('article.type-post .term-badge a');
    const datetimeElem = $('[property="article:published_time"]');
    let thumbnailElem = $('article.type-post img.aligncenter.size-medium');
    if ($('article.type-post img.aligncenter.size-full').length > 0) {
      thumbnailElem = $('article.type-post img.aligncenter.size-full');
    }
    let downloadElems = $('.download > ul > li');
    if (downloadElems.not(':has(li)').text() === '') {
      downloadElems = $('.download > ul > li > ul > li');
    }

    // Get the post id from shortlink
    const postIdId = postIdElem.attr('id');
    const postId = postIdId.replace('post-', '');

    // Get the episode from title
    const titleSplit = titleElem
      .text()
      .toLowerCase()
      .split(' ');
    const episodePos = titleSplit.indexOf('episode');
    const episodeStr = episodePos > 0 ? titleSplit[episodePos + 1] : -1;
    const episodeNum = parseInt(episodeStr, 10);

    // Get the datetime of the post
    const datetimeText = datetimeElem.attr('content').replace('+00', '+07');
    const datetime = moment.utc(datetimeText);

    // Get other thumbnails url
    const srcsetText = thumbnailElem.attr('srcset');
    const srcset = srcsetText.split(', ');
    const thumbnailOthers = [];
    srcset.forEach((src) => {
      // Split the source to get url & width
      const [srcUrl, srcWidth] = src.split(' ');

      thumbnailOthers.push({
        width: parseInt(srcWidth, 10),
        url: srcUrl,
      });
    });

    // Init var to contain downloads
    const downloads = [];
    // Get the download links
    downloadElems.each((i, downloadElem) => {
      // Get elem needed
      const dlTitleElem = $(downloadElem).find('strong');
      const sourceElems = $(downloadElem).find('a');

      // Init var to contain sources
      const sources = [];

      // Foreach sourceElem get source
      sourceElems.each((j, sourceElem) => {
        // Push into sources container
        sources.push({
          name: $(sourceElem).text(),
          url: $(sourceElem).attr('href'),
        });
      });

      // Push to downloads container
      downloads.push({
        title: dlTitleElem.text(),
        sources,
      });
    });

    const seriesUrl = seriesurlElem.length > 0 ? seriesurlElem.attr('href') : config.baseUrl;

    const post = {
      provider: {
        name: config.name,
        url,
      },
      postId: parseInt(postId, 10),
      title: titleElem.text().trim(),
      episode: Number.isNaN(episodeNum) ? -1 : episodeNum,
      url,
      thumbnailUrl: thumbnailElem.attr('src'),
      series: seriesElem.text(),
      seriesUrl,
      releasedAt: datetime.toJSON(),
      downloads,
      additional: {
        thumbnailOthers,
      },
    };
    return post;
  } catch (err) {
    throw err;
  }
};

module.exports = postParser;
