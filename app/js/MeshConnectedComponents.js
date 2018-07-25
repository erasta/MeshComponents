"use strict"

import MeshXref from "./MeshXref.js"
import stronglyConnectedComponents from "./scc.js"

export default class MeshConnectedComponents {
    mcc(geom) {
        var xref = new MeshXref(geom);
        xref.calcVertexToVertex();
        var cc = stronglyConnectedComponents(xref.vertexToVertex).components;
        xref.calcVertexToFace();

        var vert2cc = new Array(geom.vertices.length);
        return cc.map(c => {
            c.forEach(v => {
                vert2cc[v] = c;
            });
            var g = new THREE.Geometry();
            geom.faces.forEach(f => {
                if (vert2cc[f.a] == c) {
                    var v = g.vertices.length;
                    g.vertices.push(geom.vertices[f.a], geom.vertices[f.b], geom.vertices[f.c]);
                    g.faces.push(new THREE.Face3(v, v + 1, v + 2));
                }
            });
            g.mergeVertices();
            g.computeFlatVertexNormals();
            return g;
        });

    }    
}