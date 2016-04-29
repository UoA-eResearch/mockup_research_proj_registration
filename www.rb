#!/usr/local/bin/ruby
#Run a website on port 9000, so we can test the html/json without getting cross site scripting errors from Chrome.
require 'webrick'

root = File.dirname(__FILE__)
server = WEBrick::HTTPServer.new :Port => 9000, :DocumentRoot => root
server.start

