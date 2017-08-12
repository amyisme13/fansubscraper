const express = require('express');
const router = express.Router();

router.get('/', function(request, response) {
    const _page = request.query.p ? request.query.p : 1

    const feedScraper = require('../scraper/nekonime/feed');
    feedScraper(_page, (err, posts) => {
        if(err) {
            throw err;
        }
        response.header('Content-Type', 'application/json')
                .json(posts);
    });
});

module.exports = router;