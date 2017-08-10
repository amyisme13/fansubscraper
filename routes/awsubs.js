const express = require('express');
const router = express.Router();
const axios = require('axios');

const Series = require('../schemas/series');

router.get('/', function(request, response) {
    const feedsParser = require('../parser/awsubs/feeds');
    feedsParser(5, (err, posts) => {
        if(err) {
            throw err
        }
        response.header('Content-Type', 'application/json')
                .json(posts);
    });
});

router.get('/dl/:url', function(request, response) {
    const dllinkParser = require('../parser/oldawsubs/dllink');
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
    const allseriesParser = require('../parser/oldawsubs/allseries');
    
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
    const seriesParser = require('../parser/oldawsubs/series');

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

router.get('/asd', (req, res) => {
    let parser = require('../parser/oldawsubs/post')

    let animes = []
    let done = 0

    let pushToAnimes = (anime, max) => {
        done++
        animes.push(anime)

        if(done == max) {
            animes.sort((x, y) => {
                return new Date(y.date) - new Date(x.date)
            })
            res.json(animes)
        }
    }

    axios.get(process.env.BASE_URL + '/awsubs')
        .then((result) => {
            feeds = result.data
            for(let i = 0; i < feeds.length; i++) {
                parser(feeds[i].url, (anime) => {
                    pushToAnimes(anime, feeds.length)
                })
            }
        })
})

router.get('/test', (req, res) => {
    res.json('test')
})

module.exports = router;
