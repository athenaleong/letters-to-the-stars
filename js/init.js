import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/RenderPass.js';
import * as dat from 'https://unpkg.com/dat.gui@0.7.6/build/dat.gui.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';
import { FlyControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/FlyControls.js';


 
var scene, camera, renderer, mouse, raycaster, particles
var composer, mixer, bloomComposer, finalComposer, bloomPass
var controls

var display = document.getElementById('color');

// bloomParams for Bloom pass
const bloomParams = {
    exposure: 1,
    bloomStrength: 2,
    bloomThreshold: 0.5,
    bloomRadius: 1,
};

const controlParams = {
    keyPanSpeed: 7,
    maxDistance: Infinity,
    maxZoom: Infinity,
    minDistance: 0,
    minZoom: 0,
    panSpeed: 1
}

const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );


function init() {
    initBase();
    initStars();
    initPostProcessing();
    initControl();
    initGUI();
    
    animate();
}

function initBase() {

    //Scene Set up
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setClearColor(new THREE.Color("#000000"));
    document.body.appendChild(renderer.domElement);

    //Raycaster
    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.1

    //Mouse Control
    // mouse = new MouseControl(renderer, camera, raycaster);

    // Lights
    const pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.x = 0;
    pointLight.position.y = 0;
    pointLight.position.z = 0;

    scene.add(pointLight);
}

function initPostProcessing(){
    //Shader 
    const renderScene = new RenderPass( scene, camera );

    bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    //Bloom Pass - resolution, strength, radius, threshold
    bloomPass.threshold = bloomParams.bloomThreshold;
    bloomPass.strength = bloomParams.bloomStrength;
    bloomPass.radius = bloomParams.bloomRadius;

    bloomComposer = new EffectComposer( renderer );
    // bloomComposer.renderToScreen = false;
    bloomComposer.addPass( renderScene );
    bloomComposer.addPass( bloomPass );
    

}

function initStars() {
    const geometry = new THREE.BufferGeometry()
    const sprite = new THREE.TextureLoader().load('texture/spark.png')

    const createStars = (numOfStars) => {
        const vertices = []
        const colors = []
        const sizes = []

        for (let i =0; i < numOfStars; i++) {
            const x = Math.random() * 10 - 5
            const y = Math.random() * 4 - 2
            const z = Math.random() * 100 - 50
            // const color = new THREE.Color("rgb(191, 255, 0)").toArray()
            // console.log(color)
            vertices.push(x, y, z)
            colors.push(...[255, 255, 255])
        }

        const colorAttribute = new THREE.Float32BufferAttribute(colors, 3)

        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geometry.setAttribute('color', colorAttribute);

        const pointMaterial = new THREE.PointsMaterial( {size: 1, map: sprite, vertexColors:true, alphaTest: 0.5} );
        particles = new THREE.Points(geometry, pointMaterial);
        particles.layers.enable(BLOOM_SCENE)
        scene.add(particles)
    }
    createStars(100);
}

function initControl() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate =  false;
    controls.listenToKeyEvents(window);
    controls.enableDamping = true;
}

function initGUI() {
    const gui = new dat.GUI();
    const f1 = gui.addFolder('Bloom Parameters')//Bloom Folder

    f1.add( bloomParams, 'exposure', 0.1, 2 ).onChange( function ( value ) {

        renderer.toneMappingExposure = Math.pow( value, 4.0 );
        animate();

    } );

    f1.add( bloomParams, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

        bloomPass.threshold = Number( value );
        animate();

    } );

    f1.add( bloomParams, 'bloomStrength', 0.0, 10.0 ).onChange( function ( value ) {

        bloomPass.strength = Number( value );
        animate();

    } );

    f1.add( bloomParams, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

        bloomPass.radius = Number( value );
        animate();

    } );

    const f2 = gui.addFolder('Orbit Control') // Orbit Folder

    console.log(controlParams)

    f2.add( controlParams, 'keyPanSpeed', 0.0, 20.0 ).onChange( function (value) {  
        controls.keyPanSpeed = Number(value);
        animate();
    })

    f2.add( controlParams, 'maxDistance', 0.0, Infinity ).onChange( function (value) {  
        controls.maxDistance = Number(value);
        animate();
    })

    f2.add( controlParams, 'minDistance', 0.0, Infinity ).onChange( function (value) {  
        controls.minDistance = Number(value);
        animate();
    })

    f2.add( controlParams, 'maxZoom', 0.0, Infinity ).onChange( function (value) {  
        controls.maxZoom = Number(value);
        animate();
    })

    f2.add( controlParams, 'minZoom', 0.0, Infinity ).onChange( function (value) {  
        controls.minZoom = Number(value);
        animate();
    })

    f2.add( controlParams, 'panSpeed', 0.0, 20.0 ).onChange( function (value) {  
        controls.panSpeed = Number(value);
        animate();
    })
}

var animate = function () {
    requestAnimationFrame( animate );
    // mouse.updataCamera();
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length != 0) {
        var index = intersects[0].index;
        particles.geometry.attributes.color.setXYZ(index, 191, 255, 0)
        particles.geometry.attributes.color.needsUpdate = true;
    }
    controls.update();
    bloomComposer.render();
};

window.onresize = function() {
    var SCREEN_HEIGHT = window.innerHeight;
    var SCREEN_WIDTH = window.innerWidth;

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    bloomComposer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    
}

// const onMouseMove = (event) => {
//     mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
//     mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
//     raycaster.setFromCamera(mouse, camera);
// }

init();
// window.addEventListener('mousemove', onMouseMove);