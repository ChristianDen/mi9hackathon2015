var request = require('../util/request');

module.exports = {

    getTweets : function(next){

        request('GET', 'http://localhost:3001/data/tweets', {dataType: 'json'}, function(err, data){

            if(err){
                return next(err, null);
            }

            next(null, data.statuses)
        });
    }
};