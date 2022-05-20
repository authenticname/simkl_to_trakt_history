# Simkl To Trakt History 
Easily transfer your watch history from Simkl to Trakt.

Before you can use this, you'll have to create an API app on Simkl [here](https://simkl.com/settings/developer/new/) and one on Trakt [here](https://trakt.tv/oauth/applications).

## Installation

1. Install [Node.js](https://nodejs.org/en/) (minimum version needed is 15.3.0)
1. Clone or download this repository, unpack if necesarry, `cd` into the downloaded/unpacked directory with your command line of choice
1. Type ```npm install``` and hit Enter
1. Type ```node sync.mjs```, hit Enter and follow the instructions

# Remove current Trakt watch history
Even though the script can attempt to remove your current Trakt history, it can't handle big histories. 

If you need to handle big histories, you can use the following two:
https://github.com/damienhaynes/TraktRater & https://gist.github.com/hugoboos/68b830aec8e7cab65055
