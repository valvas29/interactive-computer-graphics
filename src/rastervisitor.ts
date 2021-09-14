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
import Ray from "./ray";
import Intersection from "./intersection";
import {RasterObject} from "./rasterObject";
import {RasterCustomShape} from "./raster-custom-shape";

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

    mouseRay: Ray;

    firstTraversalVisitor: FirstTraversalVisitorRaster;

    // saves the intersected Object, the according intersection and the mouseRay in local space of the according object:
    objectIntersections: [RasterObject, Intersection, Ray][]; // equivalent to Array<[RasterObject, Intersection, Ray]>

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

        this.objectIntersections = [];

        if (firstTraversalVisitor) {
            this.firstTraversalVisitor = firstTraversalVisitor;
            //first traversal
            firstTraversalVisitor.setup(rootNode);
            this.lookat = firstTraversalVisitor.lookat;
            this.perspective = firstTraversalVisitor.perspective;
            this.passCameraPosition(firstTraversalVisitor.eye);
            this.passLightPositions(firstTraversalVisitor.lightPositions);

            // if the canvas was clicked before this traversal
            if (firstTraversalVisitor.mouseRay) {
                this.mouseRay = firstTraversalVisitor.mouseRay;
                // reset
                firstTraversalVisitor.mouseRay = undefined;
            }
        } else {
            // this only happens in other boilerplates that aren't relevant to the final project
            this.setupCamera(camera);
        }

        // traverse and render
        rootNode.accept(this);

        if (this.mouseRay) {
            // sort the boundingSphere intersections by distance to look at the closest hit first
            this.objectIntersections.sort((a, b) => {
                return a[1].t - b[1].t;
            });

            for (let i = 0; i < this.objectIntersections.length; i++) {
                // then check if the actual object (triangles) were hit: if no, keep going down the list
                let object = this.objectIntersections[i][0];
                let localMouseRay = this.objectIntersections[i][2];
                // node


                object.updateColor(new Vector(Math.random(), Math.random(), Math.random(), 1), new Vector(Math.random(), Math.random(), Math.random(), 1)); // TODO delete
                break; // TODO delete

                /*
                let triangleIntersection = object.intersectTriangles(localMouseRay);
                if(triangleIntersection){
                    object.updateColor(new Vector(Math.random(), Math.random(), Math.random(), 1));
                    break;
                }

                 */
            }

            // reset
            this.mouseRay = undefined;
        }
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
        shader.getUniformVec3("lightPosition1").set(lightPositions[0]);
        shader.getUniformVec3("lightPosition2").set(lightPositions[1]);
        shader.getUniformVec3("lightPosition3").set(lightPositions[2]);

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

        if (this.mouseRay) {
            let raster_sphere = this.renderables.get(node) as RasterSphere;
            let mouseRayLocal = new Ray(fromWorld.mulVec(this.mouseRay.origin), fromWorld.mulVec(this.mouseRay.direction).normalize());
            let intersection = raster_sphere.intersectBoundingSphere(mouseRayLocal);
            if (intersection) {
                let objectIntersection: [RasterObject, Intersection, Ray] = [raster_sphere, intersection, mouseRayLocal];
                this.objectIntersections.push(objectIntersection);
            }
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


        if (outside) {
            if (this.mouseRay) {
                let raster_boxOutside = this.renderables.get(node) as RasterBoxOutside;
                let mouseRayLocal = new Ray(fromWorld.mulVec(this.mouseRay.origin), fromWorld.mulVec(this.mouseRay.direction).normalize());
                let intersection = raster_boxOutside.intersectBoundingSphere(mouseRayLocal);
                if (intersection) {
                    let objectIntersection: [RasterObject, Intersection, Ray] = [raster_boxOutside, intersection, mouseRayLocal];
                    this.objectIntersections.push(objectIntersection);
                }
            }
        } else {
            // if the aaBox that has Objects inside is clickable, none of the ones inside are since it checks boundingSphere first
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

        if (this.mouseRay) {
            let raster_texture_box = this.renderables.get(node) as RasterTextureBox;
            let mouseRayLocal = new Ray(fromWorld.mulVec(this.mouseRay.origin), fromWorld.mulVec(this.mouseRay.direction).normalize());
            let intersection = raster_texture_box.intersectBoundingSphere(mouseRayLocal);
            if (intersection) {
                let objectIntersection: [RasterObject, Intersection, Ray] = [raster_texture_box, intersection, mouseRayLocal];
                this.objectIntersections.push(objectIntersection);
            }
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

        if (this.mouseRay) {
            let raster_Pyramid = this.renderables.get(node) as RasterPyramid;
            let mouseRayLocal = new Ray(fromWorld.mulVec(this.mouseRay.origin), fromWorld.mulVec(this.mouseRay.direction).normalize());
            let intersection = raster_Pyramid.intersectBoundingSphere(mouseRayLocal);
            if (intersection) {
                let objectIntersection: [RasterObject, Intersection, Ray] = [raster_Pyramid, intersection, mouseRayLocal];
                this.objectIntersections.push(objectIntersection);
            }
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

        if (this.mouseRay) {
            let raster_custom_shape = this.renderables.get(node) as RasterCustomShape;
            let mouseRayLocal = new Ray(fromWorld.mulVec(this.mouseRay.origin), fromWorld.mulVec(this.mouseRay.direction).normalize());
            let intersection = raster_custom_shape.intersectBoundingSphere(mouseRayLocal);
            if (intersection) {
                let objectIntersection: [RasterObject, Intersection, Ray] = [raster_custom_shape, intersection, mouseRayLocal];
                this.objectIntersections.push(objectIntersection);
            }
        }

        this.renderables.get(node).render(shader);
    }

    visitCameraNode(node: CameraNode): void {

    }

    visitLightNode(node: LightNode): void {

    }

    castRayFromMouse(mx: number, my: number) {
        let camera = {
            origin: this.firstTraversalVisitor.cameraToWorld.mulVec(new Vector(0, 0, 0, 1)),
            width: 350,
            height: 350,
            alpha: Math.PI / 3,
            toWorld: this.firstTraversalVisitor.cameraToWorld
        }
        let mouseRay = Ray.makeRay(mx, my, camera);

        // save the created ray into the firstTraversalVisitor to be able to later check for intersections at the start of
        // the next render traversal
        // it is saved into the firstTraversalVisitor instead of this visitor to ensure the intersection check
        // happens once for the entire traversal and doesn't start halfway through
        this.firstTraversalVisitor.mouseRay = mouseRay;
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
            new RasterCustomShape(
                this.gl,
                node.vertices,
                node.normals,
                node.vertex_indices,
                node.normal_indices,
                node.color
            )
        )
    }

    visitCameraNode(node: CameraNode) {

    }

    visitLightNode(node: LightNode) {

    }
}
