class Application {
    init() {
        // this.ballSize = 3;

        var that = this;
        document.getElementById('fileInput').addEventListener('change', (evt) => {
            that.readStlFile(evt.target.files[0]);
        }, false);

        this.initGui();

        var material = new THREE.MeshStandardMaterial({ color: 'lightgreen' });
        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material);
        this.mesh.position.set(0, 0, 3);
        this.sceneManager.scene.add(this.mesh);

        this.applyGuiChanges();
    }

    applyGuiChanges() {
        // console.log(guiParams.ballSize);
        // this.mesh.scale.set(this.ballSize, this.ballSize, this.ballSize);
    }

    startReadStl() {
        document.getElementById('fileInput').value = "";
        document.getElementById('fileInput').click();
    }

    readStlFile(file) {
        var reader = new FileReader();
        reader.onload = ((theFile) => {
            return (e) => {
                console.log("loaded " + theFile.name);
                this.mesh.geometry = new THREE.STLLoader().parse(e.target.result);
                this.analyzeMesh();
            };
        })(file);
        setTimeout(() => {
            reader.readAsText(file);
        }, 10);
    }

    analyzeMesh() {
        this.xref = new MeshXref(this.mesh.geometry);
        this.xref.calcVertexToVertex();
        this.cc = stronglyConnectedComponents(this.xref.vertexToVertex).components;
        console.log(this.cc);
        this.mesh.geometry.computeFlatVertexNormals();
        // this.xref.calcVertexToFace();
    }

    initGui() {
        this.applyGuiChanges = this.applyGuiChanges.bind(this);
        this.gui = new dat.GUI({ autoPlace: true, width: 500 });
        this.gui.add(this, 'startReadStl').name('Read STL');
        // this.gui.add(this, 'ballSize').name('Ball size').min(0.1).max(16).step(0.01).onChange(this.applyGuiChanges);
    }

    onClick(inter) {
        this.sceneManager.scene.remove(this.dot);
        if (inter[0].object !== this.mesh) return;
        this.dot = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshNormalMaterial());
        this.dot.position.copy(inter[0].point);
        this.sceneManager.scene.add(this.dot);
    }
}
