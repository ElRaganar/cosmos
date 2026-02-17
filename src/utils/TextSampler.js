export function sampleTextCoordinates(text, particleCount, fontSize = 100) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 512;

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const points = [];

    // Scan pixels
    for (let y = 0; y < canvas.height; y += 4) { // Step for optimization
        for (let x = 0; x < canvas.width; x += 4) {
            const index = (y * canvas.width + x) * 4;
            if (data[index] > 128) { // If pixel is bright
                points.push({
                    x: (x - canvas.width / 2) * 0.1, // Scale down to 3D world coords
                    y: -(y - canvas.height / 2) * 0.1, // Invert Y
                    z: 0
                });
            }
        }
    }
    return points;
}