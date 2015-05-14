module.exports = function(callback){

    var width = window.innerWidth,
        height = window.innerHeight,
        audioCtx,
        soundSource,
        concertHallBuffer,
        analyser,
        dataArray,
        bufferLength,

        analyzerData = {
            v: 0,
            x: 0
        },

        audioSrc,
        canvas = document.querySelector('#audio'),
        canvasCtx = canvas.getContext('2d'),
        gradient;

    var isPlaying = false;

    this.getData = function(){
        return analyzerData;
    };

    var init = function(){

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        if(!audioCtx){
            return console.warn('WebAudio API not supported');
        }

        loadSrc(function(err, source){

            if(err){
                throw err;
            }

            audioSrc = source;

            analyser = audioCtx.createAnalyser();
                analyser.minDecibels = -90;
                analyser.maxDecibels = -10;
                analyser.smoothingTimeConstant = 0.85;
                analyser.fftSize = 2048;

            bufferLength = analyser.fftSize;

            //analyser.fftSize = 256;
            //bufferLength = analyser.frequencyBinCount;

            dataArray = new Uint8Array(bufferLength);

            source.connect(audioCtx.destination);
            source.connect(analyser);

            if(callback) callback();
        });
    };

    this.start = function(){

        if(isPlaying){
            return;
        }

        isPlaying = true;
        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();
        render();

        audioSrc.start();
    };

    var onWindowResize = function() {
        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        // Update the gradient size to fit the window
        gradient = canvasCtx.createLinearGradient(0, height / 2, 0, height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    };

    var loadSrc = function(callback){

        var xhr = new XMLHttpRequest();
            xhr.open('GET', '/audio/todd-terje-delorean-dynamite.ogg', true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function() {

            audioCtx.decodeAudioData(xhr.response, function(buffer) {
                concertHallBuffer = buffer;
                soundSource = audioCtx.createBufferSource();
                soundSource.loop = true;
                soundSource.buffer = concertHallBuffer;
                callback(null, soundSource);
            }, function(e){
                callback('Error with decoding audio data' + e.err, null);
            });
        };

        xhr.send();
    };

    var render = function(){
        requestAnimationFrame(render);
        update();
    };

    var drawBars = function(){

        var barWidth = (width / bufferLength) * 5.5,
            barHeight,
            x = 0;

        canvasCtx.clearRect(0, 0, width, height);

        for(var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] * 5;
            canvasCtx.fillStyle = gradient;
            canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth;
        }
    };

    var update = function(){
        analyser.getByteFrequencyData(dataArray);
        drawBars();
    };

    init();
};