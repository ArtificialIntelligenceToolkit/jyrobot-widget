import {Color} from "./utils";

export class Hit {
    public distance: number;
    public x: number;
    public y: number;
    public start_x: number;
    public start_y: number;
    public color: Color;
    public height: number;

    constructor(height: number, x: number, y: number, distance: number, color: Color,
		start_x: number, start_y: number) {
	this.height = height;
	this.x = x;
	this.y = y;
	this.distance = distance;
	this.color = color;
	this.start_x = start_x;
	this.start_y = start_y;
    }
}
