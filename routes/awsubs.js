const express = require('express');
const router = express.Router();
const axios = require('axios');

const Series = require('../schemas/series');

router.get('/', function(request, response) {
    const feedsParser = require('../parser/awsubs/feeds');
    feedsParser(10, (feeds) => {
        response.header('Content-Type', 'application/json')
                .json(feeds);
    });
});

router.get('/dl/:url', function(request, response) {
    const dllinkParser = require('../parser/awsubs/dllink');
    dllinkParser(request.params.url, (links) => {
        response.header('Content-Type', 'application/json')
                .json(links);
    }); 
});

router.get('/series', function(request, response) {
    Series
        .find()
        .select({
            title: 1,
            url: 1,
            series_id: 1
        })
        .sort({series_id: 1})
        .exec((err, animes) => {
            response.header('Content-Type', 'application/json')
                    .json(animes);
        });
});

router.get('/series/blob', function(request, response) {
    Series.find().sort({series_id: 1}).exec((err, animes) => {
        response.header('Content-Type', 'application/json')
                .json(animes);
    });
});

router.get('/series/update', function(request, response) {
    const allseriesParser = require('../parser/awsubs/allseries');
    
    allseriesParser('http://awsubs.co/all-anime-list', (animes) => {
        response.header('Content-Type', 'application/json')
                .json(animes);
    });
});

router.get('/series/single/update', function(request, response) {
    const now = new Date()
    const today = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    Series
        .findOne({
            $or: [
                {added_on: {$exists: false}},
                {$and: [{updated_at: {$lt: today}}, {status: 'Ongoing'}]}
            ]
        })
        .sort({series_id: 1})
        .exec((err, anime) => {
            if(anime !== null){
                axios.get(process.env.BASE_URL + '/awsubs/series/' + anime.series_id + '/update')
                    .then((res) => {
                        response.header('Content-Type', 'application/json')
                                .json(res.data);
                    });
            } else {
                response.header('Content-Type', 'application/json')
                        .json({msg: 'Done'});
            }
        });
    
});

router.get('/series/:id', function(request, response) {
    Series.findOne({series_id: request.params.id}, (err, anime) => {
        response.header('Content-Type', 'application/json')
                .json(anime);
    });
});

router.get('/series/:id/update', function(request, response) {
    const series_id = request.params.id;
    const seriesParser = require('../parser/awsubs/series');

    seriesParser(series_id, (anime, err) => {
        if(err) {
            response.header('Content-Type', 'application/json')
                    .json(err);
        } else {
            response.header('Content-Type', 'application/json')
                    .json(anime);
        }
    });
});

router.get('/search', function(request, response) {
    if(request.query.q) {
        Series
            .find({
                title: {
                    $regex: request.query.q,
                    $options: 'i'
                }
            })
            .select({
                title: 1,
                url: 1,
                series_id: 1
            })
            .sort({series_id: 1})
            .exec((err, animes) => {
                if(animes.length > 0){
                    response.header('Content-Type', 'application/json')
                            .json(animes);
                } else {
                    response.header('Content-Type', 'application/json')
                            .status(404)
                            .json([]);
                }
            });
    } else {
        response.header('Content-Type', 'application/json')
                .status(404)
                .json({msg: 'No query'});
    }
});

router.get('/test/:q', (req, res) => {
    Series
        .find({
            title: {
                $regex: req.params.q,
                $options: 'i'
            }
        })
        .sort({series_id: 1})
        .exec((err, animes) => {
            if(animes.length > 0){
                res.header('Content-Type', 'application/json')
                    .json(animes);
            } else {
                res.header('Content-Type', 'application/json')
                    .json({msg: 'None'});
            }
        });
})

module.exports = router;
