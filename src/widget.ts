// Copyright (c) {{ cookiecutter.author_name }}
// Distributed under the terms of the Modified BSD License.
import {
    GraphicsContext
} from '@lumino/datagrid';

import {
    DOMWidgetModel,
    DOMWidgetView,
    ISerializers,
} from '@jupyter-widgets/base';

import { MODULE_NAME, MODULE_VERSION } from './version';
import { World } from './World';

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
	    x: 0,
	    y: 0,
	    world: "",
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
    private ctx: GraphicsContext;
    private world: World;
    private world_json: any;
    
    render() {
	this.el.classList.add('jyrobot-widget');
	var canvas = document.createElement('canvas');
	canvas.width = 100;
	canvas.height = 100;
	this.el.appendChild(canvas)
	var context = canvas.getContext('2d')!;
	this.ctx = new GraphicsContext(context);

	this.model.on('change:x', this.x_changed, this);
	this.model.on('change:y', this.x_changed, this);
	this.model.on('change:world', this.world_changed, this);
    }
    
    x_changed() {
	//this.el.textContent = this.model.get('value');
	var x = this.model.get('x');
	var y = this.model.get('y');
	this.ctx.lineTo(x,y);
	this.ctx.stroke();
	console.log("x:", x);
    }
    
    y_changed() {
	//this.el.textContent = this.model.get('value');
	var x = this.model.get('x');
	var y = this.model.get('y');
	this.ctx.lineTo(x,y);
	this.ctx.stroke();
	console.log("yy", y);
    }

    world_changed() {
	var world_str = this.model.get('world');
	console.log("world_str:", world_str);
	this.world_json = JSON.parse(world_str);
	this.world = new World(this.world_json);
	console.log("world:", this.world);
    }
}
