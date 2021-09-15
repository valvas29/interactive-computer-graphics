/**
 * Draws a line from pointA to pointB on the canvas
 * with the DDA algorithm.
 * @param  {Array.<number>} data   - The linearised pixel array
 * @param  {Array.<number>} pointA - The start point of the line
 * @param  {Array.<number>} pointB - The end point of the line
 * @param  {number} width          - The width of the canvas
 * @param  {number} height         - The height of the canvas
 */
export function dda(data: Uint8ClampedArray, pointA: [number, number], pointB: [number, number], width: number, height: number) {

    let setPixel = function (x: number, y: number, data: Uint8ClampedArray, width: number) {
        data[4 * (width * y + x) + 0] = 0;
        data[4 * (width * y + x) + 1] = 0;
        data[4 * (width * y + x) + 2] = 0;
        data[4 * (width * y + x) + 3] = 255;
    }

    setPixel(pointA[0], pointA[1], data, width);
    setPixel(pointB[0], pointB[1], data, width);

    if (Math.abs(pointA[0] - pointB[0]) > Math.abs(pointA[1] - pointB[1])) {
        // steps in x direction
        if (pointA[0] > pointB[0]) {
            let tmp = pointA;
            pointA = pointB;
            pointB = tmp;
        }

        let m = (pointB[1] - pointA[1]) / (pointB[0] - pointA[0]);
        for (let x = pointA[0] + 1; x < pointB[0]; x++) {
            let y = Math.round(m * (x - pointA[0]) + pointA[1]);
            setPixel(x, y, data, width);
        }
    } else {
        // steps in y direction
        if (pointA[1] > pointB[1]) {
            let tmp = pointA;
            pointA = pointB;
            pointB = tmp;
        }

        let m = (pointB[0] - pointA[0]) / (pointB[1] - pointA[1]);
        for (let y = pointA[1] + 1; y < pointB[1]; y++) {
            let x = Math.round(m * (y - pointA[1]) + pointA[0]);
            setPixel(x, y, data, width);
        }
    }

    /* //y = mx + b

    if (pointA[0] > pointB[0]) {
        let temp = pointA[0];
        pointA[0] = pointB[0];
        pointB[0] = temp;
    }

    if (pointA[1] > pointB[1]) {
        let temp = pointA[1];
        pointA[1] = pointB[1];
        pointB[1] = temp;
    }

    const dx = pointB[0] - pointA[0],
          dy = pointB[1] - pointA[1],
          step = dx > dy ? dx : dy,
          xInc = dx / step,
          yInc = dx / step;

    for (let i = 0; i < step; i++) {
        data[(pointA[1] * width + pointA[0]) * 4 + 3] = 255;
        pointA[0] += xInc;
        pointA[1] += yInc;
    }
     */
}
