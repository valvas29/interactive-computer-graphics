import Matrix from "./matrix";
import Vector from "./vector";

export default class Quaternion {

    data: Vector;

    constructor(x: number, y: number, z: number, w: number) {
        this.data = new Vector(x, y, z, w);
    }

    static fromAxisAngle(axis: Vector, angle: number) {
        //let q = new Quaternion(1, 0, 0, 0);
        // TODO done
        // https://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
        let q = new Quaternion(axis.x * Math.sin(angle/2), axis.y * Math.sin(angle/2), axis.z * Math.sin(angle/2), Math.cos(angle/2));
        return q;
    }

    get conjugate(): Quaternion {
        // let q = new Quaternion(1, 0, 0, 0);
        // TODO done
        let q = new Quaternion( - this.data.x, - this.data.y, - this.data.z, this.data.w);
        return q;
    }

    get inverse(): Quaternion {
        let q = this.conjugate;

        // TODO done
        let i = 1/this.norm;
        let v = q.data.mul(i);

        return new Quaternion(v.x, v.y, v.z, v.w);
    }

    // not given as instruction / not part of original project
    get norm(): number {
        let norm = Math.pow(this.data.x, 2) + Math.pow(this.data.y, 2) + Math.pow(this.data.z, 2) +
            Math.pow(this.data.w, 2);
        return norm;
    }

    slerp(other: Quaternion, t: number): Quaternion {
        // let slerpq = other;

        // TODO
        // https://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/index.htm

        let cos_phi = this.data.x * other.data.x + this.data.y * other.data.y + this.data.z * other.data.z + this.data.w * other.data.w;
        let sin_phi = Math.sin(Math.acos(cos_phi));
        let phi = Math.asin(sin_phi)

        let slerpq = this.data.mul( Math.sin(phi*(1-t)) / sin_phi).add(other.data.mul(sin_phi * t / sin_phi));

        return new Quaternion(slerpq.x, slerpq.y, slerpq.z, slerpq.w);
        // return other;
    }

    toMatrix(): Matrix {
        let mat = Matrix.identity();
        // TODO done
        mat.setVal(0, 0, 1-2*(Math.pow(this.data.y, 2) + Math.pow(this.data.z, 2)));
        mat.setVal(0, 1, 2*(this.data.x * this.data.y - this.data.w * this.data.z));
        mat.setVal(0, 2, 2*(this.data.x * this.data.z + this.data.w * this.data.y));
        mat.setVal(1, 0, 2*(this.data.x * this.data.y + this.data.w * this.data.z));
        mat.setVal(1, 1, 1-2*(Math.pow(this.data.x, 2) + Math.pow(this.data.z, 2)));
        mat.setVal(1, 2, 2*(this.data.y * this.data.z - this.data.w * this.data.x));
        mat.setVal(2, 0, 2*(this.data.x * this.data.z - this.data.w * this.data.y));
        mat.setVal(2, 1, 2*(this.data.y * this.data.z + this.data.w * this.data.x));
        mat.setVal(2, 2, 1-2*(Math.pow(this.data.x, 2) + Math.pow(this.data.y, 2)));

        return mat;
    }
}