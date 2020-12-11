import {Color, Picture, Canvas} from "./utils";
import {Hit} from "./Hit";
import {Robot} from './Robot';

export class RangeSensor {
    /*
       A range sensor that reads "reading" when
       no obstacle has been detected. "reading" is
       a ratio of distance/max, and "distance" is
       the reading in CM.
    */
    public max: number = 20; // CM
    public reading: number = 1.0;
    public distance: number;
    public direction: number;
    public position: number;
    public width: number; // radians
    public p1: number[];
    public time: number = 0;
    public robot: Robot;

    constructor(robot: Robot, config: any) {
	this.robot = robot;
	this.position = config.position || 10;
	this.direction = config.direction || 0;
	this.max = config.max || 100;
	this.width = config.width || 1.0;
	this.distance = this.reading * this.max;
    }

    update(time: number) {
	let p: number[] = this.robot.rotateAround(
	    this.robot.x, this.robot.y, this.position, this.robot.direction + this.direction);
	this.setReading(1.0);
	// FIXME: width in radians
	if (this.width !== 0) {
	    for (let incr = -this.width/2; incr <= this.width/2; incr += this.width/2) {
		let hit: Hit = this.robot.castRay(
		    p[0], p[1], -this.robot.direction + Math.PI/2.0  + incr,
		    this.max, true);
		if (hit) {
		    if (hit.distance < this.getDistance()) {
			this.setDistance(hit.distance);
		    }
		}
	    }
	} else {
	    let hit: Hit = this.robot.castRay(
		p[0], p[1], -this.robot.direction + Math.PI/2.0,
		this.max, true);
	    if (hit) {
		if (hit.distance < this.getDistance()) {
		    this.setDistance(hit.distance);
		}
	    }
	}
    }

    draw(canvas: Canvas) {
	if (this.getReading() < 1.0) {
	    canvas.strokeStyle(new Color(255), 1);
	} else {
	    canvas.strokeStyle(new Color(0), 1);
	}
	canvas.fill(new Color(128, 0, 128, 64));
	let p1 = this.robot.rotateAround(this.robot.x, this.robot.y, this.position, this.robot.direction + this.direction);
	let dist = this.getDistance();
	if (this.width > 0) {
	    canvas.arc(p1[0], p1[1], dist, dist,
		       this.robot.direction - this.width/2,
		       this.robot.direction + this.width/2);
	} else {
	    const end: number[] = this.robot.rotateAround(p1[0], p1[1], dist, this.direction + this.direction);
	    canvas.line(p1[0], p1[1], end[0], end[1]);
	}
    }

    getDistance() {
	return this.distance;
    }

    getReading() {
	return this.reading;
    }

    setDistance(distance: number) {
	this.distance = distance;
	this.reading = distance/this.max;
    }

    setReading(reading: number) {
	this.reading = reading;
	this.distance = reading * this.max;
    }
}

export class Camera {
    public cameraShape: number[];
    public camera: Hit[];
    public robotHits: Hit[][];
    public robot: Robot;
    public colorsFadeWithDistance: number; // 0 = no fade, 1.0 = max fade
    public angle: number; // degrees

    constructor(robot: Robot, config: any) {
	this.robot = robot;
	this.cameraShape = [config.width || 256, config.height || 128];
	this.colorsFadeWithDistance = config.colorsFadeWithDistance || 1.0;
	this.angle = config.angle || 60; // in degrees
	this.camera = new Array(this.cameraShape[0]);
	this.robotHits = new Array(this.cameraShape[0]);
    }

    update(time: number) {
	for (let i=0; i<this.cameraShape[0]; i++) {
	    const angle: number = i/this.cameraShape[0] * this.angle - this.angle/2;
	    this.camera[i] = this.robot.castRay(
		this.robot.x, this.robot.y,
		Math.PI/2 -this.robot.direction - angle*Math.PI/180.0, 1000, false);
	}
	// Only needed if other robots:
	for (let i=0; i<this.cameraShape[0]; i++) {
	    const angle: number = i/this.cameraShape[0] * this.angle - this.angle/2;
	    this.robotHits[i] = this.robot.castRayRobot(
		this.robot.x, this.robot.y,
		Math.PI/2 -this.robot.direction - angle*Math.PI/180.0, 1000);
	}
    }

    draw(canvas: Canvas) {
	canvas.fill(new Color(0, 64, 0));
	canvas.strokeStyle(null, 0);
	canvas.rect(5.0, -3.33, 1.33, 6.33);
    }

