/** 
* Class that handles camera view based on mouse input
* Camera z-coordinate has to be positive.
**/
class MouseControl {

    /**
     * constructor
     * @param {THREE.WebGLRenderer} renderer {Renderer of the THREEjs application}
     * @param {THREE.PerspectiveCamera} camera {Camera of the THREEjs application}
     * @param {THREE.Raycaster} raycaster
     * @param {THREE.Scene} scene 
     * @param {float} zoompower {Controls the zoom sensitivity (default 5)}
     * @param {float} translatepower {controls the translate sensitivity (default 5)}
     **/

    #ismousedown;
    #mousepos;
    #difftranslate;
    #iswheel;
    #diffwheel;
    #wheeltimeout; // tracks if wheel is activated

    constructor(renderer, camera, raycaster, scene, zoompower=10, translatepower=20) {

        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.raycaster = raycaster;
        this.zoompower = zoompower;
        this.translatepower = translatepower;

        this.#ismousedown = false;
        this.#mousepos = new THREE.Vector2(0,0);
        this.#difftranslate = new THREE.Vector2(0,0);

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
                self.#difftranslate.x += e.pageX - self.#mousepos.x;
                self.#difftranslate.y += e.pageY - self.#mousepos.y;
            }
            self.#mousepos.x = e.pageX;
            self.#mousepos.y = e.pageY;

        }, false);

        this.renderer.domElement.addEventListener('mousedown', function (e) {
            self.#ismousedown = true;
        }, false);

        this.renderer.domElement.addEventListener('mouseup', function (e) {
            self.#ismousedown = false;
            self.#difftranslate.x = 0;
            self.#difftranslate.y = 0;
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
     * @returns THREE.Vector2 {Position of mouse}
     **/
    getCurrentMousePos() {
        return this.#mousepos;
    }

    /**
     * Gets DOM element size
     * @returns THREE.Vector2 {Position of mouse}
     **/
    #getSize() {
        var box = this.renderer.domElement.getBoundingClientRect();
        return new THREE.Vector2(box.width, box.height);
    }

    /**
     * Updates this.raycaster according to mouse position
     **/
    #updateRaycaster() {

        const size = this.#getSize();

        var m = this.#mousepos;
        var tmp = new THREE.Vector2( 2*m.x/size.x - 1,  - 2*m.y/size.y + 1);
        this.raycaster.setFromCamera(tmp, this.camera);
    }

    /**
     * Updates self for translation
     **/
    #updateTranslate() {

        const size = this.#getSize();

        var t = this.#difftranslate;
        t.x /= size.x;
        t.y /= size.x;

        var c = this.translatepower;
        this.camera.position.x -= t.x * c;
        this.camera.position.y += t.y * c;

        this.#difftranslate.x = 0;
        this.#difftranslate.y = 0;
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

        this.#diffwheel = 0;
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
