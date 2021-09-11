export class ObjLoader {
	parse() {
		fetch("./diamond.obj"
		).then(resp => resp.text()
		).then(resp => console.log(resp));
	}
}