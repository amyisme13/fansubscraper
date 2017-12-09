const express = require('express');

const router = express.Router();
const axios = require('axios');

const Series = require('../schemas/series');

// Scrapper here
const feedScraper = require('../scrapers/awsubs/feed');
const postScraper = require('../scrapers/awsubs/post');
const allseriesScraper = require('../scrapers/oldawsubs/allseries');
const seriesScraper = require('../scrapers/oldawsubs/series');

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

router.get('/post/:posturl', (request, response) => {
    postScraper(request.params.posturl, (err, post) => {
        if (err) {
            throw err;
        }
        response.header('Content-Type', 'application/json').json(post);
    });
});

router.get('/series', (request, response) => {
    Series.find()
        .select({
            title: 1,
            url: 1,
            series_id: 1,
        })
        .sort({ series_id: 1 })
        .exec((err, animes) => {
            response.header('Content-Type', 'application/json').json(animes);
        });
});

router.get('/series/blob', (request, response) => {
    Series.find()
        .sort({ series_id: 1 })
        .exec((err, animes) => {
            response.header('Content-Type', 'application/json').json(animes);
        });
});

router.get('/series/update', (request, response) => {
    allseriesScraper('http://awsubs.co/all-anime-list', (animes) => {
        response.header('Content-Type', 'application/json').json(animes);
    });
});

router.get('/series/single/update', (request, response) => {
    const now = new Date();
    const today = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    Series.findOne({
        $or: [
            { added_on: { $exists: false } },
            { $and: [{ updated_at: { $lt: today } }, { status: 'Ongoing' }] },
        ],
    })
        .sort({ series_id: 1 })
        .exec((err, anime) => {
            if (anime !== null) {
                axios
                    .get(`${process.env.BASE_URL}/awsubs/series/${anime.series_id}/update`)
                    .then((res) => {
                        response.header('Content-Type', 'application/json').json(res.data);
                    });
            } else {
                response.header('Content-Type', 'application/json').json({ msg: 'Done' });
            }
        });
});

router.get('/series/:id', (request, response) => {
    Series.findOne({ series_id: request.params.id }, (err, anime) => {
        response.header('Content-Type', 'application/json').json(anime);
    });
});

router.get('/series/:id/update', (request, response) => {
    const seriesId = request.params.id;

    seriesScraper(seriesId, (anime, err) => {
        if (err) {
            response.header('Content-Type', 'application/json').json(err);
        } else {
            response.header('Content-Type', 'application/json').json(anime);
        }
    });
});

router.get('/search', (request, response) => {
    if (request.query.q) {
        Series.find({
            title: {
                $regex: request.query.q,
                $options: 'i',
            },
        })
            .select({
                title: 1,
                url: 1,
                series_id: 1,
            })
            .sort({ series_id: 1 })
            .exec((err, animes) => {
                if (animes.length > 0) {
                    response.header('Content-Type', 'application/json').json(animes);
                } else {
                    response
                        .header('Content-Type', 'application/json')
                        .status(404)
                        .json([]);
                }
            });
    } else {
        response
            .header('Content-Type', 'application/json')
            .status(404)
            .json({ msg: 'No query' });
    }
});

router.get('/test', (req, res) => {
    res.json({});
});

module.exports = router;
