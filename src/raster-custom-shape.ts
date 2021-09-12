import Vector from './vector';
import Shader from './shader';

/**
 * A class creating buffers for an axis aligned box to render it with WebGL
 */
export class RasterCustomShape {
	/**
	 * The buffer containing the box's vertices
	 */
	vertexBuffer: WebGLBuffer;
	/**
	 * The indices describing which vertices form a triangle
	 */
	vertex_indexBuffer: WebGLBuffer;
	normalBuffer: WebGLBuffer;

	colorBuffer: WebGLBuffer;
	/**
	 * The amount of indices
	 */
	elements: number;

	/**
	 * Creates all WebGL buffers for the box
	 *
	 *
	 *          4 (Spitze)
	 *
	 *      3 ------- 2
	 *     /         /
	 *   0 ------- 1
	 *  looking in negative z axis direction
	 * @param gl The canvas' context
	 * @param vertices
	 * @param normals
	 * @param vertex_indices
	 * @param normal_indices
	 */
	constructor(private gl: WebGL2RenderingContext, vertices: number[], normals: number[], vertex_indices: number[], normal_indices: number[]) {
		this.gl = gl;

		let newVertices: number[] = [];
		let newNormals: number[] = [];

		if (vertex_indices.length > 0) {
			makeVerticesNonIndexed();
		}
		else newVertices = vertices;

		if (normal_indices.length > 0) {
			makeNormalsNonIndexed();
		}
		else newNormals = normals;

		this.elements = newVertices.length / 3;

		let color1 = new Vector(Math.random(), Math.random(), Math.random(), 1);
		let colors: number[] = [];
		for (let i = 0; i < newVertices.length; i++) {
			colors.push(color1.r, color1.g, color1.b, color1.a);
		}

		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newVertices), gl.STATIC_DRAW);
		this.vertexBuffer = vertexBuffer;

		const normalBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(newNormals), this.gl.STATIC_DRAW);
		this.normalBuffer = normalBuffer;

		const colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		this.colorBuffer = colorBuffer;

		function makeVerticesNonIndexed() {
			for (let i = 0; i < vertex_indices.length; i++) {
				newVertices.push(vertices[vertex_indices[i] * 3 + 0]);
				newVertices.push(vertices[vertex_indices[i] * 3 + 1]);
				newVertices.push(vertices[vertex_indices[i] * 3 + 2]);
			}
		}
		function makeNormalsNonIndexed() {
			for (let i = 0; i < normal_indices.length; i++) {
				newNormals.push(normals[normal_indices[i] * 3 + 0]);
				newNormals.push(normals[normal_indices[i] * 3 + 1]);
				newNormals.push(normals[normal_indices[i] * 3 + 2]);
			}
		}
	}

	/**
	 * Renders the box
	 * @param shader The shader used to render
	 */
	render(shader: Shader) {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		const positionLocation = shader.getAttributeLocation("a_position");
		this.gl.enableVertexAttribArray(positionLocation);
		this.gl.vertexAttribPointer(positionLocation,
			3, this.gl.FLOAT, false, 0, 0);

		// TODO bind colour buffer
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
		const colorLocation = shader.getAttributeLocation("a_color");
		this.gl.enableVertexAttribArray(colorLocation);
		this.gl.vertexAttribPointer(colorLocation, 4, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
		const normalLocation = shader.getAttributeLocation("a_normal");
		this.gl.enableVertexAttribArray(normalLocation);
		this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 0, 0);

		this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);

		this.gl.disableVertexAttribArray(positionLocation);

		this.gl.disableVertexAttribArray(colorLocation);

		this.gl.disableVertexAttribArray(normalLocation);
	}
}