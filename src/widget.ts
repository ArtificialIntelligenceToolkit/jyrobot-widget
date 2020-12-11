// Copyright (c) {{ cookiecutter.author_name }}
// Distributed under the terms of the Modified BSD License.
import {
    DOMWidgetModel,
    DOMWidgetView,
    ISerializers,
} from '@jupyter-widgets/base';

import { MODULE_NAME, MODULE_VERSION } from './version';
import { World } from './World';
import { Robot } from './Robot';
import { Canvas } from './utils';

// Import the CSS
import '../css/widget.css';

export class ExampleModel extends DOMWidgetModel {
    defaults() {
	return {
	    ...super.defaults(),
	    _model_name: ExampleModel.model_name,
	    _model_module: ExampleModel.model_module,
	    _model_module_version: ExampleModel.model_module_version,
	    _view_name: ExampleModel.view_name,
	    _view_module: ExampleModel.view_module,
	    _view_module_version: ExampleModel.view_module_version,
	    config: "{}",
	    update_int: 0,
	    draw_int: 0,
	};
    }

    static serializers: ISerializers = {
	...DOMWidgetModel.serializers,
	// Add any extra serializers here
    };

    static model_name = 'ExampleModel';
    static model_module = MODULE_NAME;
    static model_module_version = MODULE_VERSION;
    static view_name = 'ExampleView'; // Set to null if no view
    static view_module = MODULE_NAME; // Set to null if no view
    static view_module_version = MODULE_VERSION;
}

export class ExampleView extends DOMWidgetView {
    private world: World;
    private _canvas: HTMLCanvasElement;
    private canvas: Canvas;
    private time: number = 0.0;

    render() {
	this.el.classList.add('jyrobot-widget');
	this._canvas = document.createElement('canvas');
	this.el.appendChild(this._canvas)

	this.model.on('change:config', this.config_changed, this);
	this.model.on('change:update_int', this.update_changed, this);
	this.model.on('change:draw_int', this.draw_changed, this);
	this.model.on('change:command', this.command_changed, this);
	this.config_changed();
    }

    config_changed() {
	var config_str = this.model.get('config');
	console.log("config_str:", config_str);
	var config = JSON.parse(config_str);
	this.world = new World(config);
	this.canvas = new Canvas(this._canvas, config.width || 500, config.height || 250, 1.0);
	this.world.draw(this.canvas);
    }

    update_changed() {
	this.time += 0.05;
	this.world.update(this.time);
	for (let robot of this.world.robots) {
	    console.log("robot:", robot.name, robot.x, robot.x, robot.direction);
	}
    }

    draw_changed() {
	this.world.draw(this.canvas);
    }

    command_changed() {
	var command_str = this.model.get('command');
	console.log("command_str:", command_str);
	var command = JSON.parse(command_str);
	this.world.robots[command.index].setConfig(command);
    }
}
