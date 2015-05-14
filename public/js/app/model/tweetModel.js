var request = require('../util/request');

module.exports = {

    getTweets : function(hashtag, next){

        request('GET', 'http://localhost:3001/twitter/' +  hashtag, {dataType: 'json'}, function(err, data){

            if(err){
                return next(err, null);
            }

            next(null, data.statuses)
        });
    }
};