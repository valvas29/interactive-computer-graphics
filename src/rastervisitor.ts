import RasterSphere from './raster-sphere';
import RasterBoxOutside from './raster-boxOutside';
import RasterPyramid from './raster-pyramid';
import RasterTextureBox from './raster-texture-box';
import Vector from './vector';
import Matrix from './matrix';
import Visitor from './visitor';
import {
	AABoxNode,
	GroupNode,
	Node,
	SphereNode,
	TextureBoxNode,
	PyramidNode,
	CameraNode,
	LightNode,
	CustomShapeNode
} from './nodes';
import Shader from './shader';
import {CameraRasteriser, PhongValues} from "./project-boilerplate";
import {FirstTraversalVisitorRaster} from "./firstTraversalVisitorRaster";
import RasterBoxInside from "./raster-boxInside";
import {CustomShape} from "./custom-shape";

interface Renderable {
	render(shader: Shader): void;
}

/**
 * Class representing a Visitor that uses Rasterisation
 * to render a Scenegraph
 */
export class RasterVisitor implements Visitor {
	matrixStack: Matrix[];
	inverseStack: Matrix[];

	/**
	 * Creates a new RasterVisitor
	 * @param gl The 3D context to render to
	 * @param shader The default shader to use
	 * @param textureshader The texture shader to use
	 * @param renderables
	 */
	constructor(private gl: WebGL2RenderingContext, private shader: Shader, private textureshader: Shader, private renderables: WeakMap<Node, Renderable>) {
	}

	/**
	 * Renders the Scenegraph
	 * @param rootNode The root node of the Scenegraph
	 * @param camera The camera used
	 * @param lightPositions The light positions
	 * @param phongValues phong-coefficients
	 * @param firstTraversalVisitor
	 */
	render(
		rootNode: Node,
		camera: CameraRasteriser | null,
		lightPositions: Array<Vector> | null,
		phongValues: PhongValues,
		firstTraversalVisitor: FirstTraversalVisitorRaster
	) {
		// clear
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		if (phongValues) {
			this.passPhongValues(phongValues);
		}

		//MatrixStacks hier immer neu leeren, damit firefox nicht crasht
		this.matrixStack = [];
		this.inverseStack = [];

		this.matrixStack.push(Matrix.identity());
		this.inverseStack.push(Matrix.identity());

		if (firstTraversalVisitor) {
			//first traversal
			firstTraversalVisitor.setup(rootNode);
			this.lookat = firstTraversalVisitor.lookat;
			this.perspective = firstTraversalVisitor.perspective;
			this.passCameraPosition(firstTraversalVisitor.eye);
			this.passLightPositions(firstTraversalVisitor.lightPositions);
		} else {
			this.setupCamera(camera);
		}

		// traverse and render
		rootNode.accept(this);
	}

	/**
	 * The view matrix to transform vertices from
	 * the world coordinate system to the
	 * view coordinate system
	 */
	private lookat: Matrix;

	/**
	 * The perspective matrix to transform vertices from
	 * the view coordinate system to the
	 * normalized device coordinate system
	 */
	private perspective: Matrix;

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

	passPhongValues(phongValues: any) {
		const shader = this.shader;
		shader.use();

		shader.getUniformFloat("shininess").set(phongValues.shininess);
		shader.getUniformFloat("kA").set(phongValues.kA);
		shader.getUniformFloat("kD").set(phongValues.kD);
		shader.getUniformFloat("kS").set(phongValues.kS);


		const textureShader = this.textureshader;
		textureShader.use();

		textureShader.getUniformFloat("shininess").set(phongValues.shininess);
		textureShader.getUniformFloat("kA").set(phongValues.kA);
		textureShader.getUniformFloat("kD").set(phongValues.kD);
		textureShader.getUniformFloat("kS").set(phongValues.kS);
	}

	private passCameraPosition(eye: Vector) {
		const shader = this.shader;
		shader.use();
		shader.getUniformVec3("cameraPosition").set(eye);

		const textureShader = this.textureshader;
		textureShader.use();
		textureShader.getUniformVec3("cameraPosition").set(eye);
	}

	private passLightPositions(lightPositions: Array<Vector>) {
		const shader = this.shader;
		shader.use();
		shader.getUniformVec3("lightPosition1").set(lightPositions[0]); // TODO only this is rendered
		shader.getUniformVec3("lightPosition2").set(lightPositions[1]);
		shader.getUniformVec3("lightPosition3").set(lightPositions[2]);

		/*
		for (let i = 0; i < lightPositions.length; i++) {
			shader.getUniformVec3("lightPosition" + (i + 1)).set(lightPositions[i]);
		}

		 */

		const textureShader = this.textureshader;
		textureShader.use();
		for (let i = 0; i < lightPositions.length; i++) {
			textureShader.getUniformVec3("lightPosition" + (i + 1)).set(lightPositions[i]);
		}
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

		//Matrix-Stack soll nach jedem Aufruf von visitGroupNode wieder so wie davor aussehen
		this.matrixStack.pop();
		this.inverseStack.pop();
	}

