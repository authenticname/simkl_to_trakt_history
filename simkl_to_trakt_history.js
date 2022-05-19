const simkl = require('./Simkl_Everything.json');
const Trakt = require('trakt.tv');
const inquirer = require('inquirer');


inquirer.prompt([
  { type: 'input', message: 'Please input your Trakt client ID (get it from https://trakt.tv/oauth/applications by creating a new application):\n', name: 'client_id' },
  { type: 'input', message: 'Please input your Trakt client secret (you get it from the same place you got the client ID):\n', name: 'client_secret' },
  { type: 'confirm', message: 'Do you want to delete your previous Trakt history? ', name: 'remove_previous', default: false }
]).then(answers => {
  const trakt = new Trakt({
    client_id: answers.client_id,
    client_secret: answers.client_secret,
  });

  trakt.get_codes().then(poll => {
    console.log(`Authorize via the following URL: ${poll.verification_url}\nInput this code: ${poll.user_code}`);
    return trakt.poll_access(poll);
  }).catch(error => {
    // error.message == 'Expired' will be thrown if timeout is reached
    console.error(error.message);
  }).then(async () => {

    if (answers.remove_previous) {
      try {
        console.log('Getting previous watch history...');
        const movies = await trakt.sync.watched({ type: 'movies' }).then(movie => movie.map(mv => mv.movie));
        const shows = await trakt.sync.watched({ type: 'shows' }).then(show => show.map(sh => sh.show));
        console.log(`Removing ${movies.length} movies and ${shows.length} shows from your Trakt watchlist...`);
        await trakt.sync.history.remove({ movies, shows }).then(res => { console.log(`Succesfully removed ${res.deleted.movies} movies and ${res.deleted.episodes} episodes your watch history.`); sync() });
      }
      catch {
        const answer = await inquirer.prompt([{ name: 'confirm', message: 'The watch history could not be removed for various reasons (maybe your watch history is too big), continue syncing?', default: true, type: 'boolean' }]);
        if (answer) sync();
      }
    } else sync();
  });

  function sync() {
    const traktObject = {
      "shows": [],
      "movies": []
    };

    simkl.shows.forEach(show => {
      if (!show.last_watched_at) return;
      traktObject.shows.push(
        {
          "title": show.show.title,
          "year": show.show.year,
          "seasons": show.seasons,
          "ids": {
            "mal": show.show.ids.mal,
            "imdb": show.show.ids.imdb,
            "tmdb": show.show.ids.tmdb,
            "anidb": show.show.ids.anidb,
          }
        })
    });

    simkl.movies.forEach(movie => {
      if (!movie.last_watched_at) return;
      traktObject.movies.push(
        {
          "title": movie.movie.title,
          "year": movie.movie.year,
          "ids": {
            "slug": movie.movie.ids.slug,
            "imdb": movie.movie.ids.imdb,
            "tmdb": movie.movie.ids.tmdb,
          }
        })
    });

    simkl.anime.forEach(anime => {
      if (!anime.last_watched_at) return;
      traktObject.shows.push(
        {
          "title": anime.show.title,
          "year": anime.show.year,
          "seasons": anime.seasons,
          "ids": {
            "mal": anime.show.ids.mal,
            "imdb": anime.show.ids.imdb,
            "tmdb": anime.show.ids.tmdb,
            "anidb": anime.show.ids.anidb,
          }
        })
    });

    console.log(`Syncing ${traktObject.shows.length} shows (incl. anime) and ${traktObject.movies.length} movies to your Trakt account...`);
    trakt.sync.history.add(traktObject).then(res => console.log(`Successfully added ${res.added.movies} movies and ${res.added.episodes} episodes to your Trakt watch history!`));
  }
})