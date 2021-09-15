/**
 * Determines the colour of a pixel (x, y) to create
 * a circle and saves it into the data array.
 * The data array holds the linearised pixel data of the target canvas
 * row major. Each pixel is of RGBA format.
 * @param data The linearised pixel array
 * @param x The x coordinate of the pixel
 * @param y The y coordinate of the pixel
 * @param width The width of the canvas
 * @param height The height of the canvas
 * @param radius The radius of the circle
 */
export function circle(data: Uint8ClampedArray, x: number, y: number, width: number, height: number, radius: number) {
    let index = (y * width + x) * 4;
    x = (width / 2) - x;
    y = (width / 2) - y;

    if (Math.sqrt(x * x + y * y) <= radius) {
        data[index] = Math.sqrt(x * x + y * y);
        data[index + 1] = Math.tan(Math.sqrt(x * x + y * y)) * 10;
        data[index + 2] = Math.cos(x*y) * 1;
        data[index + 3] = 255;
    }
    else {
        data[index] = 255;
        data[index + 1] = 255;
        data[index + 2] = 255;
        data[index + 3] = 255;
    }
}
