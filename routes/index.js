var express = require('express')
    , router = express.Router()
    , tweets = require('../data/tweets.json')
    , Twitter = require('twitter');

var twitterClient = new Twitter({
    consumer_key: 'sLlH9rfbjtAUCC2lhplwPVAbo',
    consumer_secret: 'GJRe7hVrQgP7sWinsyFOdf5w4ceiEfb2V23ttQfy7mnCKuoqq5',
    access_token_key: '1245475093-SiyYh8KOzTXYlyswF6raf7UdRqvOMpQ2u1LGiqQ',
    access_token_secret: 'lkk3nYRXuUGQo5dRgIKH2fExg8x87H9EBVd2WQXDww'
});

router.get('/', function(req, res, next) {

    //console.log('hash: ' + req.param('hashtag'))
    res.render('index');
});

router.get('/data/tweets', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(tweets);
});

router.get('/twitter', function(req, res, next) {

    var params = {
        screen_name: 'nodejs'
    };

    //'statuses/user_timeline'
    //statuses/retweets/509457288717819904.json

    twitterClient.get('statuses/retweets/509457288717819904', params, function(error, tweets, response){

        if(error) {
            console.log(error);
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(tweets);
    });
});

module.exports = router;
