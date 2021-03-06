"use strict"

export default class SceneManager {
    constructor(application) {
        THREE.Object3D.DefaultUp.set(0, 0, 1);

        // SCENE
        this.scene = new THREE.Scene();
        this.container = document.getElementById('ThreeJS');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.container.appendChild(this.renderer.domElement);

        // CAMERA
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.camera.position.set(0, -30, 50);
        this.scene.add(this.camera);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        THREEx.WindowResize(this.renderer, this.camera);

        // Background clear color
        this.renderer.setClearColor(0xaaaaaa, 1);
        this.renderer.clear();
        this.scene.add(new THREE.HemisphereLight(0xffffff, 0x222222));
        var grid = new THREE.GridHelper(50, 50, new THREE.Color('yellow'), new THREE.Color('grey'));
        grid.rotation.x = Math.PI / 2;
        this.scene.add(grid);

        // Lights
        [
            [1, 1, 1],
            [-1, 1, 1],
            [1, -1, 1],
            [-1, -1, 1]
        ].forEach((pos) => {
            var dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
            dirLight.position.set(pos[0] * 100, pos[1] * 100, pos[2] * 100);
            this.scene.add(dirLight);
        });

        if (application) {
            this.application = application;
            this.application.sceneManager = this;
            this.application.init();
        }

        window.addEventListener('click', this.onClick.bind(this), false);
        this.animate = this.animate.bind(this);
        this.animate();
    }

    animate() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
    }

    onClick(event) {
        // calculate mouse position in normalized device coordinates (-1 to +1) for both components
        this.mouse = this.mouse || new THREE.Vector2();
        this.mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1;

        // calculate objects intersecting the ray according to the camera and mouse position
        this.raycaster = this.raycaster || new THREE.Raycaster();
    	this.raycaster.setFromCamera( this.mouse, this.camera );
        let inter = this.raycaster.intersectObjects( this.scene.children );
        if (inter.length > 0 && this.application.onClick) {
            this.application.onClick(inter);
        }
    }
}
