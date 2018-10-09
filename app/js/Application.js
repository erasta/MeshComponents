"use strict"

import SceneManager from "./SceneManager.js"
import MeshConnectedComponents from "./MeshConnectedComponents.js"

export class Application {
    init() {
        // this.ballSize = 3;
        this.askNameForEachFile = false;

        var that = this;
        document.getElementById('fileInput').addEventListener('change', (evt) => {
            that.readStlFile(evt.target.files[0]);
        }, false);

        this.initGui();

        this.meshes = [];
        this.geom = new THREE.SphereGeometry(3, 32, 32);
        this.geom.merge(new THREE.CylinderGeometry(3, 3, 3, 32), new THREE.Matrix4().makeTranslation(7, 0, 0));
        this.geom.merge(new THREE.TorusKnotGeometry(2, 0.4, 128, 32), new THREE.Matrix4().makeTranslation(-7, 0, 0));
        this.analyzeMesh();

        // this.applyGuiChanges();
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

        var geometries = new MeshConnectedComponents().mcc(this.geom);
        this.meshes = geometries.map(g => new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random())})));
        this.meshes.forEach(mesh => this.sceneManager.scene.add(mesh));
        this.selected = [];
        for (var i = 0; i < this.meshes.length; ++i) this.selected[i] = true;
        this.updateSelection();
    }

    writeMeshStl(mesh, filename) {
        var data = new THREE.STLExporter().parse(mesh);
        var blob = new Blob([data], { type: "text/plain;charset=utf-8" });
        saveAs(blob, filename.toLowerCase().endsWith(".stl") ? filename : filename + ".stl");
    }
    writeStl() {
        if (this.selected.indexOf(true) < 0) {
            alert("Please click on a component");
            return;
        };
        var filename = "mesh_component";
        if (this.askNameForEachFile || this.selected.filter(s => s === true).length <= 1) {
            this.selected.forEach((s, i) => {
                if (!s) return;
                filename = prompt("STL file name", filename);
                this.writeMeshStl(this.meshes[i], filename);
            });
        } else {
            filename = prompt("STL file prefix", filename);
            var counter = 1;
            this.selected.forEach((s, i) => {
                if (!s) return;
                this.writeMeshStl(this.meshes[i], filename + counter++);
            });
        }
        // console.log(data);
    }

    initGui() {
        this.applyGuiChanges = this.applyGuiChanges.bind(this);
        this.gui = new dat.GUI({ autoPlace: true, width: 300 });
        this.gui.add(this, 'startReadStl').name('Read STL');
        this.gui.add(this, 'writeStl').name('Write Selected STL');
        this.gui.add(this, 'askNameForEachFile').name('Ask Name For Each File');
        // this.gui.add(this, 'ballSize').name('Ball size').min(0.1).max(16).step(0.01).onChange(this.applyGuiChanges);
    }

    onClick(inter) {
        // this.sceneManager.scene.remove(this.dot);
        inter = inter.filter(o => o.object instanceof THREE.Mesh);
        if (inter.length == 0) return;
        var s = this.meshes.indexOf(inter[0].object);
        if (s < 0) return;
        this.selected[s] = !this.selected[s];
        this.updateSelection();
        // this.dot = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshNormalMaterial());
        // this.dot.position.copy(inter[0].point);
        // this.sceneManager.scene.add(this.dot);
    }

    updateSelection() {
        // console.log(this.selected);
        this.meshes.forEach((m, i) => {
            m.material.wireframe = !this.selected[i];
        });
    }
}

new SceneManager(new Application());
