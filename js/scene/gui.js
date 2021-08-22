import * as dat from 'https://unpkg.com/dat.gui@0.7.6/build/dat.gui.module.js';

export {initGUI};

function initGUI(bloomParams) {
    const gui = new dat.GUI();
    const f1 = gui.addFolder('Bloom Parameters') //Bloom Folder

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
}