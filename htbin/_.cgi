#!/usr/bin/env python2.7
# -*- coding:utf-8 -*-

import cgi
import cgitb
import os
import json
import fnmatch
cgitb.enable()
form = cgi.FieldStorage()

def getFilename(mesh_dir):
    ROOT_DIR = os.path.dirname(__file__)
    MESH_DIR = os.path.join(ROOT_DIR, '../', mesh_dir)
    paths = []
    for root, dirnames, filenames in os.walk(MESH_DIR):
        for filename in fnmatch.filter(filenames, '*.js'):
            path = os.path.join(root, filename)
            paths.append(path)
    return paths

if form['action'].value == 'init':
    print 'Content-type: text/html; charset=utf-8\n'
    print json.dumps(getFilename(form['mesh_dir'].value))
elif form['action'].value == 'download':
#    proofprof.rebuildDocx(form['proofed_xml'].value, form['file-input'].file, form['filename'].value)
    print 'Content-type: text/html; charset=utf-8\n'
