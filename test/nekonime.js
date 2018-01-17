const fetch = require('node-fetch');
const chai = require('chai');

const nekonime = require('../lib/scrapers/nekonime');
const feedSchema = require('./support/feedschema');
const postSchema = require('./support/postschema');

const { assert } = chai;
chai.use(require('chai-json-schema'));

describe('nekonime scraper', () => {
  describe('base url', () => {
    it('should not be broken', async () => {
      try {
        const result = await fetch(nekonime.config.baseUrl, {
          redirect: 'error',
        });

        assert.equal(result.status, 200);
      } catch (err) {
        assert.isNotOk(err);
      }
    });
  });

  describe('feed', () => {
    describe('page 1', () => {
      it('should be a valid feed schema', async () => {
        const result = await nekonime.feed(1, false);

        assert.jsonSchema(result, feedSchema);
      });
    });

    describe('page 2', () => {
      it('should be a valid feed schema', async () => {
        const result = await nekonime.feed(2);

        assert.jsonSchema(result, feedSchema);
      });
    });
  });

  describe('post', () => {
    it('should be a valid post schema', async () => {
      const feed = await nekonime.feed(2);
      const result = await nekonime.post(feed.posts[1].url);

      assert.jsonSchema(result, postSchema);
    });

    it('should be able to parse different kind of "download" elements', async () => {
      const result = await nekonime.post('https://nekonime.com/garo-vanishing-line-episode-12-subtitle-indonesia/');

      assert.jsonSchema(result, postSchema);
    });
  });
});