	/**
	 * Visits a sphere node
	 * @param node The node to visit
	 */
	visitSphereNode(node: SphereNode) {
		const shader = this.shader;
		shader.use();

		let toWorld = this.matrixStack[this.matrixStack.length - 1];
		let fromWorld = this.inverseStack[this.inverseStack.length - 1];

		shader.getUniformMatrix("M").set(toWorld);

		const V = shader.getUniformMatrix("V");
		if (V && this.lookat) {
			V.set(this.lookat);
		}
		const P = shader.getUniformMatrix("P");
		if (P && this.perspective) {
			P.set(this.perspective);
		}

		let normal = fromWorld.transpose();
		normal.setVal(0, 3, 0);
		normal.setVal(1, 3, 0);
		normal.setVal(2, 3, 0);
		normal.setVal(3, 0, 0);
		normal.setVal(3, 1, 0);
		normal.setVal(3, 2, 0);
		normal.setVal(3, 3, 1);

		const N = shader.getUniformMatrix("N");
		if (N) {
			N.set(normal);
		}

		this.renderables.get(node).render(shader);
	}

	/**
	 * Visits an axis aligned box node
	 * @param  {AABoxNode} node - The node to visit
	 * @param outside
	 */
	visitAABoxNode(node: AABoxNode, outside: boolean): void {
		this.shader.use();
		let shader = this.shader;

		let toWorld = this.matrixStack[this.matrixStack.length - 1];
		let fromWorld = this.inverseStack[this.inverseStack.length - 1];

		shader.getUniformMatrix("M").set(toWorld);
		let V = shader.getUniformMatrix("V");
		if (V && this.lookat) {
			V.set(this.lookat);
		}
		let P = shader.getUniformMatrix("P");
		if (P && this.perspective) {
			P.set(this.perspective);
		}

		let normal = fromWorld.transpose();
		normal.setVal(0, 3, 0);
		normal.setVal(1, 3, 0);
		normal.setVal(2, 3, 0);
		normal.setVal(3, 0, 0);
		normal.setVal(3, 1, 0);
		normal.setVal(3, 2, 0);
		normal.setVal(3, 3, 1);

		const N = shader.getUniformMatrix("N");
		if (N) {
			N.set(normal);
		}

		this.renderables.get(node).render(shader);
	}

	/**
	 * Visits a textured box node
	 * @param  {TextureBoxNode} node - The node to visit
	 */
	visitTextureBoxNode(node: TextureBoxNode) {
		this.textureshader.use();
		let shader = this.textureshader;

		let toWorld = this.matrixStack[this.matrixStack.length - 1];
		let fromWorld = this.inverseStack[this.inverseStack.length - 1];

		shader.getUniformMatrix("M").set(toWorld);
		let P = shader.getUniformMatrix("P");
		if (P && this.perspective) {
			P.set(this.perspective);
		}
		shader.getUniformMatrix("V").set(this.lookat);

		let normal = fromWorld.transpose();
		normal.setVal(0, 3, 0);
		normal.setVal(1, 3, 0);
		normal.setVal(2, 3, 0);
		normal.setVal(3, 0, 0);
		normal.setVal(3, 1, 0);
		normal.setVal(3, 2, 0);
		normal.setVal(3, 3, 1);

		const N = shader.getUniformMatrix("N");
		if (N) {
			N.set(normal);
		}

		this.renderables.get(node).render(shader);
	}

	visitPyramidNode(node: PyramidNode) {
		this.shader.use();
		let shader = this.shader;

		let toWorld = this.matrixStack[this.matrixStack.length - 1];
		let fromWorld = this.inverseStack[this.inverseStack.length - 1];

		shader.getUniformMatrix("M").set(toWorld);
		let V = shader.getUniformMatrix("V");
		if (V && this.lookat) {
			V.set(this.lookat);
		}
		let P = shader.getUniformMatrix("P");
		if (P && this.perspective) {
			P.set(this.perspective);
		}

		let normal = fromWorld.transpose();
		normal.setVal(0, 3, 0);
		normal.setVal(1, 3, 0);
		normal.setVal(2, 3, 0);
		normal.setVal(3, 0, 0);
		normal.setVal(3, 1, 0);
		normal.setVal(3, 2, 0);
		normal.setVal(3, 3, 1);

		const N = shader.getUniformMatrix("N");
		if (N) {
			N.set(normal);
		}

		this.renderables.get(node).render(shader);
	}

