const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const seriesSchema = new mongoose.Schema({
    series_id: Number,
    title: String,
    url: String,
    episode_count: Number,
    type: String,
    status: String,
    genres: Array,
    episodes: [
        {
            title: String,
            episode: String,
            url: String,
            added_on: Date,
        },
    ],
    added_on: Date,
    updated_at: {
        type: Date,
        default: Date.now(),
    },
});

const Series = mongoose.model('Series', seriesSchema);
module.exports = Series;
