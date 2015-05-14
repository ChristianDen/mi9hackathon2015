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
        //gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        //gradient.addColorStop(0.8, 'rgba(255, 255, 255, 1)');
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
            barHeight = dataArray[i] * 4;
            //canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            canvasCtx.fillStyle = gradient;
            canvasCtx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 0;
        }
    };

    var update = function(){

        //analyser.getByteTimeDomainData(dataArray);
        analyser.getByteFrequencyData(dataArray);
        drawBars();
        //var barWidth = (canvas.width / bufferLength) * 5.5,
        //    barHeight,
        //    x = 0;
        //
        //canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        //
        //for(var i = 0; i < bufferLength; i++) {
        //    barHeight = dataArray[i] * 4;
        //    //canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        //    canvasCtx.fillStyle = gradient;
        //    canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        //    x += barWidth + 1;
        //}






        //for(var i = 0; i < bufferLength; i++) {
        //
        //    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        //    canvasCtx.lineWidth = 2;
        //    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        //    canvasCtx.beginPath();
        //
        //    var sliceWidth = canvas.width / bufferLength,
        //        x = 0;
        //
        //    for(var i = 0; i < bufferLength; i++) {
        //
        //        var v = dataArray[i] / 128,
        //            y = v * canvas.height / 2;
        //
        //        if(i == 0) {
        //            canvasCtx.moveTo(x, y);
        //        } else {
        //            canvasCtx.lineTo(x, y);
        //        }
        //
        //        x += sliceWidth;
        //    }
        //
        //    canvasCtx.lineTo(canvas.width, canvas.height / 2);
        //    canvasCtx.stroke();
        //}
    };

    init();
};