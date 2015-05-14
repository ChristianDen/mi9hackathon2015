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
