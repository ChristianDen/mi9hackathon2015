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