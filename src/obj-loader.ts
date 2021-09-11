import {CustomShapeNode} from "./nodes";

export class ObjLoader {
	string: string;

	constructor() {
		this.string = ""
	}

	parse(objPath: string) {
		this.getText(objPath);
		let vertices = [];
		let normals = [];
		let indices = [];

		let lines = this.string.split('\n');

		let lineValues;
		let identifier;
		for (let i = 0; i < lines.length; i++) {
			lineValues = lines[i].split(' ');
			//remove whitespaces
			lineValues = lineValues.filter(el => el);
			//e.g. v/f/vn
			identifier = lineValues[0];

			switch(identifier) {
				case "v":
					vertices.push(parseFloat(lineValues[1]), parseFloat(lineValues[2]), parseFloat(lineValues[3]));
					break;
				case "vn":
					normals.push(parseFloat(lineValues[1]), parseFloat(lineValues[2]), parseFloat(lineValues[3]));
					break;
				case "f":
					indices.push(parseFloat(lineValues[1]), parseFloat(lineValues[2]), parseFloat(lineValues[3]));
					break;
			}
		}
		return new CustomShapeNode(vertices, normals, indices);
	}

	getText(objPath: string) {
		fetch(objPath)
			.then(resp => resp.text())
			.then(resp => this.string = resp);
	}
}