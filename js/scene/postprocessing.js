import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.127.0/examples/jsm/postprocessing/RenderPass.js';

export {initPostProcessing, bloomParams, animate};

var composer, mixer, bloomComposer, finalComposer
var bloomPass

// Params for Bloom pass
const bloomParams = {
    exposure: 1,
    bloomStrength: 2,
    bloomThreshold: 0.5,
    bloomRadius: 1,
};

const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

function initPostProcessing(base){
    //Shader 
    const renderScene = new RenderPass( base.scene, base.camera );

    bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    //Bloom Pass - resolution, strength, radius, threshold
    bloomPass.threshold = bloomParams.bloomThreshold;
    bloomPass.strength = bloomParams.bloomStrength;
    bloomPass.radius = bloomParams.bloomRadius;

    bloomComposer = new EffectComposer( base.renderer );
    // bloomComposer.renderToScreen = false;
    bloomComposer.addPass( renderScene );
    bloomComposer.addPass( bloomPass );
}

function animate()
{
    bloomComposer.render();
}