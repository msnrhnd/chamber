#!/usr/bin/env python2.7
# -*- coding:utf-8 -*-

import cgi
import cgitb
import os
import json
import fnmatch
cgitb.enable()
form = cgi.FieldStorage()
ROOT_DIR = os.path.dirname(__file__)

def getTree(path):
    if fnmatch.fnmatch(path, '*.js') or os.path.isdir(path):
        d = {'text': os.path.splitext(os.path.basename(path))[0]}
        if os.path.isdir(path):
            children = [getTree(os.path.join(path, x)) for x in os.listdir(path)]
            d['icon'] = 'fa fa-folder'
            d['children'] = [x for x in children if x is not None]
        else:
            d['icon'] = 'fa fa-file'
            d['a_attr'] = {'path': path.split('../')[1], 'class': 'load'}
        return d

if form['action'].value == 'init':
    print 'Content-type: text/html; charset=utf-8\n'
    print json.dumps(getTree(os.path.join(ROOT_DIR, '..', form['mesh_dir'].value)))
elif form['action'].value == 'download':
#    proofprof.rebuildDocx(form['proofed_xml'].value, form['file-input'].file, form['filename'].value)
    print 'Content-type: text/html; charset=utf-8\n'







