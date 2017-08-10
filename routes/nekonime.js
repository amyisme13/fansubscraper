const express = require('express');
const router = express.Router();

router.get('/', function(request, response) {
    const feedsParser = require('../parser/nekonime/feeds');
    feedsParser(1, (err, posts) => {
        if(err) {
            throw err;
        }
        response.header('Content-Type', 'application/json')
                .json(posts);
    });
});

module.exports = router;