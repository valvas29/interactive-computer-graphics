import Vector from './vector';
import Shader from './shader';

/**
 * A class creating buffers for an axis aligned box to render it with WebGL
 */
export class CustomShape {
	/**
	 * The buffer containing the box's vertices
	 */
	vertexBuffer: WebGLBuffer;
	/**
	 * The indices describing which vertices form a triangle
	 */
	indexBuffer: WebGLBuffer;
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
	 * @param indices
	 */
	constructor(private gl: WebGL2RenderingContext, vertices: number[], normals: number[], indices: number[]) {
		this.gl = gl;

		let color1 = new Vector(Math.random(), Math.random(), Math.random(), 1);
		let color2 = new Vector(Math.random(), Math.random(), Math.random(), 1);

		let colors = [
			// 0
			color1.r, color1.g, color1.b, color1.a,
			color1.r, color1.g, color1.b, color1.a,
			color1.r, color1.g, color1.b, color1.a,

			// 1
			color1.r, color1.g, color1.b, color1.a,
			color1.r, color1.g, color1.b, color1.a,
			color1.r, color1.g, color1.b, color1.a,

			// 2
			color1.r, color1.g, color1.b, color1.a,
			color1.r, color1.g, color1.b, color1.a,
			color1.r, color1.g, color1.b, color1.a,

			// 3
			color1.r, color1.g, color1.b, color1.a,
			color1.r, color1.g, color1.b, color1.a,
			color1.r, color1.g, color1.b, color1.a,

			// 4
			color2.r, color2.g, color2.b, color2.a,
			color2.r, color2.g, color2.b, color2.a,
			color2.r, color2.g, color2.b, color2.a,
			color2.r, color2.g, color2.b, color2.a,
		];

		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vertexBuffer = vertexBuffer;

		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		this.indexBuffer = indexBuffer;
		this.elements = indices.length;

		const normalBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
		this.normalBuffer = normalBuffer;


		// TODO create and fill a buffer for colours
		const colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		this.colorBuffer = colorBuffer;
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

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);

		this.gl.disableVertexAttribArray(positionLocation);

		this.gl.disableVertexAttribArray(colorLocation);

		this.gl.disableVertexAttribArray(normalLocation);
	}
}