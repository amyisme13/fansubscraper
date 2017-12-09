const express = require('express');

const router = express.Router();

// Scrapper
const feedScraper = require('../scrapers/nekonime/feed');
const postScraper = require('../scrapers/nekonime/post');

router.get('/', (request, response) => {
    const page = request.query.p ? request.query.p : 1;

    feedScraper(page, (err, posts) => {
        if (err) {
            throw err;
        }
        response.header('Content-Type', 'application/json').json(posts);
    });
});

router.get('/dl/:posturl', (request, response) => {
    postScraper(request.params.posturl, (err, post) => {
        if (err) {
            throw err;
        }
        response.header('Content-Type', 'application/json').json(post.dllink);
    });
});

module.exports = router;
