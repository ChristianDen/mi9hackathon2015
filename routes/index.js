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

        //console.log('hash: ' + req.param('hashtag'))
        res.render('index');
    });

    //router.get('/data/tweets', function(req, res, next) {
    //    res.setHeader('Content-Type', 'application/json');
    //    res.send(tweets);
    //});

    app.get('/twitter/:hashtag', function(req, res, next) {

        var params = {
            q: req.param('hashtag')
        };

        //twitterClient.stream('statuses/filter', {track: 'kardashian'}, function(stream) {
        //    stream.on('data', function (tweet) {
        //        console.log(tweet.text);
        //    });
        //});

        twitterClient.get('search/tweets', params, function(error, tweets, response){

            res.setHeader('Content-Type', 'application/json');

            if(error) {
                return res.send(error);
            }

            if(tweets.statuses.length > 50){
                tweets.statuses = tweets.statuses.slice(0, 50);
            }

            console.log('len: ' + tweets.statuses.length)
            res.send(tweets);
        });
    });
};