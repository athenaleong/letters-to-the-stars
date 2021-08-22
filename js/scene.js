import * as BASE from "./scene/base.js"
import * as OBJ from "./scene/objects.js"
import * as POSTPROCESS from "./scene/postprocessing.js"
import * as GUI from "./scene/gui.js" 

var base;

function init() {

    base = new BASE.BaseScene();

    OBJ.initObjects(base);
    POSTPROCESS.initPostProcessing(base);
    GUI.initGUI(POSTPROCESS.bloomParams);

    animate();
}

var animate = function () {

    requestAnimationFrame(animate);

    base.animate();
    OBJ.animate();
    POSTPROCESS.animate();
};

window.onresize = function() {
    base.renderer.setSize(window.innerWidth, window.innerHeight);
    base.camera.aspect = window.innerWidth / window.innerHeight;
    base.camera.updateProjectionMatrix();
}

init();