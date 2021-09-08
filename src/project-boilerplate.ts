import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './vector';
import {
	AABoxNode,
	GroupNode, PyramidNode, CameraNode, SphereNode,
	TextureBoxNode, LightNode
} from './nodes';
import {
	RasterVisitor,
	RasterSetupVisitor
} from './rastervisitor';
import Shader from './shader';
import {
	RotationNode, TranslationNode, JumperNode, ScalingNode
} from './animation-nodes';
import phongVertexShader from './phong-vertex-perspective-shader.glsl';
import phongFragmentShader from './phong-fragment-shader.glsl';
import textureVertexShader from './texture-vertex-perspective-shader.glsl';
import textureFragmentShader from './texture-fragment-shader.glsl';
import {Rotation, Scaling, SQT, Translation} from './transformation';
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
	controlledAnimationNodes: any[];
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
let freeFlightAnimationNodes: any[];
let controlledAnimationNodes: any[];
let otherAnimationNodes: any[];
let cameraNodes: any[];
let activeCamera: CameraNode;
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
		origin: new Vector(2, 0, 30, 1),
		width: canvasRaytracer.width,
		height: canvasRaytracer.height,
		alpha: Math.PI / 3
	}
	 */

	lightPositions = [
		new Vector(1, 1, 1, 1)
	];
	//TODO Änderungen an phongValues auch im project.html für die Slider ändern
	phongValues = {
		shininess: 16.0,
		kA: 0.2,
		kD: 0.7,
		kS: 0.7
	}
	freeFlightAnimationNodes = [];
	controlledAnimationNodes = [];
	otherAnimationNodes = [];
	cameraNodes = [];

	// construct scene graph
	//
	// AnimationNodes stehen in den Klammern
	/*
	       scenegraph

	       gn1			gn3	---------------+-------------------------+------------------+												gn7				gn9 (rotation)		camera1
	       gn2			gn4 (scaling)	gn5 (jumper, rotation)		gn10 (rotation		gn6 (rotation)------+-----------+				textureCube		light1
	       desktop		pyramid			sphere1			light2		light3				aabox				gn8			camera2
	       																									sphere2

	 */

	scenegraph = new GroupNode(new Translation(new Vector(0, 0, -10, 0)));

	const gn1 = new GroupNode(new Translation(new Vector(2, 0, 8, 0)));
	const gn2 = new GroupNode(new Scaling(new Vector(15, 15, 15, 1)));
	const desktop = new AABoxNode(new Vector(0, 0, 0, 0), false);
	scenegraph.add(gn1);
	gn1.add(gn2);
	gn2.add(desktop);

	const gn3 = new GroupNode(new Translation(new Vector(-3, 5, 3, 0)));
	const gn4 = new GroupNode(new Rotation(new Vector(1, 0, 0, 0), 1.5708));
	const pyramid = new PyramidNode(new Vector(1, 0.5, 1, 1), new Vector(.1, .4, .8, 1), new Vector(.3, .1, 1, 1));
	scenegraph.add(gn3);
	gn3.add(gn4);
	gn4.add(pyramid);
	controlledAnimationNodes.push(
		new ScalingNode(gn4, true));

	const gn5 = new GroupNode(new Translation(new Vector(4, -8, 2, 0)));
	const sphere1 = new SphereNode(new Vector(.5, .2, .2, 1));
	gn3.add(gn5);
	gn5.add(sphere1);
	controlledAnimationNodes.push(
		new JumperNode(gn5, 2, 20));

	const gn6 = new GroupNode(new Translation(new Vector(7, -3, 5, 0)));
	const aaBox = new AABoxNode(new Vector(0, 0, 0, 0), true);
	gn3.add(gn6);
	gn6.add(aaBox);
	otherAnimationNodes.push(
		new RotationNode(gn6, new Vector (0, 1, 0, 0), 20));

	const gn7 = new GroupNode(new Translation(new Vector(0, 0, 7, 0)));
	const textureCube = new TextureBoxNode('hci-logo.png');
	scenegraph.add(gn7);
	gn7.add(textureCube);
	otherAnimationNodes.push(
		new RotationNode(gn7, new Vector (1, 0, 0, 0), 20));

	const gn8 = new GroupNode(new Translation(new Vector(-2, 0, 0, 0)));
	const sphere2 = new SphereNode(new Vector(0, .7, .2, 1));
	gn6.add(gn8);
	gn8.add(sphere2);

	const gn9 = new GroupNode(new Translation(new Vector(-2, 0, 0, 0)));
	scenegraph.add(gn9);

	const gn10 = new GroupNode(new Translation(new Vector(-2, 0, 0, 0)));
	scenegraph.add(gn9);

	const lightNode1 = new GroupNode(new Translation(new Vector(-3, -3, 9, 0)));
	const light1 = new LightNode();
	gn9.add(lightNode1);
	lightNode1.add(light1);
	otherAnimationNodes.push(
		new RotationNode(gn9, new Vector (0, 0, 1, 0), 20));

	const lightNode2 = new GroupNode(new Translation(new Vector(1, -1, 2.5, 0)));
	const light2 = new LightNode();
	gn5.add(lightNode2);
	lightNode2.add(light2);
	otherAnimationNodes.push(
		new RotationNode(gn5, new Vector (0, 1, 0, 0), 20));

	const lightNode3 = new GroupNode(new Translation(new Vector(8, -1, 1, 0)));
	const light3 = new LightNode();
	gn3.add(gn10);
	gn10.add(lightNode3)
	lightNode3.add(light3);
	otherAnimationNodes.push(
		new RotationNode(gn10, new Vector (1, 0, 0, 0), 20));

	const cameraNode = new GroupNode(new Translation(new Vector(2, 0, 15, 0)));
	const camera1 = new CameraNode(true);
	scenegraph.add(cameraNode);
	cameraNode.add(camera1);

	const cameraNode2 = new GroupNode(new Translation(new Vector(0, 1.5, 2.5, 0)));
	const camera2 = new CameraNode( false);
	gn6.add(cameraNode2);
	cameraNode2.add(camera2);

	//alle cams in array sammeln und activeCamera speichern
	cameraNodes.push(camera1)
	cameraNodes.push(camera2);
	activeCamera = camera1;

	freeFlightAnimationNodes.push(
		//FahrAnimationNodes
		new TranslationNode(cameraNode, new Vector(-50, 0, 0, 0)),
		new TranslationNode(cameraNode, new Vector(50, 0, 0, 0)),
		new TranslationNode(cameraNode, new Vector(0, 0, -50, 0)),
		new TranslationNode(cameraNode, new Vector(0, 0, 50, 0)),
		new TranslationNode(cameraNode, new Vector(0, 50, 0, 0)),
		new TranslationNode(cameraNode, new Vector(0, -50, 0, 0)),
		new RotationNode(cameraNode, new Vector(0, 1, 0, 0), 20),
		new RotationNode(cameraNode, new Vector(0, 1, 0, 0), -20),
		new RotationNode(cameraNode, new Vector(1, 0, 0, 0), 20),
		new RotationNode(cameraNode, new Vector(1, 0, 0, 0), -20));

	//Fahranimationen und ControlledAnimationNodes defaultmäßig aus, nur bei keydown-events
	freeFlightAnimationNodes.forEach(el => el.turnOffActive());
	controlledAnimationNodes.forEach(el => el.turnOffActive());

	//Alle Animationen zusammenführen
	animationNodes = {
		freeFlightNodes: freeFlightAnimationNodes,
		controlledAnimationNodes: controlledAnimationNodes,
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
		for (let animationNode of animationNodes.controlledAnimationNodes) {
			animationNode.simulate(deltaT);
		}
		for (let animationNode of animationNodes.otherAnimationNodes) {
			animationNode.simulate(deltaT);
		}
	}

	let lastTimestamp = performance.now();

	function animate(timestamp: number) {
		simulate(timestamp - lastTimestamp);
		if (rendertype === "rasteriser") visitorRasteriser.render(scenegraph, null, null, phongValues, firstTraversalVisitorRaster);
		else if (rendertype === "raytracer") visitorRaytracer.render(scenegraph, null, null, phongValues, firstTraversalVisitorRay);

		lastTimestamp = timestamp;
		window.requestAnimationFrame(animate);
	}

	Promise.all(
		[phongShader.load(), textureShader.load()]
	).then(x =>
		window.requestAnimationFrame(animate)
	);

	//SLIDERS
	const kA = document.getElementById("kA") as HTMLInputElement;
	kA.onchange = function () {
		phongValues.kA = Number(kA.value);
	}
	const kD = document.getElementById("kD") as HTMLInputElement;
	kD.onchange = function () {
		phongValues.kD = Number(kD.value);
	}
	const kS = document.getElementById("kS") as HTMLInputElement;
	kS.onchange = function () {
		phongValues.kS = Number(kS.value);
	}
	const shininessElement = document.getElementById("shininess") as HTMLInputElement;
	shininessElement.onchange = function () {
		phongValues.shininess = Number(shininessElement.value);
	}

	//RENDERER-BUTTONS
	let rasterizer_b = document.getElementById("rasterizer_b");

	rasterizer_b.addEventListener('click', function (event) {
		if (rasterizer_b.className === "btn btn-info"){

		}else{
			rendertype = "rasteriser";

			canvasRasteriser.style.zIndex = "1";
			canvasRasteriser.style.visibility = "visible";

			canvasRaytracer.style.zIndex = "0";
			canvasRaytracer.style.visibility = "hidden";

			rasterizer_b.className = "btn btn-info";
			raytracer_b.className = "btn btn-outline-info";
		}
	});

	let raytracer_b = document.getElementById("raytracer_b");

	raytracer_b.addEventListener('click', function (event) {
		if (raytracer_b.className === "btn btn-info"){

		}else{
			rendertype = "raytracer";

			canvasRasteriser.style.zIndex = "0";
			canvasRasteriser.style.visibility = "hidden";

			canvasRaytracer.style.zIndex = "1";
			canvasRaytracer.style.visibility = "visible";

			rasterizer_b.className = "btn btn-outline-info";
			raytracer_b.className = "btn btn-info";
		}
	});

	//EVENT-LISTENERS
	window.addEventListener('keydown', function (event) {
		switch (event.key) {
			case "c":
				activeCamera.setActiveStatus(false);
				if (activeCamera === camera1) {
					camera2.setActiveStatus(true);
					activeCamera = camera2;
				} else {
					camera1.setActiveStatus(true);
					activeCamera = camera1;
				}
				break;
			//switch rendertype
			case "k":
				if (rendertype === "rasteriser") {
					rendertype = "raytracer";

					canvasRasteriser.style.zIndex = "0";
					canvasRasteriser.style.visibility = "hidden";

					canvasRaytracer.style.zIndex = "1";
					canvasRaytracer.style.visibility = "visible";
				} else {
					rendertype = "rasteriser";

					canvasRasteriser.style.zIndex = "1";
					canvasRasteriser.style.visibility = "visible";

					canvasRaytracer.style.zIndex = "0";
					canvasRaytracer.style.visibility = "hidden";
				}
				break;
			//controlledAnimationNode[0]
			case "u":
				animationNodes.controlledAnimationNodes[0].turnOnActive();
				break;
			//JumperNode
			case "i":
				animationNodes.controlledAnimationNodes[1].turnOnActive();
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
			case "e":
				animationNodes.freeFlightNodes[4].turnOnActive();
				break;
			//nach unten fahren
			case "q":
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
			//controlledAnimationNode[0]
			case "u":
				animationNodes.controlledAnimationNodes[0].turnOffActive();
				break;
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
			case "e":
				animationNodes.freeFlightNodes[4].turnOffActive();
				break;
			//nach unten fahren
			case "q":
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

