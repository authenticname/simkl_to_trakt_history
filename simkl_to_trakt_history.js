/* 
GETTING JSON FROM SIMKL

1. Make new app in Simkl - get your client ID and secret
2. Get device code:

curl --include \
'https://api.simkl.com/oauth/pin?client_id=[client id]'

3. Go to simkl.com/pin and authorize
4. Get the Token:

curl --include \
'https://api.simkl.com/oauth/pin/[user_code]?client_id=[client id]'

5. Get the JSON:

curl --include \
     --header "Content-Type: application/json" \
     --header "Authorization: Bearer [token]" \
     --header "simkl-api-key: [client id]" \
  'https://api.simkl.com/sync/all-items/?extened=full'

*/

const simkl = require('./Simkl_Everything.json');
const Trakt = require('trakt.tv');


//configure your client ID and secret, get them from https://trakt.tv/oauth/applications by creating a new application
let options = {
    client_id: '',
    client_secret: '',
};

const trakt = new Trakt(options);

let trakt_object = {
    "shows": [
    ],
    "movies": [
    ]
}

simkl.shows.forEach(s => {
    let date = null;
    if (s.last_watched_at) date = s.last_watched_at.replace(/T|Z/g, " ")
    trakt_object.shows.push(
        {
        "watched_at": date,
        "title": s.show.title,
        "year": s.show.year,
        "ids": {
          "slug": s.show.ids.slug,
          "imdb": s.show.ids.imdb,
          "tmdb": s.show.ids.tmdb,
          "tvdb": s.show.ids.tvdb,
        }
      })
});

simkl.movies.forEach(s => {
    let date = null;
    if (s.last_watched_at) date = s.last_watched_at.replace(/T|Z/g, " ")
    trakt_object.movies.push(
        {
        "watched_at": date,
        "title": s.movie.title,
        "year": s.movie.year,
        "ids": {
          "slug": s.movie.ids.slug,
          "imdb": s.movie.ids.imdb,
          "tmdb": s.movie.ids.tmdb,
        }
      })
});

simkl.anime.forEach(s => {
    let date = null;
    if (s.last_watched_at) date = s.last_watched_at.replace(/T|Z/g, " ")
    trakt_object.shows.push(
        {
        "watched_at": date,
        "title": s.show.title,
        "year": s.show.year,
        "ids": {
          "mal": s.show.ids.mal,
          "imdb": s.show.ids.imdb,
          "tmdb": s.show.ids.tmdb,
          "anidb": s.show.ids.anidb,
        }
      })
});

trakt.get_codes().then(poll => {
    console.log(`Authorize via the following URL: ${poll.verification_url}\nInput this code: ${poll.user_code}`);
    return trakt.poll_access(poll);
}).catch(error => {
    // error.message == 'Expired' will be thrown if timeout is reached
    console.error(error.message);
}).then(() => {
    console.log(`Will add: ${trakt_object.shows.length} shows (incl. anime) and ${trakt_object.movies.length} movies`);
    console.log('Adding to history...');
    trakt.sync.history.add(trakt_object).then(() => console.log('Done!'))
});