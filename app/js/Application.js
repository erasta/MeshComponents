class Application {
    init() {
        // this.ballSize = 3;

        var that = this;
        document.getElementById('fileInput').addEventListener('change', (evt) => {
            that.readStlFile(evt.target.files[0]);
        }, false);

        this.initGui();

        this.meshes = [];
        // this.sceneManager.scene.add(this.mesh);

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
                this.geom = new THREE.STLLoader().parse(e.target.result);
                if (this.geom instanceof THREE.BufferGeometry) this.geom = new THREE.Geometry().fromBufferGeometry(this.geom);
                this.analyzeMesh();
            };
        })(file);
        setTimeout(() => {
            reader.readAsText(file);
        }, 10);
    }

    analyzeMesh() {
        this.meshes.forEach(m => this.sceneManager.scene.remove(m));
        this.meshes = [];
        this.selected = -1;

        this.xref = new MeshXref(this.geom);
        this.xref.calcVertexToVertex();
        this.cc = stronglyConnectedComponents(this.xref.vertexToVertex).components;
        console.log("comp: " + this.cc.length);
        this.xref.calcVertexToFace();

        var vert2cc = new Array(this.geom.vertices.length);
        this.cc.forEach(c => {
            var color = new THREE.Color(Math.random(), Math.random(), Math.random());
            var mesh = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshStandardMaterial({ color: color }));
            c.forEach(v => {
                vert2cc[v] = c;
            });
            this.geom.faces.forEach(f => {
                if (vert2cc[f.a] == c) {
                    var v = mesh.geometry.vertices.length;
                    mesh.geometry.vertices.push(this.geom.vertices[f.a], this.geom.vertices[f.b], this.geom.vertices[f.c]);
                    mesh.geometry.faces.push(new THREE.Face3(v, v + 1, v + 2));
                }
            });
            mesh.geometry.mergeVertices();
            mesh.geometry.computeFlatVertexNormals();
            this.meshes.push(mesh);
            this.sceneManager.scene.add(mesh);
        });
    }

    writeStl() {
        if (this.selected < 0 || this.selected >= this.meshes.length) return;
        var data = new THREE.STLExporter().parse(this.meshes[this.selected]);
        var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "mesh_component.stl");
        // console.log(data);
    }

    initGui() {
        this.applyGuiChanges = this.applyGuiChanges.bind(this);
        this.gui = new dat.GUI({ autoPlace: true, width: 300 });
        this.gui.add(this, 'startReadStl').name('Read STL');
        this.gui.add(this, 'writeStl').name('Write Selected STL');
        // this.gui.add(this, 'ballSize').name('Ball size').min(0.1).max(16).step(0.01).onChange(this.applyGuiChanges);
    }

    onClick(inter) {
        // this.sceneManager.scene.remove(this.dot);
        this.selected = this.meshes.indexOf(inter[0].object);
        if (this.selected < 0) return;
        this.meshes.forEach((m, i) => {
            m.material.wireframe = i != this.selected;
        });
        // this.dot = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshNormalMaterial());
        // this.dot.position.copy(inter[0].point);
        // this.sceneManager.scene.add(this.dot);
    }
}
