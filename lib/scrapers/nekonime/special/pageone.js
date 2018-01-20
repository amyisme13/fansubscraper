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

  // add ignore to prevent istanbul failing
  /* istanbul ignore next */
  const getDatas = () => {
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
        const start = thumbnailUrl.indexOf('(');
        const end = thumbnailUrl.indexOf(')');
        thumbnailUrl = thumbnailUrl.slice(start + 1, end);
      } else {
        thumbnailUrl = thumbElem.getAttribute('data-src');
      }

      data.push({ title, url, thumbnailUrl });
    });

    return data;
  };

  /* istanbul ignore next */
  const page1 = await page.evaluate(getDatas);

  await page.click('a.next');
  await page.waitFor('.bs-animate');

  /* istanbul ignore next */
  const page2 = await page.evaluate(getDatas);

  browser.close();
  return page1.concat(page2);
};
