import Vector from './vector';
import Shader from './shader';

/**
 * A class creating buffers for an axis aligned box to render it with WebGL
 */
export default class RasterBox {
    /**
     * The buffer containing the box's vertices
     */
    vertexBuffer: WebGLBuffer;
    /**
     * The indices describing which vertices form a triangle
     */
    indexBuffer: WebGLBuffer;
    // TODO private variable for color buffer
    /**
     * The normals on the surface at each vertex location
     */
    normalBuffer: WebGLBuffer;

    colorBuffer: WebGLBuffer;
    /**
     * The amount of indices
     */
    elements: number;

    /**
     * Creates all WebGL buffers for the box
     *     6 ------- 7
     *    / |       / |
     *   3 ------- 2  |
     *   |  |      |  |
     *   |  5 -----|- 4
     *   | /       | /
     *   0 ------- 1
     *  looking in negative z axis direction
     * @param gl The canvas' context
     * @param minPoint The minimal x,y,z of the box
     * @param maxPoint The maximal x,y,z of the box
     */
    constructor(private gl: WebGL2RenderingContext, minPoint: Vector, maxPoint: Vector) {
        this.gl = gl;
        const mi = minPoint;
        const ma = maxPoint;
        let vertices = [
            // 3*8 = 24 vertices because every vertex has 3 different normals

            // 0
            mi.x, mi.y, ma.z, // 0 facing bottom
            mi.x, mi.y, ma.z, // 1 facing front
            mi.x, mi.y, ma.z, // 2 facing left

            // 1
            ma.x, mi.y, ma.z, // 3 bottom
            ma.x, mi.y, ma.z, // 4 front
            ma.x, mi.y, ma.z, // 5 right

            // 2
            ma.x, ma.y, ma.z, // 6 top
            ma.x, ma.y, ma.z, // 7 front
            ma.x, ma.y, ma.z, // 8 right

            // 3
            mi.x, ma.y, ma.z, // 9 top
            mi.x, ma.y, ma.z, // 10 front
            mi.x, ma.y, ma.z, // 11 left

            // 4
            ma.x, mi.y, mi.z, // 12 bottom
            ma.x, mi.y, mi.z, // 13 back
            ma.x, mi.y, mi.z, // 14 right

            // 5
            mi.x, mi.y, mi.z, // 15 bottom
            mi.x, mi.y, mi.z, // 16 back
            mi.x, mi.y, mi.z, // 17 left

            // 6
            mi.x, ma.y, mi.z, // 18 top
            mi.x, ma.y, mi.z, // 19 back
            mi.x, ma.y, mi.z, // 20 left

            // 7
            ma.x, ma.y, mi.z, // 21 top
            ma.x, ma.y, mi.z, // 22 back
            ma.x, ma.y, mi.z  // 23 right
        ];
        let indices = [
            // front
            1, 4, 7, 1, 7, 10,
            // back
            16, 13, 22, 16, 19, 22,
            // right
            5, 14, 23, 23, 8, 5,
            // bottom
            0, 3, 12, 0, 12, 15,
            // top
            9, 6, 21, 9, 18, 21,
            // left
            2, 20, 17, 11, 20, 2
        ];
        let colors = [
            1.0, 0.0, 0.0, 1.0, // red
            1.0, 0.0, 0.0, 1.0, // red
            1.0, 0.0, 0.0, 1.0, // red

            0.0, 1.0, 0.0, 1.0, // green
            0.0, 1.0, 0.0, 1.0, // green
            0.0, 1.0, 0.0, 1.0, // green

            0.0, 0.0, 1.0, 1.0, // blue
            0.0, 0.0, 1.0, 1.0, // blue
            0.0, 0.0, 1.0, 1.0, // blue

            1.0, 0.0, 0.0, 1.0, // red
            1.0, 0.0, 0.0, 1.0, // red
            1.0, 0.0, 0.0, 1.0, // red

            0.0, 1.0, 0.0, 1.0, // green
            0.0, 1.0, 0.0, 1.0, // green
            0.0, 1.0, 0.0, 1.0, // green

            0.0, 0.0, 1.0, 1.0, // blue
            0.0, 0.0, 1.0, 1.0, // blue
            0.0, 0.0, 1.0, 1.0, // blue

            1.0, 0.0, 0.0, 1.0, // red
            1.0, 0.0, 0.0, 1.0, // red
            1.0, 0.0, 0.0, 1.0, // red

            0.0, 1.0, 0.0, 1.0, // green
            0.0, 1.0, 0.0, 1.0, // green
            0.0, 1.0, 0.0, 1.0, // green
        ];
        let normals = [
            // 0
            // facing bottom
            0, -1, 0,
            // facing front
            0, 0, 1,
            // facing left
            -1, 0, 0,

            // 1
            0, -1, 0, // bottom
            0, 0, 1, // front
            1, 0, 0, // right

            // 2
            0, 1, 0, //top
            0, 0, 1, // front
            1, 0, 0, // right

            // 3
            0, 1, 0, // top
            0, 0, 1, // front
            -1, 0, 0, // left

            // 4
            0, -1, 0, // bottom
            0, 0, -1, // back
            1, 0, 0, // right

            // 5
            0, -1, 0, // bottom
            0, 0, -1, // back
            -1, 0, 0, // left

            //6
            0, 1, 0, // top
            0, 0, -1, // back
            -1, 0, 0, // left

            // 7
            0, 1, 0, // top
            0, 0, -1, // back
            1, 0, 0// right
        ];

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer = vertexBuffer;

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        this.indexBuffer = indexBuffer;

        const normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
        this.normalBuffer = normalBuffer;
        this.elements = indices.length;

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

        // TODO bind normal buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        const normalLocation = shader.getAttributeLocation("a_normal");
        this.gl.enableVertexAttribArray(normalLocation);
        this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);

        this.gl.disableVertexAttribArray(positionLocation);

        // TODO disable color vertex attrib array
        this.gl.disableVertexAttribArray(colorLocation);

        this.gl.disableVertexAttribArray(normalLocation);
    }
}