const express = require('express');
const router = express.Router();

router.get('/', function(request, response) {
    const _page = request.query.p ? request.query.p : 1

    const feedScraper = require('../scrapers/nekonime/feed');
    feedScraper(_page, (err, posts) => {
        if(err) {
            throw err;
        }
        response.header('Content-Type', 'application/json')
                .json(posts);
    });
});

router.get('/dl/:url', function(request, response) {
    const dllinkScraper = require('../scrapers/nekonime/post');
    dllinkScraper(request.params.url, (err, post) => {
        if(err) {
            throw err
        }
        response.header('Content-Type', 'application/json')
                .json(post.dllink);
    }); 
});

module.exports = router;