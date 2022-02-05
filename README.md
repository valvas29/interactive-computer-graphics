# ICG project

*Read this in other languages: [English](/README.md), [Deutsch](/README-de.md)*

View the project demo: [https://monaroehm.github.io/interactive-computer-graphics/](https://monaroehm.github.io/interactive-computer-graphics/)

<img src="img/screenshot.jpg" width="100%">

This repository includes my project for the module "interactive computer graphics". It was created in collaboration with another student.

# My contributions

- Implementation of the scene graph
- Implementation of the rasterizer and ray tracer
- Three different renderable object shape classes
- Functionality of multicolored objects
- Mathematical library including algorithms for the calculation of bounding boxes and mouse interaction ray casting
- Selection of objects in 3D space using the mouse
- Implementation of the phong shaders
- Functionality of textures (color and normal maps)
- Shading calculation with multiple moving light sources

# Project structure

```
.
├── README.md
├── dist
│   ├── obj <-- enthält die obj.-Dateien, die man über die Buttons der UI laden kann
│   │	└── ...
│   ├── sample_scene
│   │	└── sample_scene.json <-- die Beispielszene die mit dem "Beispiel-Szene importieren"-Button geladen wird
│   ├── textures <-- enthält Bild- und Normalen-Texturen
│   │	└── ...
│   ├── ...
│   ├── index.html
│   ├── ...
│   ├── project.html <-- html der finalen Abgabe
│   └── ...
├── img <-- Dokumentation
│   └── screenshot.jpg
├── src
│   ├── interfaces
│   │	├── rasterObject.ts
│   │	└── visitor.ts
│   ├── math <-- Mathe Bibliothek
│   │	├── intersection.ts
│   │	├── matrix.ts
│   │	├── quaternion.ts <-- wird in finalen Abgabe, zwar importiert, aber entsprechende animantion nodes nicht benutzt
│   │	├── ray.ts
│   │	├── rayTriangleIntersection.ts <-- utils für Strahl-Triangle Schnittpunktberechnung
│   │	├── ritterAlgorithm.ts <-- utils für BoundingSphere-Berechnung
│   │	├── transformation.ts
│   │	└── vector.ts
│   ├── rasterization
│   │	├── objects
│   │	│   ├── ...
│   │	│   ├── raster-custom-shape.ts <-- für OBJs
│   │	│   └── ...
│   │	├── shaders
│   │	│   └── ...
│   │	├── firstTraversalVisitorRaster.ts <-- rendert nichts bei Traversierung, sodern speichert nur Kamera- und Lichtpositionen
│   │	└── rastervisitor.ts <-- rendert die raster objekte
│   ├── raytracing
│   │	├── objects
│   │	│   └── sphere.ts
│   │	├── shaders
│   │	│   └── phong.ts
│   │	├── firstTraversalVisitorRay.ts <-- rendert nichts bei Traversierung, sodern speichert nur Kamera- und Lichtpositionen
│   │	└── rayvisitor.ts <-- rendert die raster objekte
│   ├── scene <-- definiert die verschiedenen Arten von nodes, die im Szenengraph verwendet werden können
│   │	├── animation-nodes.ts
│   │	└── nodes.ts
│   ├── uebung <-- enthält Files aus der Übung. Sie werden in der finalen Abgabe nicht benutzt und sind somit irrelevant.
│   │	└── ...
│   ├── project-boilerplate.ts <-- Boilerplate: enthält den Default-Szenengraph, den Animations/Render-Loop, das Speichern/Laden der Szene, das Parsen der OBJs und definiert die eventListener der UI. 
│   ├── ...
└── ...

```

The project is thematically structured.
`dist` contains the distributed code like htmls, the `sample_scene`, `textures` and `obj`. `obj` contains example files for objs which can be loaded into the scene using our OBJ Loader. 
`img` contains a screenshot of the application, for documnetary purposes.
`src` contains the source code:
- `interfaces` contains the interfaces of visitor and rasterObject.
- `math` mathematical library. Contains mathematical Objects like Vectors but also algorithms for the calculation of intersections and bounding spheres.
- `rasterization` contains the raster objects, phong shaders and raster visitor.
- `raytracing` contains the ray tracing objects, phong shaders and ray visitor.
- `scene`  contains the scene data structure (nodes and animation nodes).
- `uebung` contains practice files from the lecture that are not relevant to the final project.
- `project-boilerplate.ts` contains the main logic like the scene graph, animation and render loop, saving and loading of scenes etc.

# Running the project locally

Execute this line in a CLI of choice in the directory of this file:

```
npm install
```

Then execute
```bash
npm start
```
and call the url provided by the output, e.g. `localhost:<port>`, in a browser of choice.


# How-To

The functionality of the application is as follows:

## Renderer

Switch between the two types of renderers (rasterizer and ray tracer) using the K-key or the button provided by the UI.
The performace of the ray tracer is poor, since the calculation does not make use of the GPU in this project.

The ray tracer only renders spheres in this project.

## Camera

The camera starts in free flight mode, using WASD to move along the x and z axes and QE for the y axis. The arrow keys can be used to adjust the pitch and yaw of the camera.

Press C to change to a static camera, placed on an animated rotation node. Pressing C again changes back to free fligh mode.

## Lighting

The slideres on the right adjust the parameters of the phong shaders in both renderers.

## Animation nodes

There are three different animation nodes: Rotation, Jumper and Scaling.
Jumper and scaling can be controlled using the keyboard. 

Jumper: Press I to make the red sphere jump once.  
Scaing: Hold U to scale the pyramid up and down.

## Mouse interaction

Objects can be clicked in both render modes to change to a random color or texture. Though this might take some time in the ray tracer. The big cube that is viewed from the inside in the default position is not interactable in this way.

## Saving and loading a scene

The button "Szene herunterladen" on the right side saves all current information of the scene, i.e. color, position etc., in a .txt file in the json format. The information contained in this file can be loaded in via a file picker using the button below.

Alternatively, the provided sample_scene.json can be loaded in using the "Beispiel-Szene importieren" button.

## OBJ Loader

Three different example obj files can be loaded in using the buttons at the very bottom of the right side. The .obj files are parsed using our own algorithms. New objs will replace old ones in the scene.
