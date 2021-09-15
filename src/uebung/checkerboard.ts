/**
 * Determines the colour of a pixel (x, y) to create
 * a checkerboard pattern and saves it into the data array.
 * The data array holds the linearised pixel data of the target canvas
 * row major. Each pixel is of RGBA format.
 * @param data The linearised pixel array
 * @param x The x coordinate of the pixel
 * @param y The y coordinate of the pixel
 * @param width The width of the canvas
 * @param height The height of the canvas
 */
export function checkerboard(data: Uint8ClampedArray, x: number, y: number, width: number, height: number) {
    const pixelWidthPerTile = width / 8;
    const index = (x + y * width) * 4 + 3;
    if (Math.floor(x / pixelWidthPerTile) % 2 == 0) {
        data[index] = 255;
        data[index-1] = 0;
        data[index-2] = x;
        data[index-3] = width/2 - (x*y) + 16880;
    }
    if (Math.floor(y / pixelWidthPerTile) % 2 == 1) {
        if (data[index] == 255) {
            data[index] = 0;
            data[index-1] = 0;
            data[index-2] = 0;
            data[index-3] = 0;
        } else {
            data[index] = 255;
            data[index-1] = 0;
            data[index-2] = x;
            data[index-3] = width/2 - (x*y) + 16880;
        }
    }
    //meine eigentliche Lösung
    /*
    let index = (y * width + x) * 4;
    let tileWidth = width / 8;

    let upperBound = tileWidth;
    let lowerBound = 0;

    let isBlackBeginningRow;
    let isBlack;

    for (let i = 0; i < 4; i++) {
        if (y <= upperBound && y >= lowerBound) {
            isBlackBeginningRow= true;
        }
        if (x <= upperBound && x >= lowerBound) {
            isBlack = true;
        }
        upperBound += tileWidth * 2;
        lowerBound = upperBound - tileWidth;
    }

    if (isBlackBeginningRow == isBlack) {
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
        data[index + 3] = 255;
    }
    else {
        data[index] = 255;
        data[index + 1] = 255;
        data[index + 2] = 255;
        data[index + 3] = 255;
    }
     */
}