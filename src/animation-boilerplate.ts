import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './math/vector';
import {
    GroupNode,
    SphereNode,
    TextureBoxNode
} from './scene/nodes';
import {
    RasterVisitor,
    RasterSetupVisitor
} from './rasterization/rastervisitor';
import Shader from './rasterization/shaders/shader';
import {
    RotationNode
} from './scene/animation-nodes';
import phongVertexShader from './rasterization/shaders/phong-vertex-perspective-shader.glsl';
import phongFragmentShader from './rasterization/shaders/phong-fragment-shader.glsl';
import textureVertexShader from './rasterization/shaders/texture-vertex-perspective-shader.glsl';
import textureFragmentShader from './rasterization/shaders/texture-fragment-shader.glsl';
import { Rotation, Translation } from './math/transformation';
import {FirstTraversalVisitorRaster} from "./rasterization/firstTraversalVisitorRaster";

window.addEventListener('load', () => {
    const canvas = document.getElementById("rasteriser") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2");

    // construct scene graph
    //        SG
    //         |
    //    +----+-----+
    //  T(gn1)     T(gn2)
    //    |          |
    //  Sphere     R(gn3)
    //               |
    //              Box
    const sg = new GroupNode(new Rotation(new Vector(0, 0, 1, 0), 0));
    const gn1 = new GroupNode(new Translation(new Vector(-0.75, -0.75, -3, 0)));
    sg.add(gn1);
    const sphere = new SphereNode(new Vector(.8, .4, .1, 1))
    gn1.add(sphere);
    const gn2 = new GroupNode(new Translation(new Vector(.2, .2, -1, 0)));
    sg.add(gn2);
    const gn3 = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
    gn2.add(gn3);
    const cube = new TextureBoxNode('hci-logo.png', 'brickwall_normal.jpg');
    gn3.add(cube);

    // setup for rendering
    const setupVisitor = new RasterSetupVisitor(gl);
    setupVisitor.setup(sg);

    let camera = {
        eye: new Vector(0, 0, 1, 1),
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

    const phongValues = {
        shininess: 16.0,
        kA: 0.3,
        kD: 0.6,
        kS: 0.7
    }

    const visitor = new RasterVisitor(gl, phongShader, textureShader, setupVisitor.objects);

    let animationNodes = [
        new RotationNode(sg, new Vector(0, 0, 1, 0), 10),
        new RotationNode(gn3, new Vector(0, 1, 0, 0),10)
    ];

    function simulate(deltaT: number) {
        for (let animationNode of animationNodes) {
            animationNode.simulate(deltaT);
        }
    }

    let lastTimestamp = performance.now();

    function animate(timestamp: number) {
        simulate(timestamp - lastTimestamp);
        visitor.render(sg, camera, [], phongValues, null);
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