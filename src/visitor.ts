
import {GroupNode, SphereNode, AABoxNode, TextureBoxNode, PyramidNode, CameraNode} from './nodes';

export default interface Visitor {
    visitGroupNode(node: GroupNode): void;
    visitSphereNode(node: SphereNode): void;
    visitAABoxNode(node: AABoxNode, outside: boolean): void;
    visitTextureBoxNode(node: TextureBoxNode): void;
    visitPyramidNode(node: PyramidNode): void;
	visitCameraNode(node: CameraNode, active: boolean): void;
}