"use strict"

import MeshXref from "./MeshXref.js"
import stronglyConnectedComponents from "./scc.js"

export default class MeshConnectedComponents {
    go(mesh) {
        var xref = new MeshXref(mesh.geometry);
        xref.calcVertexToVertex();
        var cc = stronglyConnectedComponents(xref.vertexToVertex).components;
        // console.log("comp: " + this.cc.length);
        xref.calcVertexToFace();

        var vert2cc = new Array(mesh.geometry.vertices.length);
        return cc.map(c => {
            var color = new THREE.Color(Math.random(), Math.random(), Math.random());
            var m = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshStandardMaterial({ color: color }));
            c.forEach(v => {
                vert2cc[v] = c;
            });
            mesh.geometry.faces.forEach(f => {
                if (vert2cc[f.a] == c) {
                    var v = m.geometry.vertices.length;
                    m.geometry.vertices.push(mesh.geometry.vertices[f.a], mesh.geometry.vertices[f.b], mesh.geometry.vertices[f.c]);
                    m.geometry.faces.push(new THREE.Face3(v, v + 1, v + 2));
                }
            });
            m.geometry.mergeVertices();
            m.geometry.computeFlatVertexNormals();
            return m;
        });

    }    
}