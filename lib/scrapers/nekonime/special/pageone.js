const puppeteer = require('puppeteer');
const config = require('../config');

module.exports = async (sandbox = true) => {
  let opts = {};
  if (!sandbox) {
    opts = { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  }
  const browser = await puppeteer.launch(opts);
  const page = await browser.newPage();

  await page.goto(config.baseUrl);
  await page.click('div.bs-pagination.bs-ajax-pagination.more_btn_infinity.main-term-none.clearfix > a');
  await page.waitFor('div.listing.listing-modern-grid:nth-child(2)');

  // add ignore to prevent istanbul failing
  /* istanbul ignore next */
  const result = await page.evaluate(() => {
    const data = [];
    // eslint-disable-next-line
    const elements = document.querySelectorAll('article.type-post.listing-mg-type-1');

    elements.forEach((element) => {
      // if it's an article, then skip
      const badge = element.querySelector('.term-badge > a').innerHTML;
      if (badge.toLowerCase() === 'artikel') {
        return;
      }

      const titleElem = element.querySelector('h2.title a');
      const title = titleElem.innerHTML.trim();
      const url = titleElem.getAttribute('href');

      const thumbElem = element.querySelector('a.img-cont');
      let thumbnailUrl = thumbElem.getAttribute('style');
      if (thumbnailUrl) {
        const start = thumbnailUrl.indexOf('("');
        const end = thumbnailUrl.indexOf('")');
        thumbnailUrl = thumbnailUrl.slice(start + 2, end);
      } else {
        thumbnailUrl = thumbElem.getAttribute('data-src');
      }

      data.push({ title, url, thumbnailUrl });
    });

    return data;
  });

  browser.close();
  return result;
};
