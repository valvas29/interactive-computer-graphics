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
	RotationNode
} from './animation-nodes';
import phongVertexShader from './phong-vertex-perspective-shader.glsl';
import phongFragmentShader from './phong-fragment-shader.glsl';
import textureVertexShader from './texture-vertex-perspective-shader.glsl';
import textureFragmentShader from './texture-fragment-shader.glsl';
import {Rotation, Scaling, SQT, Translation} from './transformation';
import Quaternion from './quaternion';

window.addEventListener('load', () => {
	const canvas = document.getElementById("renderer") as HTMLCanvasElement;
	const gl = canvas.getContext("webgl2");

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

	// setup for rendering
	const setupVisitor = new RasterSetupVisitor(gl);
	setupVisitor.setup(sg);

	let camera = {
		eye: new Vector(0, 0, 2, 1),
		center: new Vector(0, 0, 0, 1),
		up: new Vector(0, 1, 0, 0),
		fovy: 60,
		aspect: canvas.width / canvas.height,
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
	let animationNodes = [
		new RotationNode(gn4, new Vector(1, 0.3, 0.5, 0)),

	];

	function simulate(deltaT: number) {
		for (let animationNode of animationNodes) {
			animationNode.simulate(deltaT);
		}
	}

	let lastTimestamp = performance.now();

	function animate(timestamp: number) {
		simulate(timestamp - lastTimestamp);
		visitor.render(sg, camera, []);
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
			case "ArrowUp":
				animationNodes[0].toggleActive();
				break;
		}
	});
});