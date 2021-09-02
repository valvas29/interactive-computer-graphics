import Vector from './vector';
import Shader from './shader';

/**
 * A class creating buffers for an axis aligned box to render it with WebGL
 */
export default class RasterPyramid {
    /**
     * The buffer containing the box's vertices
     */
    vertexBuffer: WebGLBuffer;
    /**
     * The indices describing which vertices form a triangle
     */
    indexBuffer: WebGLBuffer;
    normalBuffer: WebGLBuffer;
    // TODO private variable for color buffer
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
     * @param minPoint The minimal x,y,z of the box
     * @param maxPoint The maximal x,y,z of the box
     */
    constructor(private gl: WebGL2RenderingContext, minPoint: Vector, maxPoint: Vector, color1?: Vector, color2?: Vector) {
        this.gl = gl;
        const mi = minPoint;
        const ma = maxPoint;
        let vertices = [
            // 0
            mi.x, mi.y, ma.z, // 0 bottom
            mi.x, mi.y, ma.z, // 1 front and up
            mi.x, mi.y, ma.z, // 2 left and up

            // 1
            ma.x, mi.y, ma.z, // 3 bottom
            ma.x, mi.y, ma.z, // 4 front up
            ma.x, mi.y, ma.z, // 5 right up

            // 2
            ma.x, mi.y, mi.z, // 6 bottom
            ma.x, mi.y, mi.z, // 7 back up
            ma.x, mi.y, mi.z, // 8 right up

            // 3
            mi.x, mi.y, mi.z, // 9 bottom
            mi.x, mi.y, mi.z, // 10 back up
            mi.x, mi.y, mi.z, // 11 left up

            // 4
            (mi.x + ma.x)/2, ma.y, (mi.z + ma.z)/2, // 12 front up
            (mi.x + ma.x)/2, ma.y, (mi.z + ma.z)/2, // 13 right up
            (mi.x + ma.x)/2, ma.y, (mi.z + ma.z)/2, // 14 back up
            (mi.x + ma.x)/2, ma.y, (mi.z + ma.z)/2  // 15 left up
        ];
        let indices = [
            // front
            1, 4, 12,
            // back
            7, 10, 14,
            // right
            5, 8, 13,
            // left
            11, 2, 15,
            // bottom
            0, 3, 6, 6, 9, 0
        ];

        if(color1 === undefined){
            color1 = new Vector(Math.random(), Math.random(), Math.random(), 1);
        }

        if(color2 === undefined){
            color2 = new Vector(Math.random(), Math.random(), Math.random(), 1);
        }

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

        let point0 = new Vector(mi.x, mi.y, ma.z, 1);
        let point1 = new Vector(ma.x, mi.y, ma.z, 1);
        let point2 = new Vector(ma.x, mi.y, mi.z, 1);
        let point3 = new Vector(mi.x, mi.y, mi.z, 1);
        let point4 = new Vector((mi.x + ma.x)/2, ma.y, (mi.z + ma.z)/2, 1);

        let vec_0_1 = point1.sub(point0);
        let vec_0_4 = point4.sub(point0);
        let frontUp = vec_0_1.cross(vec_0_4).normalize();

        let vec_3_0 = point0.sub(point3);
        let vec_3_4 = point4.sub(point3);
        let leftUp = vec_3_0.cross(vec_3_4).normalize();

        let vec_2_3 = point3.sub(point2);
        let vec_2_4 = point4.sub(point2);
        let backUp = vec_2_3.cross(vec_2_4).normalize();

        let vec_1_2 = point2.sub(point1);
        let vec_1_4 = point4.sub(point1);
        let rightUp = vec_1_2.cross(vec_1_4).normalize();

        let normals = [
            // 0
            // facing bottom
            0, -1, 0,
            // facing front and up
            frontUp.x, frontUp.y, frontUp.z,
            // facing left and up
            leftUp.x, leftUp.y, leftUp.z,

            // 1
            0, -1, 0, // bottom
            frontUp.x, frontUp.y, frontUp.z, // front up
            rightUp.x, rightUp.y, rightUp.z, // right up

            // 2
            0, -1, 0, // bottom
            backUp.x, backUp.y, backUp.z, // back up
            rightUp.x, rightUp.y, rightUp.z, // right up

            // 3
            0, -1, 0, // bottom
            backUp.x, backUp.y, backUp.z, // back up
            leftUp.x, leftUp.y, leftUp.z, // left up

            // 4
            frontUp.x, frontUp.y, frontUp.z, // front up
            rightUp.x, rightUp.y, rightUp.z, // right up
            backUp.x, backUp.y, backUp.z, // back up
            leftUp.x, leftUp.y, leftUp.z, // left up
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

        // TODO disable color vertex attrib array
        this.gl.disableVertexAttribArray(colorLocation);

        this.gl.disableVertexAttribArray(normalLocation);
    }
}