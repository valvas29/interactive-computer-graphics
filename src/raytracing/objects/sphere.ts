import Vector from '../../math/vector';
import Intersection from '../../math/intersection';
import Ray from '../../math/ray';

/**
 * A class representing a sphere
 */
export default class Sphere {
    /**
     * Creates a new Sphere with center and radius
     * @param center The center of the Sphere
     * @param radius The radius of the Sphere
     * @param color The colour of the Sphere
     */
    constructor(
        public center: Vector,
        public radius: number,
        public color: Vector
    ) {
    }

    /**
     * Calculates the intersection of the sphere with the given ray
     * @param ray The ray to intersect with
     * @return The intersection if there is one, null if there is none
     */
    intersect(ray: Ray): Intersection | null {
        const c = Math.pow(ray.direction.dot(ray.origin.sub(this.center)), 2) - Math.pow(ray.origin.sub(this.center).length, 2) + this.radius * this.radius;

        let t;
        if (c < 0) {
            return null;
        } else if (c === 0) {
            t = ray.origin.mul(-1).dot(ray.direction);
        } else { //(c>0) = two intersections
            const t1 = ray.origin.sub(this.center).mul(-1).dot(ray.direction) + Math.sqrt(c);
            const t2 = ray.origin.sub(this.center).mul(-1).dot(ray.direction) - Math.sqrt(c);
            if (t1 < t2) {
                t = t1;
            } else {
                t = t2;
            }
        }
        if (t < 0) {
            // if the intersection is in negative direction to origin
            return null;
        }
        const p = ray.origin.add(ray.direction.mul(t));
        const normal = p.sub(this.center).normalize();
        return new Intersection(t, p, normal);
    }
}