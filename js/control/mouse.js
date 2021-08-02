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

    constructor(renderer, camera, raycaster, zoompower=10, translatepower=1) {

        const v2 = new THREE.Vector2();
        renderer.getDrawingBufferSize(v2);
        this.width = v2.x;
        this.height = v2.y;
        this.renderer = renderer;
        this.camera = camera;
        this.raycaster = raycaster;
        this.zoompower = zoompower;
        this.translatepower = translatepower;

        this.#ratio = this.height / this.width;

        this.#ismousedown = false;
        this.#mousepos = [null, null];
        this.#difftranslate = [null, null];

        this.#iswheel = false;
        this.#diffwheel = 0;
        this.#wheeltimeout = null;

        console.log(this.renderer)
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
            var temp = [( e.clientX / window.innerWidth ) * 2 - 1,  - ( e.clientY / window.innerHeight ) * 2 + 1]
            console.log(temp)
            self.raycaster.setFromCamera(temp, self.camera)

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

    /**
     * Updates self for translation
     **/
    #updateTranslate() {

        var [tx,ty] = this.#difftranslate;
        var tx = tx/this.width;
        var ty = ty/this.width;
        var c = this.camera.position.z * this.translatepower;
        this.camera.position.x -= tx * c;
        this.camera.position.y += ty * c;

        this.#difftranslate = [0,0];
    }

    /**
     * Updates self for Zoom
     **/
    #updateZoom() {
        
        var zoom = this.#diffwheel;
        zoom /= this.height;
        zoom *= this.zoompower;
        var [mx,my] = this.#mousepos;
        var mx = mx/this.width  - 0.5; // Scale to [-0.5, 0.5]
        var my = my/this.height - 0.5;
        mx /= this.#ratio

        var fov = this.camera.fov;
        var c = Math.tan(fov/2*Math.PI/180) * 2;
        this.camera.position.x -= zoom * mx * c;
        this.camera.position.y += zoom * my * c;
        this.camera.position.z += zoom;
        
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

        // Implement camera constraints
        this.camera.position.z = Math.max(0, this.camera.position.z);
        this.camera.updateProjectionMatrix();
    }
}