    takePicture(): Picture {
	const pic: Picture = new Picture(this.cameraShape[0], this.cameraShape[1]);
	const size: number = Math.max(this.robot.world.w, this.robot.world.h);
	let hcolor: Color | null = null;
	// draw non-robot walls first:
	for (let i=0; i < this.cameraShape[0]; i++) {
	    const hit: Hit = this.camera[i];
	    let high: number;
	    hcolor = null;
	    if (hit) {
		const s: number = Math.max(Math.min(1.0 - hit.distance/size, 1.0), 0.0);
		const sc: number = Math.max(Math.min(1.0 - hit.distance/size * this.colorsFadeWithDistance, 1.0), 0.0);
		const r: number = hit.color.red;
		const g: number = hit.color.green;
		const b: number = hit.color.blue;
		hcolor = new Color(r * sc, g * sc, b * sc);
		high = (1.0 - s) * this.cameraShape[1];
	    } else {
		high = 0;
	    }
	    for (let j = 0; j < this.cameraShape[1]; j++) {
		if (j < high/2) { // sky
		    pic.set(i, j, new Color(0, 0, 128));
		} else if (j < this.cameraShape[1] - high/2) { // hit
		    if (hcolor !== null)
			pic.set(i, j, hcolor);
		} else { // ground
		    pic.set(i, j, new Color(0, 128, 0));
		}
	    }
	}
	// Other robots, draw on top of walls:
	for (let i=0; i < this.cameraShape[0]; i++) {
	    const hits: Hit[] = this.robotHits[i];
	    hits.sort((a, b) => b.distance - a.distance); // further away first
	    for (let hit of hits) {
		if (this.camera[i] && (hit.distance > this.camera[i].distance))
		    // Behind this wall
		    break;
		const s: number = Math.max(Math.min(1.0 - hit.distance/size, 1.0), 0.0);
		const sc: number = Math.max(Math.min(1.0 - hit.distance/size * this.colorsFadeWithDistance, 1.0), 0.0);
		const distance_to: number = this.cameraShape[1]/2 * (1.0 - s);
		const height: number = 30 * s;
		const r: number = hit.color.red;
		const g: number = hit.color.green;
		const b: number = hit.color.blue;
		hcolor = new Color(r * sc, g * sc, b * sc);
		for (let j=0; j < height; j++) {
		    pic.set(i, this.cameraShape[1] - j - 1 - Math.round(distance_to), hcolor);
		}
	    }
	}
	return pic;
    }
}

export class DepthCamera extends Camera {
    public reflectGround: boolean;
    public reflectSky: boolean;

    constructor(robot: Robot, config: any) {
	super(robot, config);
	this.reflectGround = config.reflectGround || true;
	this.reflectSky = config.reflectGround || false;
    }

    takePicture(): Picture {
	const pic: Picture = new Picture(this.cameraShape[0], this.cameraShape[1]);
	const size: number = Math.max(this.robot.world.w, this.robot.world.h);
	let hcolor: Color | null = null;
	// draw non-robot walls first:
	for (let i=0; i < this.cameraShape[0]; i++) {
	    const hit: Hit = this.camera[i];
	    let high: number;
	    hcolor = null;
	    if (hit) {
		const s: number = Math.max(Math.min(1.0 - hit.distance/size, 1.0), 0.0);
		const sc: number = Math.max(Math.min(1.0 - hit.distance/size * this.colorsFadeWithDistance, 1.0), 0.0);
		hcolor = new Color(255 * sc);
		high = (1.0 - s) * this.cameraShape[1];
	    } else {
		high = 0;
	    }
	    const horizon = this.cameraShape[1]/2;
	    for (let j = 0; j < this.cameraShape[1]; j++) {
		let sky = Math.max(Math.min(1.0 - j/horizon * this.colorsFadeWithDistance, 1.0), 0.0);
		let ground = Math.max(Math.min((j - horizon)/horizon * this.colorsFadeWithDistance, 1.0), 0.0);
		if (j < high/2) { // sky
		    if (this.reflectSky) {
			let color = new Color(255 - (255 * sky));
			pic.set(i, j, color);
		    }
		} else if (j < this.cameraShape[1] - high/2) { // hit
		    if (hcolor !== null)
			pic.set(i, j, hcolor);
		} else { // ground
		    if (this.reflectGround) {
			let color = new Color(255 * ground);
			pic.set(i, j, color);
		    }
		}
	    }
	}
	// Other robots, draw on top of walls:
	for (let i=0; i < this.cameraShape[0]; i++) {
	    const hits: Hit[] = this.robotHits[i];
	    hits.sort((a, b) => b.distance - a.distance); // further away first
	    for (let hit of hits) {
		if (this.camera[i] && (hit.distance > this.camera[i].distance))
		    // Behind this wall
		    break;
		const s: number = Math.max(Math.min(1.0 - hit.distance/size, 1.0), 0.0);
		const sc: number = Math.max(Math.min(1.0 - hit.distance/size * this.colorsFadeWithDistance, 1.0), 0.0);
		const distance_to: number = this.cameraShape[1]/2 * (1.0 - s);
		const height: number = 30 * s;
		hcolor = new Color(255 * sc);
		for (let j=0; j < height; j++) {
		    pic.set(i, this.cameraShape[1] - j - 1 - Math.round(distance_to), hcolor);
		}
	    }
	}
	return pic;
    }
}
