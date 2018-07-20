class MeshXref {
    constructor(geometry) {
        this.geometry = geometry;
        this.geometry.mergeVertices();
    }
    calcVertexToFace() {
        this.vertexToFace = new Array(this.geometry.vertices.length);
        this.geometry.faces.forEach((f, i) => {
            (this.vertexToFace[f.a] = this.vertexToFace[f.a] || []).push(i);
            (this.vertexToFace[f.b] = this.vertexToFace[f.b] || []).push(i);
            (this.vertexToFace[f.c] = this.vertexToFace[f.c] || []).push(i);
        });
        return this;
    }
    calcVertexToVertex() {
        this.vertexToVertex = new Array(this.geometry.vertices.length);
        this.geometry.faces.forEach((f, i) => {
            (this.vertexToVertex[f.a] = this.vertexToVertex[f.a] || []).push(f.b, f.c);
            (this.vertexToVertex[f.b] = this.vertexToVertex[f.b] || []).push(f.c, f.a);
            (this.vertexToVertex[f.c] = this.vertexToVertex[f.c] || []).push(f.a, f.b);
        });
        this.vertexToVertex = this.vertexToVertex.map(a => Array.from(new Set(a)));
        return this;
    }
}