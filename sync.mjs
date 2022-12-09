
import inquirer from 'inquirer';
import fetch from 'node-fetch';
import Trakt from 'trakt.tv';

const answers = await inquirer.prompt([
  { type: 'input', message: 'Please input your Simkl client ID (get it from https://simkl.com/settings/developer/new by creating a new application)\n', name: 'simkl_client_id', validate },
  { type: 'input', message: 'Please input your Trakt client ID (get it from https://trakt.tv/oauth/applications by creating a new application):\n', name: 'client_id', validate },
  { type: 'input', message: 'Please input your Trakt client secret (you get it from the same place you got the client ID):\n', name: 'client_secret', validate },
  { type: 'confirm', message: 'Do you want to delete your previous Trakt history? ', name: 'remove_previous', default: false }
]);

const watched = await getSimklWatched(answers.simkl_client_id);

const trakt = new Trakt({
  client_id: answers.client_id,
  client_secret: answers.client_secret,
});

await trakt.get_codes().then(poll => {
  console.log(`Authorize the Trakt application via the following URL ${poll.verification_url} by inputting the following code: ${poll.user_code}`);
  return trakt.poll_access(poll);
}).catch(error => console.error(error.message));

if (answers.remove_previous) {
  try {
    console.log('Getting previous watch history...');
    const movies = await trakt.sync.watched({ type: 'movies' }).then(movie => movie.map(mv => mv.movie));
    const shows = await trakt.sync.watched({ type: 'shows' }).then(show => show.map(sh => sh.show));
    console.log(`Removing ${movies.length} movies and ${shows.length} shows from your Trakt watchlist...`);
    await trakt.sync.history.remove({ movies, shows }).then(res => { console.log(`Succesfully removed ${res.deleted.movies} movies and ${res.deleted.episodes} episodes your watch history.`); sync(watched) });
  }
  catch {
    const answer = await inquirer.prompt([{ name: 'confirm', message: 'The watch history could not be removed for various reasons (maybe your watch history is too big), continue syncing?', default: true, type: 'boolean' }]);
    if (answer) await sync(watched);
    else process.exit(0);
  }
} else await sync(watched);

async function getSimklWatched(id) {
  const { user_code, verification_url } = await fetch(`https://api.simkl.com/oauth/pin?client_id=${id}`).then(res => res.json());

  await inquirer.prompt({ type: 'confirm', message: `Authorize the Simkl application via the following URL ${verification_url} by inputting the following code: ${user_code}\nAfter authorizing, come back to the console and hit Enter.`, name: 'confirmation' });
  const { access_token } = await fetch(`https://api.simkl.com/oauth/pin/${user_code}?client_id=${id}`).then(res => res.json());

  const data = await fetch('https://api.simkl.com/sync/all-items/?extended=full', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
      'simkl-api-key': id
    }
  }).then(res => res.json());

  return data;
};

async function sync(watched) {

  const traktObject = {
    "shows": [],
    "movies": []
  };

  watched.shows.forEach(show => {
    if (!show.last_watched_at) return;
    traktObject.shows.push(
      {
        "watched_at": show.last_watched_at,
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

  watched.movies.forEach(movie => {
    if (!movie.last_watched_at) return;
    traktObject.movies.push(
      {
        "watched_at": movie.last_watched_at,
        "title": movie.movie.title,
        "year": movie.movie.year,
        "ids": {
          "slug": movie.movie.ids.slug,
          "imdb": movie.movie.ids.imdb,
          "tmdb": movie.movie.ids.tmdb,
        }
      })
  });

  watched.anime.forEach(anime => {
    if (!anime.last_watched_at) return;
    traktObject.shows.push(
      {
        "watched_at": anime.last_watched_at,
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
  await trakt.sync.history.add(traktObject).then(res => console.log(`Successfully added ${res.added.movies} movies and ${res.added.episodes} episodes to your Trakt watch history!`));
};

function validate(string) {
  if (!string) return 'Please input the required string!';
  else return true;
}