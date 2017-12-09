const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const Series = require('../../schemas/series');

module.exports = (seriesId, cb) => {
    Series.findOne({ seriesId }, (err, paramAnime) => {
        if (!paramAnime) {
            cb(null, { error: `Cant find anime with id ${seriesId}` });
        } else {
            const anime = paramAnime;
            axios.get(anime.url).then((res) => {
                const $ = cheerio.load(res.data);

                const animeData = {
                    episodes: [],
                };

                // OVERVIEW
                const dataTitles = {
                    episode_count: 'Episode',
                    added_on: 'Added On',
                    type: 'Type',
                    status: 'Status',
                    genres: 'Genre',
                };

                const dataEls = $('.kiri .data .infos');

                dataEls.each((i, el) => {
                    const dataTitle = $(el)
                        .find('b')
                        .text();
                    if (dataTitle === dataTitles.episode_count) {
                        const epCount = $(el)
                            .find('a')
                            .text();
                        animeData.episode_count = Number.isNaN(epCount) ? 1 : epCount;
                    } else if (dataTitle === dataTitles.type) {
                        animeData.type = $(el)
                            .find('a')
                            .text();
                    } else if (dataTitle === dataTitles.status) {
                        animeData.status = $(el)
                            .find('a')
                            .text();
                    } else if (dataTitle === dataTitles.added_on) {
                        const elText = $(el).text();
                        const colonPos = elText.indexOf(':');
                        const dateRaw = elText.slice(colonPos + 2);

                        animeData.added_on = moment(dateRaw, 'MMMM Do, YYYY').format('YYYY-MM-DD');
                    } else if (dataTitle === dataTitles.genres) {
                        const genresMap = $(el)
                            .find('a')
                            .map((j, jEl) => $(jEl).text());

                        animeData.genres = genresMap.get();
                    }
                });

                // EPISODES
                const episodeEls = $('.anilist .tautan a');

                episodeEls.each((i, el) => {
                    let title = $(el).text();
                    const titleSplit = title.split(' ');
                    const episodePos = titleSplit.indexOf('Episode');
                    let episodeNum = 'N/A';
                    if (episodePos >= 0) {
                        episodeNum = titleSplit[episodePos + 1];
                    }

                    // Khusus untuk beberapa nama anime yg mengandung 'iDOLM@STER'
                    const exception = ['11911', '15261'];
                    if (exception.indexOf(anime.series_id.toString()) >= 0) {
                        const openPos = title.indexOf('[email');
                        const closePos = title.indexOf('>');
                        const cuttedTitle = title.slice(0, openPos) + title.slice(closePos + 2);

                        title = cuttedTitle.replace('*/', 'iDOLM@STER');
                    }

                    animeData.episodes.push({
                        title,
                        episode: episodeNum,
                        url: $(el).attr('href'),
                    });
                });

                anime.updated_at = Date.now();

                Object.assign(anime, animeData);
                anime.save((saveErr) => {
                    if (saveErr) throw saveErr;

                    cb(anime);
                });
            });
        }
    });
};
