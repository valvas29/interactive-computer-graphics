import Vector from './vector';
import Intersection from './intersection';

/**
 * Calculate the colour of an object at the intersection point according to the Phong Lighting model.
 * @param color The colour of the intersected object
 * @param intersection The intersection information
 * @param lightPositions The light positions
 * @param shininess The shininess parameter of the Phong model
 * @param cameraPosition The position of the camera
 * @return The resulting colour
 */
export default function phong(color: Vector, intersection: Intersection, lightPositions: Array<Vector>, shininess: number, cameraPosition: Vector): Vector {
  //https://codepen.io/shubniggurath/pen/jRwPKm?editors=1000
  //http://jsfiddle.net/soulwire/vBuTR/
  //reflect function: https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/reflect.xhtml
  const lightColor = new Vector(0.8, 0.8, 0.8, 0);
  const kA = 0.8;
  const kD = 0.5;
  const kS = 0.5;


  let viewDirection = cameraPosition.sub(intersection.point);

  let ambient = color.mul(kA);

  let diff = 0;
  let spec = 0;
  for (let i = 0; i < lightPositions.length; i++) {
    let lightDirection = lightPositions[i].sub(intersection.point);
    let reflectDirection = lightDirection.normalize().mul(-1).sub(intersection.normal.mul(intersection.normal.dot(lightDirection.normalize().mul(-1)) * 2.0));

    diff += Math.max(intersection.normal.dot(lightDirection.normalize()), 0.0);

    spec += Math.pow(Math.max(viewDirection.normalize().dot(reflectDirection.normalize()), 0.0), shininess);
  }

  let diffuse = lightColor.mul(diff).mul(kD);
  let specular = lightColor.mul(spec).mul(kS);

  return ambient.add(diffuse).add(specular);
}