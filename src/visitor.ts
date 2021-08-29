import {GroupNode, SphereNode, AABoxNode, TextureBoxNode, CameraNode} from './nodes';

export default interface Visitor {
    visitGroupNode(node: GroupNode): void;
    visitSphereNode(node: SphereNode): void;
    visitAABoxNode(node: AABoxNode): void;
    visitTextureBoxNode(node: TextureBoxNode): void;
	visitCameraNode(node: CameraNode): void;
}