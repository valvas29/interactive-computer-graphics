import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './vector';
import {
	AABoxNode,
	GroupNode, PyramidNode, CameraNode, SphereNode,
	TextureBoxNode
} from './nodes';
import {
	RasterVisitor,
	RasterSetupVisitor
} from './rastervisitor';
import Shader from './shader';
import {
	SlerpNode,
	RotationNode, TranslationNode, AnimationNode, JumperNode, ScalingNode, CycleNode
} from './animation-nodes';
import phongVertexShader from './phong-vertex-perspective-shader.glsl';
import phongFragmentShader from './phong-fragment-shader.glsl';
import textureVertexShader from './texture-vertex-perspective-shader.glsl';
import textureFragmentShader from './texture-fragment-shader.glsl';
import {Rotation, Scaling, SQT, Translation} from './transformation';
import Quaternion from './quaternion';
import RayVisitor from "./rayvisitor";
import Matrix from "./matrix";
import phong from "./phong";
import {FirstTraversalVisitorRaster} from "./firstTraversalVisitorRaster";
import {FirstTraversalVisitorRay} from "./firstTraversalVisitorRay";
import AABox from "./aabox";

export interface CameraRasteriser {
	eye: Vector,
	center: Vector,
	up: Vector,
	fovy: number,
	aspect: number,
	near: number,
	far: number
}

export interface CameraRaytracer {
	origin: Vector,
	width: number,
	height: number,
	alpha: number
}

export interface PhongValues {
	shininess: number,
	kA: number,
	kD: number,
	kS: number
}

interface AnimationNodes {
	freeFlightNodes: any[],
	otherAnimationNodes: any[]
}

//Eigener Canvas für Rendertypen, da ein Canvas nur einen Context unterstützt
let canvasRasteriser: HTMLCanvasElement;
let canvasRaytracer: HTMLCanvasElement;
let gl: WebGL2RenderingContext;
let ctx2d: CanvasRenderingContext2D;
let phongShader: Shader;
let textureShader: Shader;
let cameraRasteriser: CameraRasteriser;
let cameraRaytracer: CameraRaytracer;
let setupVisitor: RasterSetupVisitor;
let visitorRasteriser: RasterVisitor;
let visitorRaytracer: RayVisitor;
let firstTraversalVisitorRaster: FirstTraversalVisitorRaster;
let firstTraversalVisitorRay: FirstTraversalVisitorRay;

let sg: GroupNode;
let animationNodes: AnimationNodes; //wenn Array vom Typ AnimationNode, kann die simulate-Methode nicht gefunden werden
let freeFlightAnimationNodes: any[];
let otherAnimationNodes: any[];
let cameraNodes: any[];
let activeCamera: CameraNode;
let phongValues: PhongValues;
let rendertype = "raytracer";

