# simkl_to_trakt_history
Easily transfer your watch history from Simkl to Trakt.

Before you can use this, you'll have to create an API app on Trakt. You can do so [here](https://trakt.tv/oauth/applications).

## Installation

1. Install [Node.js](https://nodejs.org/en/)
2. Download, unzip, and cd into the directory of this repo with a Terminal or Command Line app
3. Type `npm install` and hit Enter
4. Type `node simkl_to_trakt_history.js` and follow instructions

You need to have the JSON file from Simkl next to the .js file, the code will look for a `Simkl_Everything.json` file by default, but you can change that in the .js file.

## Getting JSON from Simkl:

1. Make new app in Simkl - get your client ID and secret. For the next steps you need curl installed. 
Don't forget to replace [client id], [user code] and [token] with the actual values
3. Get user code ([user_code] for step 3 and 4):

```
curl --include \
'https://api.simkl.com/oauth/pin?client_id=[client id]'
```

3. Go to simkl.com/pin and authorize
4. Get the Token ([token] for step 5)]:

```
curl --include \
'https://api.simkl.com/oauth/pin/[user_code]?client_id=[client id]'
```

5. Get the JSON. This will get every item, including "to watch" items, but the script only marks watched episodes as watched anyways:

```
curl --include \
     --header "Content-Type: application/json" \
     --header "Authorization: Bearer [token]" \
     --header "simkl-api-key: [client id]" \
  'https://api.simkl.com/sync/all-items/?extended=full' > Simkl_Everything.json
```

# Remove current Trakt watch history
Even tho the script can attempt to remove your current Trakt history, it can't handle big histories. If you need to handle big histories, you can use the following two: https://github.com/damienhaynes/TraktRater & https://gist.github.com/hugoboos/68b830aec8e7cab65055