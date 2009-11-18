#!/opt/local/bin/ruby
#!/usr/local/bin/ruby19

version = "0.1"

require 'wiphoto'
require 'json'
require 'optparse'
require 'ostruct'

options = OpenStruct.new
options.iPhotoLib = File.expand_path(File.join("~","Pictures","iPhoto Library"))


OptionParser.new do |opts|
  opts.separator ""
  opts.banner = "Usage: #{File.basename __FILE__} [options]"
  opts.separator ""
  opts.on('-v', '--version', "Print version")    { p version ; exit 0 }
  opts.on('-d', '--dir DIR', String, "Path to iPhotoLibrary folder") { |d| options.iPhotoLib = d }
  opts.on_tail("-h", "--help", "Show this message") { puts opts; exit }
end.parse!

iphoto = WIPhoto.new options.iPhotoLib

pkg = File.join(File.expand_path(File.dirname(__FILE__)), "install.zip")

system("cd '#{iPhotoLib}'; unzip -o #{pkg}") rescue raise "Can not unzip distribution file #{pkg}: #{$!}"
File.symlink("#{iPhotoLib}/wiphoto/index.html",iPhotoLib) unless File.exists? iPhotoLib

albums = iphoto.albums
photos = iphoto.photos

File.open(File.join(iPhotoLib,"wiphoto/js/albums.js"), 'w'){|f| f.print "albums = " + albums.to_json + ";\n" }
File.open(File.join(iPhotoLib,"wiphoto/js/photos.js"), "w"){|f| f.print "photos= " + photos.to_json + ";\n" }

