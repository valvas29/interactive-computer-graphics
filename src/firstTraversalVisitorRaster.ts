import {AABoxNode, CameraNode, GroupNode, Node, PyramidNode, SphereNode, TextureBoxNode} from "./nodes";
import RasterSphere from "./raster-sphere";
import Vector from "./vector";
import RasterBox from "./raster-box";
import RasterTextureBox from "./raster-texture-box";
import Matrix from "./matrix";
import Visitor from "./visitor";
import {CameraRasteriser, CameraRaytracer} from "./project-boilerplate";

/**
 * Class traversing the Scene Graph before the actual traversal
 * to extract camera- and light-information
 * */
export class FirstTraversalVisitorRaster implements Visitor{
	matrixStack: Matrix[];
	inverseStack: Matrix[];

	/**
	 * The view matrix to transform vertices from
	 * the world coordinate system to the
	 * view coordinate system
	 */
	lookat: Matrix;

	/**
	 * The perspective matrix to transform vertices from
	 * the view coordinate system to the
	 * normalized device coordinate system
	 */
	perspective: Matrix;

	/**
	 * Creates a new FirstTraversalVisitorRaster
	 */
	constructor() {

	}

	/**
	 * Sets up all needed buffers
	 * @param rootNode The root node of the Scenegraph
	 */
	setup(rootNode: Node) {
		//MatrixStacks hier immer neu leeren, damit firefox nicht crasht
		this.matrixStack = [];
		this.inverseStack = [];
		this.matrixStack.push(Matrix.identity());
		this.inverseStack.push(Matrix.identity());
		rootNode.accept(this);
	}

	/**
	 * Helper function to setup camera matrices
	 * @param camera The camera used
	 */
	setupCamera(camera: CameraRasteriser) {
		this.lookat = Matrix.lookat(
			camera.eye,
			camera.center,
			camera.up);

		this.perspective = Matrix.perspective(
			camera.fovy,
			camera.aspect,
			camera.near,
			camera.far
		);
	}

	/**
	 * Visits a group node
	 * @param node The node to visit
	 */
	visitGroupNode(node: GroupNode) {
		//Stack pushen
		this.matrixStack.push(this.matrixStack[this.matrixStack.length - 1].mul(node.transform.getMatrix()));
		this.inverseStack.push(node.transform.getInverseMatrix().mul(this.inverseStack[this.inverseStack.length - 1]));

		//jedes children accepten lassen -> ruft bei group-node wieder visitGroupNode auf (rekursiv quasi)
		node.childNodes.forEach(node => node.accept(this)); //lambda-Ausdruck von Array

		this.matrixStack.pop();
		this.inverseStack.pop();
	}

	/**
	 * Visits a sphere node
	 * @param node - The node to visit
	 */
	visitSphereNode(node: SphereNode) {

	}

	/**
	 * Visits an axis aligned box node
	 * @param  {AABoxNode} node - The node to visit
	 */
	visitAABoxNode(node: AABoxNode) {

	}

	/**
	 * Visits a textured box node. Loads the texture
	 * and creates a uv coordinate buffer
	 * @param  {TextureBoxNode} node - The node to visit
	 */
	visitTextureBoxNode(node: TextureBoxNode) {

	}

	visitCameraNode(node: CameraNode) {
		let matrix = this.matrixStack[this.matrixStack.length - 1].mul(node.matrix);

		let cameraRasteriser = {
			eye: matrix.mulVec(new Vector(0, 0, 0, 1)),
			center: matrix.mulVec(new Vector(0, 0, -1, 1)),
			up: matrix.mulVec(new Vector(0, 1, 0, 0)),
			fovy: 60,
			aspect: 1000 / 600,
			near: 0.1,
			far: 100
		};
		this.setupCamera(cameraRasteriser);
	}

	visitPyramidNode(node: PyramidNode): void {
	}
}
