const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const seriesSchema = new Schema({
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
            added_on: Date
        }
    ],
    added_on: Date,
    updated_at: {
        type: Date,
        default: Date.now()
    }
});

const Series = module.exports = mongoose.model('Series', seriesSchema);