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
    
    render() {
	this.el.classList.add('custom-widget');
	var canvas = document.createElement('canvas');
	canvas.width = 100;
	canvas.height = 100;
	this.el.appendChild(canvas)
	var context = canvas.getContext('2d')!;
	this.ctx = new GraphicsContext(context);
	//this.value_changed();
	this.model.on('change:x', this.x_changed, this);
	this.model.on('change:y', this.x_changed, this);
    }
    
    x_changed() {
	//this.el.textContent = this.model.get('value');
	var x = this.model.get('x');
	var y = this.model.get('y');
	this.ctx.lineTo(x,y);
	this.ctx.stroke();
	console.log(x,y);
    }
    
    y_changed() {
	//this.el.textContent = this.model.get('value');
	var x = this.model.get('x');
	var y = this.model.get('y');
	this.ctx.lineTo(x,y);
	this.ctx.stroke();
	console.log(x,y);
    }
}
