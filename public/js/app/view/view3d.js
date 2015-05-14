var Node3d = require('../widgets/node3d')
    , AudioWidget = require('../widgets/audio');

module.exports = function(){

    // Load the audio / visualisation first
    var audio = new AudioWidget(function(){

        // Then init the 3d view
        new Node3d(audio);
    });
};