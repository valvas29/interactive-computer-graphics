import Matrix from "./matrix";
import Vector from "./vector";

export default class Quaternion {

    data: Vector;

    constructor(x: number, y: number, z: number, w: number) {
        this.data = new Vector(x, y, z, w);
    }

    static fromAxisAngle(axis: Vector, angle: number) {
        let q = new Quaternion(1, 0, 0, 0);
        // TODO
        return q;
    }

    get conjugate(): Quaternion {
        let q = new Quaternion(1, 0, 0, 0);
        // TODO
        return q;
    }

    get inverse(): Quaternion {
        let q = this.conjugate;
        // TODO
        return q;
    }

    slerp(other: Quaternion, t: number): Quaternion {
        let slerpq = other;
        // TODO
        return slerpq;
    }

    toMatrix(): Matrix {
        let mat = Matrix.identity();

        return mat;
    }
}