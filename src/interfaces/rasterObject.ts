import Shader from "../rasterization/shaders/shader";
import Ray from "../math/ray";
import Intersection from "../math/intersection";
import Sphere from "../raytracing/objects/sphere";

export interface RasterObject{
    boundingSphere: Sphere;
    vertexBuffer: WebGLBuffer;
    vertices: number[];

    render(shader: Shader): void;
    intersectBoundingSphere(ray: Ray): Intersection;
    intersectTriangles(ray: Ray): Intersection;
    /*
    updateColor(newColor: Vector, newSecondaryColor?: Vector): void;
    updateColor(): void;
    updateColor(newTexture: string): void;
     */
    // can't really overload the function so... takes either 2 colors, a texture or nothing depending on the RasterObject
    updateColor(a?: any, b?: any): void;
}