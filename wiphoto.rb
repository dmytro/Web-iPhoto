#!/opt/local/bin/ruby
#!/usr/local/bin/ruby19

version = "0.1a"

require 'json'
require 'optparse'
require 'ostruct'
require 'sqlite3'
require 'yaml'

class WIPhoto

#   def main(argv)
#     options = OpenStruct.new
#     options.iPhotoLib = File.expand_path(File.join("~","Pictures","iPhoto Library"))
#     options.install = false
#     options.data = false
#     options.mkzip = false
    
#     opts = OptionParser.new do |opts|
#       opts.separator ""
#       opts.banner = "Usage: #{File.basename __FILE__} [options]"
#       opts.separator ""
#       opts.on('-v', '--version', "Print version")    { puts "Version: #{version}" ; exit 0 }
#       opts.on('--do x,y,z', Array, 
#               "Script action: ",
#               "   install:  Install wiPhoto files in iPhoto Library",
#               "   data:     Create wiPhoto data files in iPhoto Library",
#               "   mkzip:    Create installation ZIP file",
#               "   all:      all of the actions above"
#               ) { |list|
#         list.each { |i|
#           options.install = true if i == 'install' or i == 'all'
#           options.data = true if i == 'data' or i == 'all'
#           options.mkzip = true if i == 'mkzip' or i == 'all'
#         }
#       }
#       opts.on('-D', '--dir DIR', String, "Path to iPhotoLibrary folder. (~/Pictures/iPhoto Library by default.)") { 
#         |d| options.iPhotoLib = d }
#       opts.on_tail("-h", "--help", "Show this message") { puts opts; exit }
#     end
#     opts.parse!

#   end

  attr_accessor :config

  def initialize iPhotoDir
    dbpath = File.join iPhotoDir, "iPhotoMain.db"
    @db = SQLite3::Database.new dbpath rescue raise "Cannot open iPhoto database file #{dbpath}" 
    @db.type_translation = true
    @config = YAML::load_file File.join( File.dirname(__FILE__), 'config.yml')
    @albums = {} # 
    @photos = {} # { key: { path_to_image, path_to_thumb}}
  end

  def albums
    @db.execute(@config['albums']['names']).each { |primaryKey,name|
      @albums[primaryKey] = {}
      @albums[primaryKey]['name'] = name
      @albums[primaryKey]['photos'] = Array.new
      @db.execute(eval '"'+@config['albums']['photos']+'"').each { |photo|
        @albums[primaryKey]['photos'] << photo[0]
      }
    }
    @albums
  end	

  def photos
    photos = []
    @albums.keys.each { |albumid|
      photos.concat @albums[albumid]['photos']
    }
    photos.uniq!.each { |photoKey|
      @photos[photoKey] = {}
      ['thumb','image'].each { |l|
        @photos[photoKey][l] = {}
        select = eval '"' + @config['photos'][l] +'"'
        @photos[photoKey][l]['path'] = @db.execute(eval '"'+@config['photos']['path'] +'"')[0][0]
        @photos[photoKey][l]['dim'] = @db.execute(eval '"'+@config['photos']['dimensions'] +'"')[0][0..1]
      }
    }
    @photos
  end

#   def install
#     pkg = File.join(File.expand_path(File.dirname(__FILE__)), "install.zip")
#     system("cd '#{iPhotoLib}'; unzip -o #{pkg}") rescue raise "Can not unzip distribution file #{pkg}: #{$!}"
#     File.symlink("#{iPhotoLib}/wiphoto/index.html",iPhotoLib) unless File.exists? iPhotoLib
#   end

#   def data
#     albums = iphoto.albums
#     photos = iphoto.photos
#     File.open(File.join(iPhotoLib,"wiphoto/js/albums.js"), 'w'){|f| f.print "albums = " + albums.to_json + ";\n" }
#     File.open(File.join(iPhotoLib,"wiphoto/js/photos.js"), "w"){|f| f.print "photos= " + photos.to_json + ";\n" }
#   end
end


options = OpenStruct.new
options.iPhotoLib = File.expand_path(File.join("~","Pictures","iPhoto Library"))
options.install = false
options.data = false
options.mkzip = false

opts = OptionParser.new do |opts|
  opts.separator ""
  opts.banner = "Usage: #{File.basename __FILE__} [options]"
  opts.separator ""
  opts.on('-v', '--version', "Print version")    { puts "Version: #{version}" ; exit 0 }
  opts.on('--do x,y,z', Array, 
          "Script action: ",
          "   install:  Install wiPhoto files in iPhoto Library",
          "   data:     Create wiPhoto data files in iPhoto Library",
          "   mkzip:    Create installation ZIP file",
          "   all:      all of the actions above"
          ) { |list|
    list.each { |i|
      options.install = true if i == 'install' or i == 'all'
      options.data = true if i == 'data' or i == 'all'
      options.mkzip = true if i == 'mkzip' or i == 'all'
    }
  }
  opts.on('-D', '--dir DIR', String, "Path to iPhotoLibrary folder. (~/Pictures/iPhoto Library by default.)") { 
    |d| options.iPhotoLib = d }
  opts.on_tail("-h", "--help", "Show this message") { puts opts; exit }
end
opts.parse!

unless options.install or options.data or options.mkzip then 
  puts "\nPlease specify one of install, data or mkzip with --do option\n\n"; 
  puts opts.to_s
  exit
end


iphoto = WIPhoto.new options.iPhotoLib

if options.install
  pkg = File.join(File.expand_path(File.dirname(__FILE__)), "install.zip")
  system("cd '#{options.iPhotoLib}'; unzip -o #{pkg}") rescue raise "Can not unzip distribution file #{pkg}: #{$!}"
  File.symlink("#{options.iPhotoLib}/wiphoto/index.html",options.iPhotoLib) unless File.exists? options.iPhotoLib
end

if options.data
  albums = iphoto.albums
  photos = iphoto.photos
  File.open(File.join(options.iPhotoLib,"wiphoto/js/albums.js"), 'w'){|f| f.print "albums = " + albums.to_json + ";\n" }
  File.open(File.join(options.iPhotoLib,"wiphoto/js/photos.js"), "w"){|f| f.print "photos= " + photos.to_json + ";\n" }
end

if options.mkzip
  system (['zip', '-r', iphoto.config['install']['zip'], iphoto.config['install']['files'],'-x', iphoto.config['install']['exclude']].join(' '))
end
