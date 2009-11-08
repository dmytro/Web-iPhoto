#!/opt/local/bin/ruby

require 'wiphoto'
require 'json'

iphoto = WIPhoto.new
albums = iphoto.albums
photos = iphoto.photos

File.open("js/albums.js", 'w'){|f| f.print "albums = " + albums.to_json + ";\n" }
File.open("js/photos.js", "w"){|f| f.print "photos= " + photos.to_json + ";\n" }

