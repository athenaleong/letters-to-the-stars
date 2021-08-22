import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

import {MouseControl} from '../mouse.js'

export {BaseScene};

class BaseScene {

    constructor () {

        //Scene Set up
        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 1000 );
        camera.position.z = 5;

        let renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setClearColor(new THREE.Color("#000000"));
        document.body.appendChild(renderer.domElement);

        //Raycaster
        let raycaster = new THREE.Raycaster();
        raycaster.params.Points.threshold = 0.1;

        //Mouse Control
        let mouse = new MouseControl(renderer, camera, raycaster, scene);

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.raycaster = raycaster;
        this.mouse = mouse;
    }

    animate() {
        this.mouse.updateCamera();
    }

}