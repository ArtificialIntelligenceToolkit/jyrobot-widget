#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Douglas Blank.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

import json

from ipywidgets import DOMWidget
from traitlets import Unicode, Integer
from ._frontend import module_name, module_version


class ExampleWidget(DOMWidget):
    """TODO: Add docstring here
    """
    _model_name = Unicode('ExampleModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('ExampleView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    config = Unicode('{}').tag(sync=True)
    update_int = Integer(0).tag(sync=True)
    draw_int = Integer(0).tag(sync=True)
    command = Unicode("").tag(sync=True)

    def update(self):
        self.update_int += 1

    def draw(self):
        self.draw_int += 1

    def set_robot(self, index, vx, vy, va):
        self.command = json.dumps({"index": index, "vx": vx, "vy": vy, "va": va})
