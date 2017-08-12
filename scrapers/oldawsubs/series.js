const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const Series = require('../../schemas/series');

module.exports = function(series_id, cb) {
    Series.findOne({series_id: series_id}, (err, anime) => {
        if(!anime) {
            cb(null, {error: 'Cant find anime with id ' + series_id});
        } else {
            axios.get(anime.url)
                .then((res) => {
                    const $ = cheerio.load(res.data);

                    let animeData = {
                        episodes: []
                    };

                    // OVERVIEW
                    const dataTitles = {
                        episode_count: 'Episode',
                        added_on: 'Added On',
                        type: 'Type',
                        status: 'Status',
                        genres: 'Genre'
                    }
                    
                    let dataEls = $('.kiri .data .infos');
                    
                    dataEls.each((i, el) => {
                        let dataTitle = $(el).find('b').text();
                        if(dataTitle == dataTitles.episode_count) {
                            let epCount = $(el).find('a').text()
                            animeData.episode_count = (isNaN(epCount)) ? 1 : epCount;
                        }else if(dataTitle == dataTitles.type) {
                            animeData.type = $(el).find('a').text();
                        } else if(dataTitle == dataTitles.status) {
                            animeData.status = $(el).find('a').text();
                        } else if(dataTitle == dataTitles.added_on) {
                            let elText = $(el).text();
                            let colonPos = elText.indexOf(':');
                            let dateRaw = elText.slice(colonPos + 2);

                            animeData.added_on = moment(dateRaw, 'MMMM Do, YYYY').format('YYYY-MM-DD');
                        } else if(dataTitle == dataTitles.genres) {
                            let genresMap = $(el).find('a').map((i, el) => {
                                return $(el).text();
                            });
                            
                            animeData.genres = genresMap.get();
                        }
                    });

                    // EPISODES
                    let episodeEls = $('.anilist .tautan a');

                    episodeEls.each((i, el) => {
                        let title = $(el).text();
                        let titleSplit = title.split(' ');
                        let episodePos = titleSplit.indexOf('Episode');
                        let episodeNum = 'N/A';
                        if(episodePos >= 0) {
                            episodeNum = titleSplit[episodePos + 1];
                        }
                        
                        // Khusus untuk beberapa nama anime yg mengandung 'iDOLM@STER'
                        const exception = ['11911', '15261'];
                        if(exception.indexOf(anime.series_id.toString()) >= 0) {
                            let openPos = title.indexOf('[email');
                            let closePos = title.indexOf('>');
                            let cuttedTitle = title.slice(0, openPos) + title.slice(closePos + 2);
                            
                            title = cuttedTitle.replace('*/', 'iDOLM@STER');
                        }


                        animeData.episodes.push({
                            title: title,
                            episode: episodeNum,
                            url: $(el).attr('href'),
                        });
                    });

                    anime.updated_at = Date.now();

                    Object.assign(anime, animeData);
                    anime.save((err, animedb) => {
                        if(err) throw err;

                        cb(anime);
                    });
                });
        }
    });
}