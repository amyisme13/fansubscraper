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
        it('should be a valid feed schema', async () => {
            const result = await nekonime.feed(1);

            assert.jsonSchema(result, feedSchema);
        });
    });

    describe('post', () => {
        it('should be a valid post schema', async () => {
            const feed = await nekonime.feed(1);
            const result = await nekonime.post(feed.posts[1].url);

            assert.jsonSchema(result, postSchema);
        });
    });
});
