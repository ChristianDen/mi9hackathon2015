(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//window.$ = window.jQuery = require('jquery');
//window._ = require('underscore');
//require('../vendor/bootstrap');

require('./view/view3d');

$(function() {

    var twitterNodes = window.twitterNodes || {};
        twitterNodes.View3d = require('./view/view3d');

    window.twitterNodes = twitterNodes;

    if(window.init && _.isFunction(window.init)){
        window.init();
    }
});
},{"./view/view3d":7}],2:[function(require,module,exports){
var colors = [0xff0000, 0x00ff00, 0x0000ff];

var cylinderMatrix = new THREE.Matrix4().set(
    1, 0, 0, 0,
    0, 0, 1, 0,
    0, -1, 0, 0,
    0, 0, 0, 1
);

var cylinderMat = new THREE.MeshPhongMaterial({
    color: 0x2b2330,
    specular: 0xb1a7c2,
    shininess: 90,
    shading: THREE.VertexColors, //THREE.FlatShading,
    fog: false
});

module.exports = {

    getSphere : function(){

        // Bubbly
        //var material = new THREE.MeshLambertMaterial({
        //    color: 0x2b2330,
        //    shading: THREE.VertexColors
        //});

        // Shiny
        var material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0xffffff,
            shininess: 40,
            shading: THREE.VertexColors //THREE.FlatShading
        });

        // Flat white
        // http://threejs.org/docs/#Reference/Materials/MeshBasicMaterial
        //var material = new THREE.MeshBasicMaterial({
        //    color: 0xffffff,
        //    vertextColors: THREE.VertexColors
        //});

        var geometry = new THREE.SphereGeometry(32, 32, 32);

        //sphereMesh.castShadow = true;
        //sphereMesh.receiveShadow = true;

        //sphereMesh.material.depthTest = false;
        //sphereMesh.material.depthWrite = false;

        return new THREE.Mesh( geometry, material );;
    },

    /**
     * Returns a cylinder mesh connected between two points
     * http://stackoverflow.com/questions/15316127/three-js-line-vector-to-cylinder
     *
     * @param va        THREE.Vector3
     * @param vb        THREE.Vector3
     * @returns {THREE.Mesh}
     */
    getCylinder: function(va, vb){

        var direction = new THREE.Vector3().subVectors(vb, va),
            orientation = new THREE.Matrix4(),
            material = new THREE.MeshPhongMaterial({
                color: 0x2b2330,
                specular: 0xb1a7c2,
                shininess: 90,
                shading: THREE.VertexColors, //THREE.FlatShading,
                transparent: true
            });


        //var material = new THREE.MeshLambertMaterial({
        //    color: 0x2b2330,
        //    shading: THREE.VertexColors, //THREE.FlatShading,
        //    fog: true
        //});

        //var material = new THREE.MeshPhongMaterial({
        //    color: 0x2b2330,
        //    specular: 0xb1a7c2,
        //    shininess: 90,
        //    shading: THREE.VertexColors, //THREE.FlatShading,
        //    fog: true
        //});

        orientation.lookAt(
            va,
            vb,
            new THREE.Object3D().up
        );

        orientation.multiply(
            new THREE.Matrix4().set(
                1, 0, 0, 0,
                0, 0, 1, 0,
                0, -1, 0, 0,
                0, 0, 0, 1
            )
        );

        // CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded, thetaStart, thetaLength)
        var edgeGeometry = new THREE.CylinderGeometry(3, 3, direction.length(), 16, 1);

        var mesh = new THREE.Mesh(edgeGeometry, material);
            mesh.applyMatrix(orientation);

            // position based on midpoints - there may be a better solution than this
            mesh.position.x = (vb.x + va.x) / 2;
            mesh.position.y = (vb.y + va.y) / 2;
            mesh.position.z = (vb.z + va.z) / 2;

        return mesh;
    },

    getCube : function(){
        var geometry = new THREE.BoxGeometry( 1, 1, 1),
            material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

        return new THREE.Mesh( geometry, material );
    }
};

