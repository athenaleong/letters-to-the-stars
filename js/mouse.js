/** 
* Class that handles camera view based on mouse input
* Camera z-coordinate has to be positive.
**/
class MouseControl {

    /**
     * constructor
     * @param {THREE.WebGLRenderer} renderer {Renderer of the THREEjs application}
     * @param {THREE.PerspectiveCamera} camera {Camera of the THREEjs application}
     * @param {float} zoompower {Controls the zoom sensitivity (default 5)}
     * @param {float} translatepower {controls the translate sensitivity (default 5)}
     **/

    #ratio;
    #ismousedown;
    #mousepos;
    #difftranslate;
    #iswheel;
    #diffwheel;
    #wheeltimeout; // tracks if wheel is activated

    constructor(renderer, camera, raycaster, scene, zoompower=10, translatepower=50) {

        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.raycaster = raycaster;
        this.zoompower = zoompower;
        this.translatepower = translatepower;

        this.#ismousedown = false;
        this.#mousepos = [null, null];
        this.#difftranslate = [null, null];

        this.#iswheel = false;
        this.#diffwheel = 0;
        this.#wheeltimeout = null;

        this.#initMouseEvents();
    }

    /**
     * Initialises mouse event handlers for this class.
     * Called in constructor
     **/
    #initMouseEvents() {

        const self = this; // Prevent name conflicts

        this.renderer.domElement.addEventListener('mousemove', function (e) {
            if (self.#ismousedown) {
                self.#difftranslate = [
                    self.#difftranslate[0] + e.pageX - self.#mousepos[0], 
                    self.#difftranslate[1] + e.pageY - self.#mousepos[1]];
            }
            self.#mousepos = [e.pageX, e.pageY];

        }, false);

        this.renderer.domElement.addEventListener('mousedown', function (e) {
            self.#ismousedown = true;
        }, false);

        this.renderer.domElement.addEventListener('mouseup', function (e) {
            self.#ismousedown = false;
            self.#difftranslate = [0,0];

        }, false);

        this.renderer.domElement.addEventListener("wheel", function(e) {
            clearTimeout(self.#wheeltimeout);
            self.#diffwheel += e.deltaY;
            self.#iswheel = true;
            self.#wheeltimeout = setTimeout(function(){self.#iswheel = false;}, 100);
        }, false);
    }

    /**
     * Checks if mouse is down
     * @returns {bool} {If mouse is down}
     **/
    isMouseDown() {
        return this.#ismousedown;
    }

    /**
     * Checks if mouse wheel is active
     * @returns {bool} {If mouse wheel is active}
     **/
    isWheelActive() {
        return this.#iswheel;
    }

    /**
     * Gets current mouse position scaled to this.renderer size
     * @returns {Tuple[float,float]} {Position of mouse}
     **/
    getCurrentMousePos() {
        return this.#mousepos;
    }

    #getSize() {
        const v2 = new THREE.Vector2();
        this.renderer.getDrawingBufferSize(v2);
        return v2;
    }

    #updateRaycaster() {

        const size = this.#getSize();

        var [mx,my] = this.#mousepos;
        var tmp = new THREE.Vector2( 2*mx/size.x/.8 - 1,  - 2*my/size.y/.8 + 1);
        this.raycaster.setFromCamera(tmp, this.camera);
    }

    /**
     * Updates self for translation
     **/
    #updateTranslate() {

        const size = this.#getSize();

        var [tx,ty] = this.#difftranslate;
        var tx = tx/size.x;
        var ty = ty/size.x;

        var c = this.translatepower;
        this.camera.position.x -= tx * c;
        this.camera.position.y += ty * c;

        this.#difftranslate = [0,0];
    }

    /**
     * Updates self for Zoom
     **/
    #updateZoom() {

        const size = this.#getSize();
        
        var zoom = -this.#diffwheel;
        zoom /= size.y;
        zoom *= this.zoompower;
        
        this.#updateRaycaster();
        const ray = this.raycaster.ray.direction;

        this.camera.position.x += zoom * ray.x;
        this.camera.position.y += zoom * ray.y;
        this.camera.position.z += zoom * ray.z;

        this.#diffwheel = 0
    }

    /**
     * Updates camera according to mouse inputs. 
     * Implementation accounts for skipped frames
     **/
    updataCamera() {

        // Implement translation
        if (this.#ismousedown)
            this.#updateTranslate();

        // Implement zoom
        if (this.#iswheel)
            this.#updateZoom();
    }
}
