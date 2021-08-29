import RasterSphere from './raster-sphere';
import RasterBox from './raster-box';
import RasterPyramid from './raster-pyramid';
import RasterTextureBox from './raster-texture-box';
import Vector from './vector';
import Matrix from './matrix';
import Visitor from './visitor';
import {AABoxNode, GroupNode, Node, SphereNode, TextureBoxNode, PyramidNode, CameraNode} from './nodes';
import Shader from './shader';
import {CameraRasteriser, PhongValues} from "./project-boilerplate";
import {FirstTraversalVisitor} from "./firstTraversalVisitor";

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
   */
  constructor(private gl: WebGL2RenderingContext, private shader: Shader, private textureshader: Shader, private renderables: WeakMap<Node, Renderable>) {
  }

  /**
   * Renders the Scenegraph
   * @param rootNode The root node of the Scenegraph
   * @param camera The camera used
   * @param lightPositions The light positions
   * @param phongValues phong-coefficients
   */
  render(
    rootNode: Node,
    camera: CameraRasteriser | null,
    lightPositions: Array<Vector>,
    phongValues: PhongValues
  ) {
    // clear
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    if (camera) {
      this.setupCamera(camera);
    }

    if (phongValues) {
      this.passPhongValues(phongValues);
    }

    //MatrixStacks hier immer neu leeren, damit firefox nicht crasht
    this.matrixStack = [];
    this.inverseStack = [];

    this.matrixStack.push(Matrix.identity());
    this.inverseStack.push(Matrix.identity());

    //first traversal
    let firstTraversalVisitor = new FirstTraversalVisitor();
    firstTraversalVisitor.setup(rootNode);
    this.lookat = firstTraversalVisitor.lookat;
    this.perspective = firstTraversalVisitor.perspective;

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
    if (V && this.lookat) {  //was heißt das, wo ist der boolean?
      V.set(this.lookat);
    }
    const P = shader.getUniformMatrix("P");
    if (P && this.perspective) { //was heißt das, wo ist der boolean?
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
   */
  visitAABoxNode(node: AABoxNode) {
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

    shader.getUniformMatrix("M").set(toWorld);
    let P = shader.getUniformMatrix("P");
    if (P && this.perspective) {
      P.set(this.perspective);
    }
    shader.getUniformMatrix("V").set(this.lookat);

    this.renderables.get(node).render(shader);
  }

  visitPyramidNode(node: PyramidNode) {
    this.shader.use();
    let shader = this.shader;

    // TODO Calculate the model matrix for the box
    let toWorld = this.matrixStack[this.matrixStack.length - 1];

    shader.getUniformMatrix("M").set(toWorld);
    let V = shader.getUniformMatrix("V");
    if (V && this.lookat) {
      V.set(this.lookat);
    }
    let P = shader.getUniformMatrix("P");
    if (P && this.perspective) {
      P.set(this.perspective);
    }

    this.renderables.get(node).render(shader);
  }

  visitCameraNode(node: CameraNode): void {
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
   * @param context The 3D context in which to create buffers
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
   */
  visitAABoxNode(node: AABoxNode) {
    this.objects.set(
      node,
      new RasterBox(
        this.gl,
        new Vector(-0.5, -0.5, -0.5, 1),
        new Vector(0.5, 0.5, 0.5, 1)
      )
    );
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
        node.texture
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
  
  visitCameraNode(node: CameraNode) {

  }
}
