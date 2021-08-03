import Vector from './vector';
import Intersection from './intersection';
import Ray from './ray';

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
  ) { }

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
    const p = ray.origin.add(ray.direction.mul(t));
    const test = p.sub(this.center).normalize()
    return new Intersection(t, p, test);

/*
    //https://www.youtube.com/watch?v=Owzsg5tCruc
    let v = ray.origin.sub(this.center);
    let a = ray.direction.dot(ray.direction);
    let b = 2.0 * ray.direction.dot(v);
    let c = v.dot(v) - (this.radius * this.radius);

    let discriminant = (b * b) - (4.0 * a * c);

    if (discriminant > 0) {
      let t1 = (-b - Math.sqrt(discriminant) / (2.0 * a));
      let t2 = (-b + Math.sqrt(discriminant) / (2.0 * a));

      if (t1 >= 0 && t2 >= 0) {
        //https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
        let phit = ray.origin.add(ray.direction.mul(t1));
        return new Intersection(t1, phit, phit.sub(this.center).normalize());
      }
      else {
        let phit = ray.origin.add(ray.direction.mul(t1));
        return new Intersection(t2, phit, phit.sub(this.center).normalize());
      }
    }
    else return null;

    /*
    let t = ray.direction.dot(this.center.sub(ray.origin));
    let p = ray.origin.add(ray.direction.mul(t));
    let y = this.center.sub(p).length;

    if (y < this.radius) {
      let x = Math.sqrt(Math.pow(this.radius, 2) - Math.pow(y, 2));
      let t1 = t - x;
      let t2 = t + x;

      return new Intersection(1, new Vector(0, 0, 0, 0), new Vector(0, 0, 0, 0));
    }
    else return null;
    */
  }
}