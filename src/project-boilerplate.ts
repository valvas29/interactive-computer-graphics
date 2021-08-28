import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './vector';

//Raytracer-Imports
import Sphere from './sphere';
import Ray from './ray';
import Intersection from "./intersection";

import {
	AABoxNode,
	GroupNode,
	SphereNode,
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

//Eigener Canvas für Rendertypen, da ein Canvas nur einen Context unterstützt
let canvasRasteriser: HTMLCanvasElement;
let canvasRaytracer: HTMLCanvasElement;
let gl: WebGL2RenderingContext;
let ctx2d: CanvasRenderingContext2D;

let scenegraph: GroupNode;
let animationNodes: Array<any>; //wenn Array vom Typ AnimationNode, kann die simulate-Methode nicht gefunden werden

let rendertype = "rasteriser";

function rasterise() {
	// setup for rendering
	const setupVisitor = new RasterSetupVisitor(gl);
	setupVisitor.setup(scenegraph);

	let camera = {
		eye: new Vector(0, 0, 2, 1),
		center: new Vector(0, 0, 0, 1),
		up: new Vector(0, 1, 0, 0),
		fovy: 60,
		aspect: canvasRasteriser.width / canvasRasteriser.height,
		near: 0.1,
		far: 100
	};

	const phongShader = new Shader(gl,
		phongVertexShader,
		phongFragmentShader
	);
	const textureShader = new Shader(gl,
		textureVertexShader,
		textureFragmentShader
	);
	const visitor = new RasterVisitor(gl, phongShader, textureShader, setupVisitor.objects);

	Promise.all(
		[phongShader.load(), textureShader.load()]
	).then(x =>
		window.requestAnimationFrame(animate)
	);

	let lastTimestamp = performance.now();
	function animate(timestamp: number) {
		if (rendertype === "rasteriser") {
			simulate(timestamp - lastTimestamp);
			visitor.render(scenegraph, camera, []);
			lastTimestamp = timestamp;
			window.requestAnimationFrame(animate);
		}
	}

	function simulate(deltaT: number) {
		for (let animationNode of animationNodes) {
			animationNode.simulate(deltaT);
		}
	}
}

function raytrace() {
	rendertype = "raytracer";

	const lightPositions = [
		new Vector(1, 1, 1, 1)
	];
	const camera = {
		origin: new Vector(0, 0, 0, 1),
		width: canvasRasteriser.width,
		height: canvasRasteriser.height,
		alpha: Math.PI / 3
	}

	const visitor = new RayVisitor(ctx2d, canvasRasteriser.width, canvasRasteriser.height);

	window.requestAnimationFrame(animate);
	let lastTimestamp = performance.now();

	function animate(timestamp: number) {
		simulate(timestamp - lastTimestamp);
		visitor.render(scenegraph, camera, lightPositions);
		lastTimestamp = timestamp;
		window.requestAnimationFrame(animate);
	}

	function simulate(deltaT: number) {
		for (let animationNode of animationNodes) {
			animationNode.simulate(deltaT);
		}
	}
}

window.addEventListener('load', () => {
	canvasRasteriser = document.getElementById("rasteriser") as HTMLCanvasElement;
	canvasRaytracer = document.getElementById("raytracer") as HTMLCanvasElement;
	gl = canvasRasteriser.getContext("webgl2");
	ctx2d = canvasRaytracer.getContext("2d");
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

	const sg = new GroupNode(new Translation(new Vector(0, 0, -1.5, 0)));
	const gn1 = new GroupNode(new Rotation(new Vector(0, 1, 0, 0), 100));
	sg.add(gn1);
	const gn2 = new GroupNode(new Scaling(new Vector(2, 2, 2, 0)));
	gn1.add(gn2);
	const desktop = new AABoxNode(new Vector(0, 0, 0, 1));
	gn2.add(desktop);
	const gn3 = new GroupNode(new Translation(new Vector(-1, 0, 1, 0)));
	gn1.add(gn3);
	const gn4 = new GroupNode(new Translation(new Vector(0.3, 0.8, 0.1, 0)));
	const gn8 = new GroupNode(new Scaling(new Vector(0.2, 0.2, 0.2, 0)));
	const textureCube = new TextureBoxNode('hci-logo.png');
	gn3.add(gn4);
	gn4.add(gn8);
	gn8.add(textureCube);
	const gn5 = new GroupNode(new Translation(new Vector(0.8, -1.2, -0.5, 0)));
	const sphere = new SphereNode(new Vector(.1, .4, .1, 1));
	gn3.add(gn5);
	gn5.add(sphere);
	const gn6 = new GroupNode(new Translation(new Vector(0.1, 0.2, 1, 1)));
	const sphere2 = new SphereNode(new Vector(.1, .4, .1, 1));
	gn3.add(gn5);
	gn6.add(sphere2);

	/*
	//Quaternion-Rotations
	let animationNodes = [
		new SlerpNode(sg,
			Quaternion.fromAxisAngle((new Vector(0, 1, 0, 0)).normalize(), 0.6),
			Quaternion.fromAxisAngle((new Vector(0, 1, 1, 0)).normalize(), 0.6)
		)
	];
	 */

	//Euler-Rotations
	animationNodes = [];
	animationNodes.push(
		//FahrAnimationNodes
		new TranslationNode(gn2, new Vector(-10, 0, 0, 0)),
		new TranslationNode(gn2, new Vector(10, 0, 0, 0)),
		new TranslationNode(gn2, new Vector(0, 0, -10, 0)),
		new TranslationNode(gn2, new Vector(0, 0, 10, 0)),
		new RotationNode(gn2, new Vector(0, 1, 0, 0), -10),
		new RotationNode(gn2, new Vector(0, 1, 0, 0), 10));

	//Fahranimationen defaultmäßig aus, nur bei keydown-events
	animationNodes[0].turnOffActive();
	animationNodes[1].turnOffActive();
	animationNodes[2].turnOffActive();
	animationNodes[3].turnOffActive();
	animationNodes[4].turnOffActive();
	animationNodes[5].turnOffActive();

	window.addEventListener('keydown', function (event) {
		switch (event.key) {
			//
			case "k":
				raytrace();
				break;
			//nach links fahren
			case "a":
				animationNodes[0].turnOnActive();
				break;
			//nach rechts fahren
			case "d":
				animationNodes[1].turnOnActive();
				break;
			//nach vorne fahren
			case "w":
				animationNodes[2].turnOnActive();
				break;
			//nach hinten fahren
			case "s":
				animationNodes[3].turnOnActive();
				break;
			//nach links drehen
			case "q":
				animationNodes[4].turnOnActive();
				break;
			//nach rechts drehen
			case "e":
				animationNodes[5].turnOnActive();
				break;
		}
	});

	window.addEventListener('keyup', function (event) {
		switch (event.key) {
			//nach links fahren
			case "a":
				animationNodes[0].turnOffActive();
				break;
			//nach rechts fahren
			case "d":
				animationNodes[1].turnOffActive();
				break;
			//nach vorne fahren
			case "w":
				animationNodes[2].turnOffActive();
				break;
			//nach hinten fahren
			case "s":
				animationNodes[3].turnOffActive();
				break;
			//nach links drehen
			case "q":
				animationNodes[4].turnOffActive();
				break;
			//nach rechts drehen
			case "e":
				animationNodes[5].turnOffActive();
				break;
		}
	});
	rasterise();
});