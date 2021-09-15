import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './math/vector';
import {
    GroupNode,
    SphereNode,
    AABoxNode
} from './scene/nodes';
import {
    RasterVisitor,
    RasterSetupVisitor
} from './rasterization/rastervisitor';
import Shader from './rasterization/shaders/shader';
import vertexShader from './uebung/basic-vertex-shader.glsl';
import fragmentShader from './uebung/basic-fragment-shader.glsl';
import { Scaling, Translation } from './math/transformation';
import {FirstTraversalVisitorRaster} from "./rasterization/firstTraversalVisitorRaster";

window.addEventListener('load', () => {
    const canvas = document.getElementById("rasteriser") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2");

    // construct scene graph
    const sg = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));
    const gn1 = new GroupNode(new Translation(new Vector(.5, .3, 0, 0)));
    sg.add(gn1);
    const gn3 = new GroupNode(new Scaling(new Vector(0.4, 0.3, 0.2, 0)));
    gn1.add(gn3);
    const sphere1 = new SphereNode(new Vector(.8, .4, .1, 1))
    gn3.add(sphere1);
    const gn2 = new GroupNode(new Translation(new Vector(-.2, -0.2, 0, 0)));
    sg.add(gn2);
    const cube = new AABoxNode(new Vector(1, 0, 0, 1), new Vector(0.7, 0.7, 0.2, 1.0), true);
    gn2.add(cube);

    // setup for rendering
    const setupVisitor = new RasterSetupVisitor(gl);
    setupVisitor.setup(sg);

    const shader = new Shader(gl,
        vertexShader,
        fragmentShader
    );

    const phongValues = {
        shininess: 16.0,
        kA: 0.3,
        kD: 0.6,
        kS: 0.7
    }
    let firstTraversalVisitor = new FirstTraversalVisitorRaster();

    // render
    const visitor = new RasterVisitor(gl, shader, null, setupVisitor.objects);
    shader.load();
    visitor.render(sg, null, [], phongValues, firstTraversalVisitor);
});