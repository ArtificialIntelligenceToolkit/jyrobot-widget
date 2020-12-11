import {
    GraphicsContext
} from '@lumino/datagrid';

export class Canvas {

    public width: number;
    public height: number;
    public gc: GraphicsContext;
    public canvas: HTMLCanvasElement;
    public div: HTMLDivElement;
    public canvasGC: CanvasRenderingContext2D;
    public shape: boolean;
    private _scale: number;

    constructor(width: number, height: number, scale: number) {
	this._scale = scale;
	this.width = width;
	this.height = height;
	this.canvas = document.createElement('canvas');
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.canvas.style.zIndex   = "8";
        this.canvas.style.position = "absolute";
        this.canvas.style.border   = "1px solid";
	this.canvasGC = this.canvas.getContext('2d')!;
	this.gc = new GraphicsContext(this.canvasGC);
	this.shape = false; // in the middle of a shape?
	this.scale(this._scale, this._scale);
    }

    clear() {
	this.gc.clearRect(0, 0, this.width, this.height);
    }

    font(style: string) {
	this.gc.font = style;
    }

    text(t: string, x: number, y: number) {
	this.gc.fillText(t, x, y);
    }

    lineWidth(width: number) {
	this.gc.lineWidth = width;
    }

    strokeStyle(color: Color | null, width: number) {
	if (color) {
	    this.gc.strokeStyle = color.toString();
	} else {
	    this.gc.strokeStyle = "";
	}
	this.gc.lineWidth = width;
    }

    stroke() {
	this.gc.stroke();
    }

    noStroke() {
	this.gc.strokeStyle = "";
    }

    fill(color: Color) {
	if (color) {
	    this.gc.fillStyle = color.toString();
	} else  {
	    this.gc.fillStyle = "";
	}
    }

    noFill() {
	this.gc.fillStyle = "";
    }

    line(x1: number, y1: number, x2: number, y2: number) {
	this.beginShape();
	this.gc.moveTo(x1, y1);
	this.gc.lineTo(x2, y2);
	this.gc.stroke();
    }

    pushMatrix() {
	this.gc.save();
    }

    popMatrix() {
	this.gc.restore();
    }

    translate(x: number, y: number) {
	this.gc.translate(x, y);
    }

    scale(x: number, y: number) {
	this.gc.scale(x, y);
    }

    resetScale() {
	this.gc.setTransform(1, 0, 0, 1, 0, 0);
    }

    rotate(angle: number) {
	this.gc.rotate(angle);
    }

    beginShape() {
	this.shape = false;
	return this.gc.beginPath();
    }

    endShape() {
	this.gc.closePath();
	this.gc.fill();
    }

    vertex(x: number, y: number) {
	if (this.shape)
	    this.gc.lineTo(x, y);
	else {
	    this.gc.moveTo(x, y);
	    this.shape = true;
	}
    }

    rect(x: number, y: number, width: number, height: number) {
	this.gc.fillRect(x, y, width, height);
    }

    ellipse(x: number, y: number, radiusX: number, radiusY: number) {
	this.gc.beginPath();
	this.gc.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
	this.gc.fill();
    }

    picture(pic: Picture, x: number, y: number, scale: number=1.0) {
	const scaled: ImageData = this.scaleImageData(pic.getData(), scale);
	this.gc.putImageData(scaled, x, y);
    }

    scaleImageData(imageData: ImageData, scale: number) {
	let scaled = this.gc.createImageData(imageData.width * scale, imageData.height * scale);
	let subLine = this.gc.createImageData(scale, 1).data;
	for (let row = 0; row < imageData.height; row++) {
            for (let col = 0; col < imageData.width; col++) {
		const sourcePixel = imageData.data.subarray(
                    (row * imageData.width + col) * 4,
                    (row * imageData.width + col) * 4 + 4
		);
		for (let x = 0; x < scale; x++) subLine.set(sourcePixel, x*4)
		for (let y = 0; y < scale; y++) {
                    const destRow = row * scale + y;
                    const destCol = col * scale;
                    scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4);
		}
            }
	}
	return scaled;
    }

    arc(x: number, y: number, width: number, height: number, startAngle: number, endAngle: number) {
	// Draw the pie:
	this.gc.strokeStyle = "";
	this.gc.beginPath();
	this.gc.moveTo(x, y);
	this.gc.arc(x, y, width, startAngle, endAngle);
	this.gc.lineTo(x, y);
	this.gc.fill();

	// Draw the arc:
	this.gc.strokeStyle = "";
	this.gc.beginPath();
	this.gc.arc(x, y, width, startAngle, endAngle);
	this.gc.stroke();
    }
}

export class Matrix extends Array {
    constructor(rows: number, cols: number, value: number = 0) {
	super(rows);
	for (let i = 0; i < rows; i++) {
	    this[i] = new Array(cols);
	    for (let j = 0; j < cols; j++) {
		this[i][j] = value;
	    }
	}
    }
}

export class Color {
    public red: number;
    public green: number;
    public blue: number;
    public alpha: number;

    constructor(red: number, green: number | null = null, blue: number | null = null, alpha: number | null = null) {
	this.red = red;
	if (green !== null)
	    this.green = green;
	else
	    this.green = red;
	if (blue !== null)
	    this.blue = blue;
	else
	    this.blue = red;
	if (alpha !== null)
	    this.alpha = alpha;
	else
	    this.alpha = 255;
    }

    toHex(c: number) {
	const hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
    }

    toString() {
	return "#" + this.toHex(this.red) + this.toHex(this.green) +
	    this.toHex(this.blue) + this.toHex(this.alpha);
    }
}

export class Point {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
	this.x = x;
	this.y = y;
    }
}

export class Line {
    public p1: Point;
    public p2: Point;

    constructor(p1: Point, p2: Point) {
	this.p1 = p1;
	this.p2 = p2;
    }
}

export class Picture {
    public width: number;
    public height: number;

    private imageData: ImageData;

    constructor(width: number, height: number) {
	this.width = width;
	this.height = height;
	this.imageData = new ImageData(this.width, this.height);
    }

    position(x: number, y: number): number {
	return (y * this.width * 4) + (x * 4);
    }

    set(x: number, y: number, color: Color) {
	const pos: number = this.position(x, y);
	this.imageData.data[pos + 0] = color.red;
	this.imageData.data[pos + 1] = color.green;
	this.imageData.data[pos + 2] = color.blue;
	this.imageData.data[pos + 3] = color.alpha;
    }

    get(x: number, y: number): number {
	return this.imageData.data[(x + y * this.width) * 4];
    }

    getData(): ImageData {
	return this.imageData;
    }
}