	visitCustomShapeNode(node: CustomShapeNode): void {
		this.shader.use();
		let shader = this.shader;

		let toWorld = this.matrixStack[this.matrixStack.length - 1];
		let fromWorld = this.inverseStack[this.inverseStack.length - 1];

		shader.getUniformMatrix("M").set(toWorld);
		let V = shader.getUniformMatrix("V");
		if (V && this.lookat) {
			V.set(this.lookat);
		}
		let P = shader.getUniformMatrix("P");
		if (P && this.perspective) {
			P.set(this.perspective);
		}

		let normal = fromWorld.transpose();
		normal.setVal(0, 3, 0);
		normal.setVal(1, 3, 0);
		normal.setVal(2, 3, 0);
		normal.setVal(3, 0, 0);
		normal.setVal(3, 1, 0);
		normal.setVal(3, 2, 0);
		normal.setVal(3, 3, 1);

		const N = shader.getUniformMatrix("N");
		if (N) {
			N.set(normal);
		}

		this.renderables.get(node).render(shader);
	}

	visitCameraNode(node: CameraNode): void {

	}

	visitLightNode(node: LightNode): void {

	}
}

/**
 * Class representing a Visitor that sets up buffers
 * for use by the RasterVisitor
 * */
export class RasterSetupVisitor {
	/**
	 * The created render objects
	 */
	public objects: WeakMap<Node, Renderable>

	/**
	 * Creates a new RasterSetupVisitor
	 * @param gl The 3D context in which to create buffers
	 */
	constructor(private gl: WebGL2RenderingContext) {
		this.objects = new WeakMap();
	}

	/**
	 * Sets up all needed buffers
	 * @param rootNode The root node of the Scenegraph
	 */
	setup(rootNode: Node) {
		// Clear to white, fully opaque
		this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
		// Clear everything
		this.gl.clearDepth(1.0);
		// Enable depth testing
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);

		this.gl.disable(this.gl.CULL_FACE);

		rootNode.accept(this);
	}

	/**
	 * Visits a group node
	 * @param node The node to visit
	 */
	visitGroupNode(node: GroupNode) {
		for (let child of node.childNodes) {
			child.accept(this);
		}
	}

	/**
	 * Visits a sphere node
	 * @param node - The node to visit
	 */
	visitSphereNode(node: SphereNode) {
		this.objects.set(
			node,
			new RasterSphere(this.gl, new Vector(0, 0, 0, 1), 1, node.color)
		);
	}

	/**
	 * Visits an axis aligned box node
	 * @param  {AABoxNode} node - The node to visit
	 * @param outside if not outside then normals of the box are inversed for lighting in desktop
	 */
	visitAABoxNode(node: AABoxNode, outside: boolean) {
		if (outside) {
			this.objects.set(
				node,
				new RasterBoxOutside(
					this.gl,
					new Vector(-0.5, -0.5, -0.5, 1),
					new Vector(0.5, 0.5, 0.5, 1)
				)
			);
		} else {
			this.objects.set(
				node,
				new RasterBoxInside(
					this.gl,
					new Vector(-0.5, -0.5, -0.5, 1),
					new Vector(0.5, 0.5, 0.5, 1)
				)
			);
		}
	}

	/**
	 * Visits a textured box node. Loads the texture
	 * and creates a uv coordinate buffer
	 * @param  {TextureBoxNode} node - The node to visit
	 */
	visitTextureBoxNode(node: TextureBoxNode) {
		this.objects.set(
			node,
			new RasterTextureBox(
				this.gl,
				new Vector(-0.5, -0.5, -0.5, 1),
				new Vector(0.5, 0.5, 0.5, 1),
				node.texture,
				node.normalMap
			)
		);
	}

	visitPyramidNode(node: PyramidNode) {
		this.objects.set(
			node,
			new RasterPyramid(
				this.gl,
				new Vector(0, 0, 0, 1),
				node.area,
				node.color1,
				node.color2
			)
		);
	}

	visitCustomShapeNode(node: CustomShapeNode) {
		this.objects.set(
			node,
			new CustomShape(
				this.gl,
				node.vertices,
				node.normals,
				node.indices
			)
		)
	}

	visitCameraNode(node: CameraNode) {

	}

	visitLightNode(node: LightNode) {

	}
}