window.addEventListener('load', () => {

	canvasRaytracer = document.getElementById("raytracer") as HTMLCanvasElement;

	ctx2d = canvasRaytracer.getContext("2d");

	cameraRaytracer = {
		origin: new Vector(0, 0, 20, 1),
		width: canvasRaytracer.width,
		height: canvasRaytracer.height,
		alpha: Math.PI / 3
	}

	phongValues = {
		shininess: 16.0,
		kA: 0.3,
		kD: 0.9,
		kS: 1.0
	}

	otherAnimationNodes = [];

	// construct scene graph
	// für Quaterions const sg = new GroupNode(new SQT(new Vector(1, 1, 1, 0), { angle: 0.6, axis: new Vector(0, 1, 0, 0) }, new Vector(0, 0, 0, 0)));
	/*
	       T(SG)
	         |
	         +--------+-----+
	         |
		   T(gn1)
			 |
	       S(gn2)
	         |
	       Desktop

	 */


	sg = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));

	const gn1 = new GroupNode(new Translation(new Vector(2, 0, 8, 0)));
	const gn2 = new GroupNode(new Scaling(new Vector(10, 10, 10, 1)));
	const desktop = new AABoxNode(new Vector(0, 0, 0, 0), false);
	sg.add(gn1);
	gn1.add(gn2);
	gn2.add(desktop);

	const gn3 = new GroupNode(new Translation(new Vector(-3, 5, 3, 0)));
	const gn4 = new GroupNode(new Rotation(new Vector(1, 0, 0, 0), 1.5708));
	const pyramid = new PyramidNode(new Vector(1, 0.5, 1, 1), new Vector(.1, .4, .8, 1), new Vector(.3, .1, 1, 1));
	sg.add(gn3);
	gn3.add(gn4);
	gn4.add(pyramid);
	otherAnimationNodes.push(
		new ScalingNode(gn4, true));

	const gn5 = new GroupNode(new Translation(new Vector(4, -3, 2, 0)));
	const sphere = new SphereNode(new Vector(.5, .2, .2, 1));
	gn3.add(gn5);
	gn5.add(sphere);
	otherAnimationNodes.push(
	new RotationNode(gn5, new Vector (0, 1, 0, 0), 20));

	const gn6 = new GroupNode(new Translation(new Vector(7, -3, 5, 0)));
	const aaBox = new PyramidNode(new Vector(1, 0.5, 1, 1), new Vector(.1, .4, .8, 1), new Vector(.3, .1, 1, 1));//new AABoxNode(new Vector(0, 0, 0, 0), true);
	gn3.add(gn6);
	gn6.add(aaBox);
	otherAnimationNodes.push(
		new CycleNode(gn6, new Vector(10, 0, 0, 0), new Vector (0, 1, 0, 0), 10));

	const gn7 = new GroupNode(new Translation(new Vector(0, 0, 7, 0)));
	const textureCube = new TextureBoxNode('hci-logo.png');
	sg.add(gn7);
	gn7.add(textureCube);
	otherAnimationNodes.push(
		new RotationNode(gn7, new Vector (0, 1, 0, 0), 20));

	const barrel = new SphereNode(new Vector(0.3, 0.3, 0.3, 1));
	const crosshair1 = new AABoxNode(new Vector(0, 0, 0, 1), true);
	const sphere2 = new SphereNode(new Vector(.1, .1, .4, 1));

	const cameraNode = new GroupNode(new Translation(new Vector(2, 0, 30, 0)));
	const camera1 = new CameraNode(true);
	sg.add(cameraNode);
	cameraNode.add(camera1);

	const cameraNode2 = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
	const camera2 = new CameraNode( false);
	gn6.add(cameraNode2);
	cameraNode2.add(camera2);


	/*

   const sg = new GroupNode(new Translation(new Vector(0, 0, -5, 0)));
   const gnRotation = new Rotation(new Vector(0, 1, 0, 0), 0)
   const gn = new GroupNode(gnRotation);
   sg.add(gn);
   const gn1 = new GroupNode(new Translation(new Vector(1.2, .5, 0, 0)));
   gn.add(gn1);
   gn1.add(new SphereNode(new Vector(.4, 0, 0, 1)));
   const gn2 = new GroupNode(new Translation(new Vector(-0.8, 1, 1, 0)));
   gn.add(gn2);
   const gn3 = new GroupNode(new Scaling(new Vector(0.4, 0.4, 0.4, 0)));
   gn2.add(gn3);
   otherAnimationNodes.push(new RotationNode(gn1, new Vector(0, 1, 0, 0), 20));
   gn3.add(new SphereNode(new Vector(0, 0, .3, 1)));

	 */


	const lightPositions = [
		new Vector(10, 10, 10, 1)
	];

	visitorRaytracer = new RayVisitor(ctx2d, canvasRaytracer.width, canvasRaytracer.height);

	function simulate(deltaT: number) {
		for (let animationNode of otherAnimationNodes) {
			animationNode.simulate(deltaT);
		}
	}

	let lastTimestamp = performance.now();

	function animate(timestamp: number) {
		simulate(timestamp - lastTimestamp);
		visitorRaytracer.render(sg, cameraRaytracer, lightPositions, phongValues, null);
		lastTimestamp = timestamp;
		window.requestAnimationFrame(animate);
	}

	window.requestAnimationFrame(animate);
});

