#!/usr/bin/python
# -*- coding:utf-8 -*-

import cgi
import BaseHTTPServer, CGIHTTPServer

PORT = 8089
Handler = CGIHTTPServer.CGIHTTPRequestHandler
httpd = BaseHTTPServer.HTTPServer(('127.0.0.1', PORT), Handler)
httpd.serve_forever()
