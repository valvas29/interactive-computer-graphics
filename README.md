# ICG Projekt

<img src="img/screenshot.jpg" width="75%">

Dieses Repository beinhaltet mein Projekt des Kurses "Interaktive Computergraphik", erstellt in einem Team mit einer weiteren Person.

# Mein Beitrag zum Projekt

- Implementation des Szenengraphs
- Implementation des Rasteriser & Ray Tracer 
- drei verschiedene Objekte, die gerendert werden koennen
- Benutzung mehrfarbiger Objekte ermoeglicht
- mathematische Bibliothek zur Berechnung der Bounding Boxes und Raycasting der Mausinteraktion
- Auswahl und Manipulation von Objekten
- Implementation des Phong Shaders
- Benutzung mehrerer Texturen ermoeglicht
- Benutzung mehrerer Lichtquellen

# Projekt Struktur

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

Das Projekt ist in mehreren Ordner thematisch aufgeteilt. 
`dist` beinhaltet die htmls, die `sample_scene`, `textures` und `obj`. In `obj` liegen Beispieldateien, welche durch unseren OBJ Loader in die Szene geladen werden können. 
`img` enthält einen Screenshot der Anwendung zu Dokumentationszwecken.
Unter `src` sind alle Quelldateien zusammengefasst, welche durch `webgl` transpiliert werden.
Hierbei haben wir die Pakete entsprechend ihren Funktionen strukturiert:
- `interfaces` beinhaltet das Interface visitor und rasterObject.
- `math` enthält mathematische Objekte, wie Vektoren und Matrizen, aber auch utils für die BoundingSphere- und Schnittpunktberechnung.
- `rasterization` enthält die Rasterobjekte, Phongshader und Rastervisitor.
- `raytracing` enthält die Raytracingobjekte, Phongshader und Rayvisitor.
- `scene`  umfasst die Datenstrukturen (animation-nodes und nodes) für die Szene.
- `uebung` enthält Files aus der Übung.
- `project-boilerplate.ts` enthält den Default-Szenengraph, den Animations/Render-Loop, das Speichern/Laden der Szene, das Parsen der OBJs und definiert die eventListener der UI.

# Installation

Wechseln Sie mit einer Konsole in das Verzeichnis dieser Datei und füren Sie 

```
npm install
```
aus.
### Ausführung
Geben Sie anschließend 
```bash
npm start
```
ein und rufen sie die Website des Servers über `0.0.0.0:<port>` bzw. `localhost:<port>` im Browser auf. Der Port ist hierbei aus der Ausgabe der Konsole zu ersetzen.



# How-To

Im folgenden wird erklärt wie die Anwendung zu bedienen ist:

## Renderer

Mit K oder Klick auf die entsprechenden Buttons in dem UI kann man den aktiven Renderer wechseln. (Rasterizer oder Raytracer)
Das deltaT der RotationNode (die auch zum Rotieren der Kamera benutzt wird) haben wir für den Raytracer auf 200 gecappt, da sonst bei unserer Performance das Nicken und Gieren der Kamera zu extrem und unbenutzbar wäre.

## Free Flight Modus

Die Kamera ist automatisch im Free Flight Modus. Mit WASD bewegen sie die Kamera auf ihrer x und z Achse, mit QE auf der y Achse. Mit den Pfeiltasten können sie die Kamera nicken und gieren.
Mit C wird zu einer festen Kamera gewechselt, die an einem animierten (Rotation) Knoten hängt, beziehungsweise kann man mit C von der festen Kamera wieder zurück in den Free Flight Modus wechseln.

## Beleuchtungsparameter

Die Slider rechts vom Canvas beinflussen die Koeffizienten und Shininess des Phong Beleuchtungsmodells, das im Raytracer und Rasterizer benutzt wird.

## Animationsknoten

Drei verschiedene Animationsknoten: Rotation, Jumper und Scaling.
Jumper und Scaling sind mit der Tastatur steuerbar:
Jumper: I drücken, um die rote Sphäre einmal bis zu einem Maximalwert springen zu lassen.
Scaling: U drücken und halten, um die Pyramide bis zu einem Maximalwert hochzuskalieren, beziehungsweise bis zu einem Minimalwert herunterzuskalieren.

## Mausinteraktion

Objekte im Raytracer und Rasterizer wechseln per Klick ihre Farbe oder Textur. Dies gilt nicht für den Desktop-Würfel, den man von innen sieht.
Der Farbwechsel funktioniert auch im Raytracer, kann aber ein paar Sekunden dauern bis die neue Farbe angezeigt wird, aufgrund der langsamen Performance.

## Laden und Speichern der Szene

Der "Szene herunterladen"-Button auf der rechten Seite speichert alle Informationen der aktuellen Szene in einer .txt im json-Format. Diese kann man dann über den darunterliegenden FilePicker laden. 
Alternativ kann man die vorgefertigte sample_scene.json mit "Beispiel-Szene importieren" laden.

## OBJ Loader

Es können drei verschiedene Beispiel-OBJ-Dateien über die Buttons in der UI geladen werden. Sobald ein OBJ geladen wird, wird eine GroupNode erstellt und an die rootNode gehängt. An die eben erstellte GroupNode wird dann das neue Objekt angehängt. 
Wenn schon ein OBJ geladen wurde, wird keine neue GroupNode erstellt, sondern nur das Objekt ersetzt.

### Kompatibilität
Das Projekt wurde mit folgenden Konfigurationen getestet:
- Windows 10 Build Version <19042.1165> mit
  - Chrome Version <93.0.4577.63 (Offizieller Build) (64-Bit)> und Version <93.0.4577.82 (Offizieller Build) (64-Bit)>
  - node js Version <v14.16.1>
