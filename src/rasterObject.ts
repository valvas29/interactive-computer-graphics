import Shader from "./shader";
import Ray from "./ray";
import Intersection from "./intersection";
import Vector from "./vector";
import Sphere from "./sphere";

export interface RasterObject{
    boundingSphere: Sphere;
    vertexBuffer: WebGLBuffer;

    render(shader: Shader): void;
    intersectBoundingSphere(ray: Ray): Intersection;
    //intersectTriangles(ray: Ray);
    updateColor(newColor: Vector, newSecondaryColor?: Vector): void;
}