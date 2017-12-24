const fetch = require('node-fetch');
const chai = require('chai');

const awsubs = require('../lib/scrapers/awsubs');
const feedSchema = require('./support/feedschema');
const postSchema = require('./support/postschema');

const { assert } = chai;
chai.use(require('chai-json-schema'));

describe('awsubs scraper', () => {
  describe('base url', () => {
    it('should not be broken', async () => {
      try {
        const result = await fetch(awsubs.config.baseUrl, {
          redirect: 'error',
        });

        assert.equal(result.status, 200);
      } catch (err) {
        assert.isNotOk(err);
      }
    });
  });

  describe('feed', () => {
    it('should be a valid feed schema', async () => {
      const result = await awsubs.feed(1);

      assert.jsonSchema(result, feedSchema);
    });
  });

  describe('post', () => {
    it('should be a valid post schema', async () => {
      const feed = await awsubs.feed(1);
      const result = await awsubs.post(feed.posts[0].url);

      assert.jsonSchema(result, postSchema);
    });
  });
});
