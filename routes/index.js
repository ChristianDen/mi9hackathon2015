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

module.exports = function(app){

    app.get('/', function(req, res, next) {
        res.render('index');
    });

    app.get('/twitter/:hashtag', function(req, res, next) {

        var maxLen = 50;

        var params = {
            // express deprecated req.param(name): Use req.params, req.body, or req.query instead at routes/index.js:33:20
            q: req.param('hashtag'),
            count: maxLen
        };

        //twitterClient.stream('statuses/filter', {track: 'kardashian'}, function(stream) {
        //    stream.on('data', function (tweet) {
        //        console.log(tweet.text);
        //    });
        //});

        twitterClient.get('search/tweets', params, function(error, tweets, response){

            res.setHeader('Content-Type', 'application/json');

            if(error) {
                return res.send(require('../data/9jumpin.json'));
            }

            if(tweets.statuses.length > maxLen){
                tweets.statuses = tweets.statuses.slice(0, maxLen);
            }

            console.log('len: ' + tweets.statuses.length);
            res.send(tweets);
        });
    });
};