var addCones = function(){

    var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );

    var material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        shading: THREE.FlatShading
    });

    for ( var i = 0; i < 500; i ++ ) {
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = ( Math.random() - 0.5 ) * 1000;
        mesh.position.y = ( Math.random() - 0.5 ) * 1000;
        mesh.position.z = ( Math.random() - 0.5 ) * 1000;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        scene.add( mesh );
    }
};

},{}],3:[function(require,module,exports){
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
},{"../util/request":6}],4:[function(require,module,exports){
var colorUtil = {

    rgbToHex : function(rgb) {

        var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/,
            result, r, g, b, hex = '';

        if (result = rgbRegex.exec(rgb)) {
            r = colorUtil.componentFromStr(result[1], result[2]);
            g = colorUtil.componentFromStr(result[3], result[4]);
            b = colorUtil.componentFromStr(result[5], result[6]);
            hex = "0x" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        return hex;
    },

    componentFromStr : function(numStr, percent) {
        var num = Math.max(0, parseInt(numStr, 10));
        return percent ? Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
    }
};

module.exports = colorUtil;
},{}],5:[function(require,module,exports){
/**
 * DelayCall
 *
 * Examples:
 *
 * var d = new DelayCall(1000, myFunction); // creates a call
 * d.cancel(); // Cancels a call
 *
 * Anonymous inline style:
 *
 * new DelayCall(function(){
 *     // do something
 * }, 500);
 *
 * @param {Function} 	callback
 * @param {Number}   	time
 * @param {Object=}   	context to pass to the callback
 */
module.exports = function(callback, time, context){

    if(!(this instanceof arguments.callee)){
        throw new Error('Constructor called as a function.');
    }

    if(!time){
        throw new Error('Missing required parameter time.');
    }

    if(!callback){
        throw new Error('Missing required parameter callback.');
    }

    var callback = callback,
        time = time,
        context = context || window,
        hasFired = false;

    var onTimer = function(){

        if(callback){
            callback.call(context);
            callback = null;
        }

        hasFired = true;
    };

    var id = setTimeout(onTimer, time);

    /**
     * Cancels the current delayed call
     * @return {void}
     */
    this.cancel = function(){

        if(!id || hasFired){
            return;
        }

        clearTimeout(id);
        id = null;
        callback = null;
    }
};
},{}],6:[function(require,module,exports){
/**
 * jQuery ajax wrapper
 * @param method
 * @param url
 * @param data
 * @param callback
 */
module.exports = function (method, url, data, callback) {

    if (_.isEmpty(method)) {
        throw new Error('request.js: Missing arg method');
    }

    if (_.isEmpty(url)) {
        throw new Error('request.js: Missing arg url');
    }

    if (!_.isString(url)) {
        throw new Error('request.js: String expected for url');
    }

    if (!data) {
        throw new Error('request.js: Missing arg data');
    }

    if (!_.isObject(data)) {
        throw new Error('request.js: Object expected for data');
    }

    if (!callback) {
        throw new Error('request.js: Missing arg callback');
    }

    if (!_.isFunction(callback)) {
        throw new Error('request.js: Function expected for callback');
    }

    var options = {
        url: url,
        type: method,
        data: data,
        dataType: 'text',

        success: function (json, textStatus, jqXHR) {
            return callback(null, JSON.parse(json));
        },

        error: function (error) {
            return callback(error.message, null);
        }
    };

    $.ajax(options);
};
},{}],7:[function(require,module,exports){
var Node3d = require('../widgets/node3d')
    , AudioWidget = require('../widgets/audio');

module.exports = function(){

    // Load the audio / visualisation first
    var audio = new AudioWidget(function(){

        // Then init the 3d view
        new Node3d(audio);
    });
};
},{"../widgets/audio":8,"../widgets/node3d":9}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
var tweetModel = require('../model/tweetModel')
    , factory = require('../model/3dObjectFactory')
    , DelayCall = require('../util/delayCall')
    , colorUtil = require('../util/color');

module.exports = function(audio){

    var CLUSTER_SIZE = 450;

    var color = {
        value : 0xffffff
    };

    var particles = [],
        lineContainer,
        masterContainer,
        camera,
        scene,
        renderer,
        camaraTarget,
        geometry,
        current,
        currentParticle,
        particlesContainer,
        interval,
        width = window.innerWidth,
        height = window.innerHeight;

    var clock = new THREE.Clock();

    var postprocessing = {},
        enablePostprocessing = true;

    var cameraTweens = {
        x : 0,
        y : 0
    };

    var init = function(){

        initWebGl();

        $('#go').click(query);

        $(document).keypress(function(e) {
            if(e.which == 13) {
                query();
            }
        });
    };

    var initWebGl = function() {

        var webgl = document.querySelector('#webgl');

        camera = new THREE.PerspectiveCamera(60, width / height, 1, 2500);
        camera.position.z = 2000; //800;
        camaraTarget = new THREE.Vector3();

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x333333, 0.002);
        //scene.matrixAutoUpdate = false;

        var light1 = new THREE.DirectionalLight( 0xffffff, 1 );
        light1.position.set( 1, 1, 1 );
        scene.add( light1 );

        var light2 = new THREE.DirectionalLight( 0x0085c8, 1 );
        light2.position.set( -1, -1, -1 );
        scene.add( light2 );

        var light3 = new THREE.AmbientLight( 0xffffff );
        light3.position.set( -1, -1, -1 );
        scene.add( light3 );

        var light4 = new THREE.SpotLight( 0x0085c8, 1 );
        light4.position.set( -1, -1, -1 );
        scene.add( light4 );

        masterContainer = new THREE.Object3D();
        particlesContainer = new THREE.Object3D();
        lineContainer = new THREE.Object3D();

        scene.add(masterContainer);

        masterContainer.add(particlesContainer);
        masterContainer.add(lineContainer);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setClearColor( scene.fog.color, 0);
        renderer.setSize(window.innerWidth, window.innerHeight);

        if(enablePostprocessing) initPostprocessing();
        webgl.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);

        if(enablePostprocessing){
            //datGui();
        }

        onWindowResize();
        animate();
    };

    var datGui = function(){

        var effectController  = {
            focus: 0.8,
            aperture: 0.015,
            maxblur: 1
        };

        var matChanger = function( ) {
            postprocessing.bokeh.uniforms[ 'focus' ].value = effectController.focus;
            postprocessing.bokeh.uniforms[ 'aperture' ].value = effectController.aperture;
            postprocessing.bokeh.uniforms[ 'maxblur' ].value = effectController.maxblur;
        };

        var gui = new dat.GUI();
        gui.add( effectController, 'focus', 0.0, 3.0, 0.025 ).onChange( matChanger );
        gui.add( effectController, 'aperture', 0.001, 0.2, 0.001 ).onChange( matChanger );
        gui.add( effectController, 'maxblur', 0.0, 3.0, 0.025 ).onChange( matChanger );
        gui.close();
    };

    function initPostprocessing() {

        var renderPass = new THREE.RenderPass( scene, camera );

        var bokehPass = new THREE.BokehPass( scene, camera, {
            focus: 0.8,
            aperture: 0.015,
            maxblur: 1
        });

        bokehPass.renderToScreen = true;

        // Ensures Canvas transparency when using the effects composer
        var renderTarget = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        });

        var composer = new THREE.EffectComposer( renderer, renderTarget );
        composer.addPass( renderPass );
        composer.addPass( bokehPass );

        //var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        //effectCopy.renderToScreen = true;
        //composer.addPass(effectCopy);

        postprocessing.composer = composer;
        postprocessing.bokeh = bokehPass;
    }

    var getTweets = function(q){

        removeChildren(particlesContainer);

        if(interval){
            clearInterval(interval);
            interval = null;
        }

        $('.loader').removeClass('hidden');

        tweetModel.getTweets(q, function(err, data){

            if(err){
                throw err;
            }

            camaraTarget.set(0, 0, 0);

            if(data.length){
                return populate(data);
            }

            alert('Oy homes! We got no tweets for ya!');
        });
    };

    /**
     * Randomly generates all the node positions but with a minimum distance between them
     * Expensive and time consuming call!
     *
     * @param len
     * @returns {Array}
     */
    var generatePositions = function(len){

        if(!len){
            throw new Error('Missing len');
        }

        console.log('generatePositions: ' + len);

        var pos = [],
            targetCount = len,
            success = 0,
            threshold = 0.3,
            numReCalcs = 0;

        var getVec = function(){

            var v = new THREE.Vector3();

            v.set(
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1
            );

            return v;
        };

        var collides = function(v){

            var res = false;

            for(var i = 0; i < pos.length; i++){

                var dist = v.distanceTo(pos[i]);

                if(dist < threshold){
                    res = true;
                    break;
                }
            }

            return res;
        };

        do {
            var vec = getVec();

            if(!collides(vec)){
                pos.push(vec);
                success++;
            } else{
                numReCalcs++;
            }

        } while (success < targetCount);

        console.log('numReCalcs: ' + numReCalcs);
        return pos;
    };

    var populate = function(res){

        var preCalcPos = generatePositions(res.length);

        if(geometry){
            geometry.dispose();
        }

        particles = [];
        geometry = new THREE.Geometry();
        var c = 0;

        _.each(res, function(tweet) {

            var particle = factory.getSphere();

                // Apply the pre-calculated positions
                particle.position.set(
                    preCalcPos[c].x,
                    preCalcPos[c].y,
                    preCalcPos[c].z
                );

                particle.position.normalize();
                particle.position.multiplyScalar(Math.random() * 10 + CLUSTER_SIZE);
                particle.userData.tweet = tweet;

            particles.push(particle);
            geometry.vertices.push( particle.position );
            particlesContainer.add(particle);

            c++;
        });

        // Creates the lines between the nodes
        for(var i = 0; i < geometry.vertices.length; i++){

            var v1 = geometry.vertices[i],
                v2 = geometry.vertices[i + 1];

            if(v2){
                lineContainer.add(factory.getCylinder(v1, v2));
            }
        }

        current = 0;
        currentParticle = null;

        $('.loader').addClass('hidden');

        audio.start();

        new DelayCall(function(){
            introSpin(rotationShift);
        }, 3500);
    };

    var query = function(){

        var q = $('input[name="hashtag"]').val();
            q = String(q).trim();

        if(!q || !q.length){
            return;
        }

        $('input[name="hashtag"]').val('');

        getTweets(q);
    };

    var introSpin = function(callback){

        var t = 3.5;

        // Do as spin
        TweenMax.to(masterContainer.rotation, t * 2, {y : 720 * (Math.PI / 180), yoyo: false, repeat: 0, ease: Sine.easeInOut, onComplete: function(){
            //TweenMax.killAll();
            callback();
        }});

        // Pull out camera
        TweenMax.to(camera.position, t, {z : 800, yoyo: true, repeat: 1, ease: Sine.easeInOut});
    };

    var rotationShift = function(){

        TweenMax.to(camera.position, 2, {z: 1000, ease: Cubic.easeInOut, onComplete: function(){
                zoomToNode();
            }
        });

        TweenMax.to(cameraTweens, 5, {x : 25, yoyo: true, repeat: -1, ease: Sine.easeInOut});
        TweenMax.to(cameraTweens, 8, {y : 25, yoyo: true, repeat: -1, ease: Sine.easeInOut});
    };

    /**
     * Removes all children from an Object3D
     * @param container
     */
    var removeChildren = function(container){

        if(!container){
            return;
        }

        for(var i = container.children.length - 1; i >= 0 ; i --) {
            container.remove(container.children[i]);
        }
    };

    var zoomToNode = function(){

        // Reset the particle counter when no more particles left (out of range protection)
        if(current == geometry.vertices.length){
            current = 0;
        }

        currentParticle = particles[current++];

        TweenMax.to(color, 3, {colorProps: {value: 0xff69B4}, ease: Cubic.easeInOut, onUpdate: function(){
            currentParticle.material.color.setHex( colorUtil.rgbToHex( color.value ) );
        }});

        // Tweens the vector3d (the lookAt target) that the camera continously looks at
        TweenMax.to(camaraTarget, 2, {
            x: currentParticle.position.x,
            y: currentParticle.position.y,
            z: currentParticle.position.z,
            ease: Cubic.easeInOut
        });

        // Pull out the camera
        TweenMax.to(camera.position, 2, {z: 2000, ease: Cubic.easeInOut});

        // Zoom the camera in on the node
        TweenMax.to(camera, 2, {fov: 1, delay: 2, ease: Cubic.easeOut, onUpdate: updateCameraProjectionMatrix});

        // Zooms the camera's z pos to the z pos of the current particle
        TweenMax.to(camera.position, 2, {delay: 1, z: currentParticle.position.z, ease: Cubic.easeInOut, onComplete: function(){

            lineContainer.visible = false;

            setText(currentParticle.userData.tweet.text);

            interval = setInterval(function(){
                clearInterval(interval);
                interval = null;

                TweenMax.to(color, 2, {delay: 1, colorProps: {value: 0xffffff}, ease: Cubic.easeInOut, onUpdate: function(){
                    currentParticle.material.color.setHex( colorUtil.rgbToHex( color.value ) );
                }});


                lineContainer.visible = true;

                TweenMax.to(camera, 2, {fov: 60, delay: 0, ease: Cubic.easeInOut, onUpdate: updateCameraProjectionMatrix, onComplete: function(){
                    TweenMax.to(camera.position, 4, {delay: 1.5, z: 1000, onComplete : function(){
                        zoomToNode();
                    }});
                }});

            }, 4000);
        }});
    };

    var updateCameraProjectionMatrix = function(){
        camera.updateProjectionMatrix();
    };

    var setText = function(text){


        $('.tweet').html(text);
        console.log(text);

        //var $t = $('.tweet');
        //
        //$t.typed({
        //    strings: [text],
        //    typeSpeed: 2,
        //    loop: false,
        //    contentType: 'text',
        //    showCursor : false,
        //    loopCount: false,
        //
        //    callback: function(){
        //        console.log('callback')
        //    },
        //
        //    resetCallback: function() {
        //        console.log('resetCallback')
        //    }
        //});
    };

    var onWindowResize = function() {

        width = window.innerWidth;
        height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

        if(enablePostprocessing){
            postprocessing.composer.setSize(width, height);
        }

        render();
    };

    var animate = function() {
        requestAnimationFrame(animate);
        render();
    };

    var render = function() {
        camera.lookAt(camaraTarget);
        camera.position.x = cameraTweens.x;
        camera.position.y = cameraTweens.y;

        renderer.render( scene, camera );

        if(enablePostprocessing){
            postprocessing.composer.render(
                clock.getDelta()
            );
        }
    };

    if (!window.innerWidth) {
        window.innerWidth = parent.innerWidth;
        window.innerHeight = parent.innerHeight;
    }

    init();
};
},{"../model/3dObjectFactory":2,"../model/tweetModel":3,"../util/color":4,"../util/delayCall":5}]},{},[1]);
