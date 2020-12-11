#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Douglas Blank
# Distributed under the terms of the Modified BSD License.

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'nbextension/static',
        'dest': 'jyrobot',
        'require': 'jyrobot/extension'
    }]
