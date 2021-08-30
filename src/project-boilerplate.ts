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
	RotationNode, TranslationNode, AnimationNode
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

let scenegraph: GroupNode;
let animationNodes: AnimationNodes; //wenn Array vom Typ AnimationNode, kann die simulate-Methode nicht gefunden werden
let lightPositions: Array<Vector>;
let phongValues: PhongValues;
let rendertype = "rasteriser";

window.addEventListener('load', () => {
	canvasRasteriser = document.getElementById("rasteriser") as HTMLCanvasElement;
	canvasRaytracer = document.getElementById("raytracer") as HTMLCanvasElement;
	gl = canvasRasteriser.getContext("webgl2");
	ctx2d = canvasRaytracer.getContext("2d");

	phongShader = new Shader(gl,
		phongVertexShader,
		phongFragmentShader
	);
	textureShader = new Shader(gl,
		textureVertexShader,
		textureFragmentShader
	);

	//Kameras werden nicht benötigt, sind im Szenengraphen
	/*
	cameraRasteriser = {
		eye: new Vector(0, 0, -30, 1),
		center: new Vector(0, 0, 0, 1),
		up: new Vector(0, 1, 0, 0),
		fovy: 60,
		aspect: canvasRasteriser.width / canvasRasteriser.height,
		near: 0.1,
		far: 100
	};
	cameraRaytracer = {
		origin: new Vector(0, 0, 5, 1),
		width: canvasRaytracer.width,
		height: canvasRaytracer.height,
		alpha: Math.PI / 3
	}
	 */

	lightPositions = [
		new Vector(1, 1, 1, 1)
	];
	phongValues = {
		shininess: 16.0,
		kA: 0.3,
		kD: 0.9,
		kS: 1.0
	}
	const freeFlightNodes = [];
	const otherAnimationNodes = [];

	// construct scene graph
	// für Quaterions const sg = new GroupNode(new SQT(new Vector(1, 1, 1, 0), { angle: 0.6, axis: new Vector(0, 1, 0, 0) }, new Vector(0, 0, 0, 0)));

	//       T(SG)
	//         |
	//		 R(gn1)
	//		   |
	//    +----+-----+
	//  S(gn2)     T(gn3)
	//    |          |
	//	 Box	  +--+--------+---------+
	//          T(gn4)     T(gn5)	  T(gn6)
	//            |
	//            S8
	//          TexBox	   Sphere	 Pyramid

	scenegraph = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));

	const gn1 = new GroupNode(new Translation(new Vector(2, 0, 8, 0)));
	const gn2 = new GroupNode(new Scaling(new Vector(10, 10, 10, 10)));
	const desktop = new AABoxNode(new Vector(0, 0, 0, 1), false);
	scenegraph.add(gn1);
	gn1.add(gn2);
	gn2.add(desktop);

	const gn3 = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
	scenegraph.add(gn3);

	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			const gn1 = new GroupNode(new Translation(new Vector(j-3, i-4, 3, 0)));
			const gn2 = new GroupNode(new Rotation(new Vector(1, 0, 0, 0), 1.5708));
			const pyramidNode = new PyramidNode(new Vector(1, 0.5, 1, 1), new Vector(.1, .4, .8, 1), new Vector(.3, .1, 1, 1));
			gn3.add(gn1);
			gn1.add(gn2);
			gn2.add(pyramidNode);
			let interpolation = i + j + 1;
			otherAnimationNodes.push(
				new TranslationNode(gn1, new Vector(-interpolation, -interpolation, 0, 0)),
				new RotationNode(gn1, new Vector(0, 0, 1, 0),interpolation * 2));
		}
	}

	const textureCube = new TextureBoxNode('hci-logo.png');
	const sphere = new SphereNode(new Vector(.4, .1, .1, 1));
	const sphere2 = new SphereNode(new Vector(.1, .1, .4, 1));


	const cameraNode = new GroupNode(new Translation(new Vector(2, 0, 12, 0)));
	const camera = new CameraNode(Matrix.identity());
	cameraNode.add(camera);
	scenegraph.add(cameraNode);


	freeFlightNodes.push(
		//FahrAnimationNodes
		new TranslationNode(cameraNode, new Vector(-30, 0, 0, 0)),
		new TranslationNode(cameraNode, new Vector(30, 0, 0, 0)),
		new TranslationNode(cameraNode, new Vector(0, 0, -30, 0)),
		new TranslationNode(cameraNode, new Vector(0, 0, 30, 0)),
		new TranslationNode(cameraNode, new Vector(0, 30, 0, 0)),
		new TranslationNode(cameraNode, new Vector(0, -30, 0, 0)),
		new RotationNode(cameraNode, new Vector(0, 1, 0, 0), 20),
		new RotationNode(cameraNode, new Vector(0, 1, 0, 0), -20),
		new RotationNode(cameraNode, new Vector(1, 0, 0, 0), 20),
		new RotationNode(cameraNode, new Vector(1, 0, 0, 0), -20));

	//Fahranimationen defaultmäßig aus, nur bei keydown-events
	freeFlightNodes.forEach(el => el.turnOffActive());

	//Alle Animationen zusammenführen
	animationNodes = {
		freeFlightNodes: freeFlightNodes,
		otherAnimationNodes: otherAnimationNodes
	}

	// setup for rendering
	setupVisitor = new RasterSetupVisitor(gl);
	setupVisitor.setup(scenegraph);
	firstTraversalVisitorRaster = new FirstTraversalVisitorRaster();
	firstTraversalVisitorRay = new FirstTraversalVisitorRay();
	visitorRasteriser = new RasterVisitor(gl, phongShader, textureShader, setupVisitor.objects);
	visitorRaytracer = new RayVisitor(ctx2d, canvasRaytracer.width, canvasRaytracer.height);

	function simulate(deltaT: number) {
		for (let animationNode of animationNodes.freeFlightNodes) {
			animationNode.simulate(deltaT);
		}
		for (let animationNode of animationNodes.otherAnimationNodes) {
			animationNode.simulate(deltaT);
		}
	}

	let lastTimestamp = performance.now();

	function animate(timestamp: number) {
		simulate(timestamp - lastTimestamp);
		if (rendertype === "rasteriser") visitorRasteriser.render(scenegraph, null, lightPositions, phongValues, firstTraversalVisitorRaster);
		else if (rendertype === "raytracer") visitorRaytracer.render(scenegraph, null, lightPositions, phongValues, firstTraversalVisitorRay);
		lastTimestamp = timestamp;
		window.requestAnimationFrame(animate);
	}
	Promise.all(
		[phongShader.load(), textureShader.load()]
	).then(x =>
		window.requestAnimationFrame(animate)
	);

	window.addEventListener('keydown', function (event) {
		switch (event.key) {
			//switch rendertype
			case "k":
				if (rendertype === "rasteriser") {
					rendertype = "raytracer";

					canvasRasteriser.style.zIndex = "0";
					canvasRasteriser.style.visibility = "hidden";

					canvasRaytracer.style.zIndex = "1";
					canvasRaytracer.style.visibility = "visible";
				}
				else {
					rendertype = "rasteriser";

					canvasRasteriser.style.zIndex = "1";
					canvasRasteriser.style.visibility = "visible";

					canvasRaytracer.style.zIndex = "0";
					canvasRaytracer.style.visibility = "hidden";
				}
				break;
			//phongValues random ändern
			case "p":
				phongValues.shininess = Math.random() * 16;
				phongValues.kA = Math.random() * 2;
				phongValues.kD = Math.random() * 2;
				phongValues.kS = Math.random() * 2;
				break;
			//nach links fahren
			case "a":
				animationNodes.freeFlightNodes[0].turnOnActive();
				break;
			//nach rechts fahren
			case "d":
				animationNodes.freeFlightNodes[1].turnOnActive();
				break;
			//nach vorne fahren
			case "w":
				animationNodes.freeFlightNodes[2].turnOnActive();
				break;
			//nach hinten fahren
			case "s":
				animationNodes.freeFlightNodes[3].turnOnActive();
				break;
			//nach oben fahren
			case "q":
				animationNodes.freeFlightNodes[4].turnOnActive();
				break;
			//nach unten fahren
			case "e":
				animationNodes.freeFlightNodes[5].turnOnActive();
				break;
			//nach links drehen
			case "ArrowLeft":
				animationNodes.freeFlightNodes[6].turnOnActive();
				break;
			//nach rechts drehen
			case "ArrowRight":
				animationNodes.freeFlightNodes[7].turnOnActive();
				break;
			//nach oben drehen
			case "ArrowUp":
				animationNodes.freeFlightNodes[8].turnOnActive();
				break;
			//nach unten drehen
			case "ArrowDown":
				animationNodes.freeFlightNodes[9].turnOnActive();
				break;
		}
	});

	window.addEventListener('keyup', function (event) {
		switch (event.key) {
			//nach links fahren
			case "a":
				animationNodes.freeFlightNodes[0].turnOffActive();
				break;
			//nach rechts fahren
			case "d":
				animationNodes.freeFlightNodes[1].turnOffActive();
				break;
			//nach vorne fahren
			case "w":
				animationNodes.freeFlightNodes[2].turnOffActive();
				break;
			//nach hinten fahren
			case "s":
				animationNodes.freeFlightNodes[3].turnOffActive();
				break;
			//nach oben fahren
			case "q":
				animationNodes.freeFlightNodes[4].turnOffActive();
				break;
			//nach unten fahren
			case "e":
				animationNodes.freeFlightNodes[5].turnOffActive();
				break;
			//nach links drehen
			case "ArrowLeft":
				animationNodes.freeFlightNodes[6].turnOffActive();
				break;
			//nach rechts drehen
			case "ArrowRight":
				animationNodes.freeFlightNodes[7].turnOffActive();
				break;
			//nach oben drehen
			case "ArrowUp":
				animationNodes.freeFlightNodes[8].turnOffActive();
				break;
			//nach unten drehen
			case "ArrowDown":
				animationNodes.freeFlightNodes[9].turnOffActive();
				break;
		}
	});
});