import Vector from './vector';
import { GroupNode } from './nodes';
import {Rotation, SQT, Translation} from './transformation';
import Quaternion from './quaternion';
import Matrix from "./matrix";

/**
 * Class representing an Animation
 */
export class AnimationNode {
  /**
   * Describes if the animation is running
   */
  active: boolean;

  /**
   * Creates a new AnimationNode
   * @param groupNode The GroupNode to attach to
   */
  constructor(public groupNode: GroupNode) {
    this.active = true;
  }

  /**
   * Toggles the active state of the animation node
   */
  toggleActive() {
    this.active = !this.active;
  }

  turnOnActive() {
    this.active = true;
  }

  turnOffActive() {
    this.active = false;
  }
}

/**
 * Class representing a Translation Animation
 * @extends AnimationNode
 */
export class TranslationNode extends AnimationNode {
  /**
   * translation The translation vector that shall be expressed by the matrix
   */
  vector: Vector

  /**
   * Creates a new TranslationNode
   * @param groupNode The group node to attach to
   * @param translation
   */
  constructor(groupNode: GroupNode, translation: Vector) {
    super(groupNode);
    this.vector = translation;
  }

  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {
    // change the matrix of the attached
    // group node to reflect a translation
    if (this.active) {
      let matrix = this.groupNode.transform.getMatrix();
      let deltaVector = this.vector.mul(0.0001 * deltaT);
      let translation = new Translation(deltaVector);
      translation.matrix = matrix.mul(translation.getMatrix());
      this.groupNode.transform = translation;
    }
  }
}

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class RotationNode extends AnimationNode {
  /**
   * The absolute angle of the rotation
   */
  angle: number;
  /**
   * The vector to rotate around
   */
  axis: Vector;

  /**
   * Creates a new RotationNode
   * @param groupNode The group node to attach to
   * @param axis The axis to rotate around
   * @param angle The amount of rotation
   */
  constructor(groupNode: GroupNode, axis: Vector, angle: number) {
    super(groupNode);
    this.angle = angle;
    this.axis = axis;
  }

  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {
    // change the matrix of the attached
    // group node to reflect a rotation
    if (this.active) {
      let matrix = this.groupNode.transform.getMatrix();
      let rotation = new Rotation(this.axis, 0.0001 * this.angle * deltaT);
      rotation.matrix = matrix.mul(rotation.getMatrix());
      this.groupNode.transform = rotation;
    }
  }
}

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class SlerpNode extends AnimationNode {
  /**
   * The time
   */
  t: number;

  /**
   * The rotations to interpolate between
   */
  rotations: [Quaternion, Quaternion];

  /**
   * Creates a new RotationNode
   * @param groupNode The group node to attach to
   * @param axis The axis to rotate around
   */
  constructor(groupNode: GroupNode, rotation1: Quaternion, rotation2: Quaternion) {
    super(groupNode);
    this.rotations = [rotation1, rotation2];
    this.t = 0;
  }

  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {
    if (this.active) {
      this.t += 0.001 * deltaT;
      const rot = this.rotations[0].slerp(this.rotations[1], (Math.sin(this.t) + 1) / 2);
      (this.groupNode.transform as SQT).rotation = rot;
    }
  }

}