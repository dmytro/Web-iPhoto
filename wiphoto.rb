#!/opt/local/bin/ruby
#!/usr/local/bin/ruby19

version = "0.1a"

require 'json'
require 'optparse'
require 'ostruct'
require 'sqlite3'
require 'yaml'

module WIPhoto
  class WIPhoto
    attr_accessor :config, :options, :parents
    
    def WIPhoto.main(argv)
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
      opts.parse!(argv)
      
      unless options.install or options.data or options.mkzip then 
        puts "\nPlease specify one of install, data or mkzip with --do option\n\n"; 
        puts opts.to_s
        exit
      end

      iphoto = WIPhoto.new options.iPhotoLib
      iphoto.options = options

      iphoto.mkzip    if options.mkzip
      iphoto.install  if options.install
      iphoto.data     if options.data
    end

    def initialize iPhotoLib
      @dbpath = File.join iPhotoLib, "iPhotoMain.db"
      @me = File.basename(__FILE__)
      @rundir = File.dirname(__FILE__)
      @datadir = File.join iPhotoLib,"wiphoto/js"
      @db = SQLite3::Database.new @dbpath rescue raise "Cannot open iPhoto database file #{@dbpath}" 
      @db.type_translation = true
      @config = YAML::load_file File.join( @rundir, 'config.yml')
      @albums = {} # 
      @photos = {} # { key: { path_to_image, path_to_thumb}}
      @parents = {}
    end

    def tree
      @db.execute('SELECT PrimaryKey FROM sqAlbum WHERE Parent = 0 AND PrimaryKey < 900000').each {|x|
        @parents[x[0]] = children x[0]
      }
      parents
    end


    def albums
      @db.execute(@config['albums']['names']).each { |primaryKey,name,parent,type|
        @albums[primaryKey] = {}
        @albums[primaryKey]['name'] = name
        @albums[primaryKey]['type'] = type
        @albums[primaryKey]['parent'] = parent
        @albums[primaryKey]['photos'] = []
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

    def install
      iPhotoLib = @options.iPhotoLib
      pkg = File.join(File.expand_path(File.dirname(__FILE__)), @config['install']['zip'])
      unless File.exists? pkg
        puts "\n\n#{pkg} file does not exists"
        puts "Maybe you need to run #{@me} --do mkzip first?\n\n"
        exit 2
      end
      system("cd '#{iPhotoLib}'; unzip -o #{pkg}") rescue raise "Can not unzip distribution file #{pkg}: #{$!}"
      File.symlink("#{iPhotoLib}/wiphoto/index.html",iPhotoLib) unless File.exists? iPhotoLib
    end

    def data
      @parents = tree
      @albums = albums
      @photos = photos
      iPhotoLib = @options.iPhotoLib
      unless File.directory? @datadir
        puts "\n\n#{@datadir} directory does not exists"
        puts "Maybe you need to run #{@me} --do install first?\n\n"
        exit 1
      end
      File.open(File.join(@datadir,"albums.js"), 'w'){|f| 
        f.print "tree = #{@parents.to_json};\n"
        f.print "albums = #{@albums.to_json};\n" 
      }
      File.open(File.join(@datadir,"photos.js"), "w"){|f| f.print "photos= " + @photos.to_json + ";\n" }
    end

    def mkzip
      system (['zip', '-r', 
               @config['install']['zip'], @config['install']['files'],
               '-x', @config['install']['exclude']
              ].join(' '))
      end
    private 
    
    def children(id)
      out = {}
      @db.execute("SELECT PrimaryKey FROM sqAlbum WHERE Parent = #{id}").each { |x|
        out[x[0]] = {}
      }
      out.keys.each { |x| out[x] = children x }
      out
    end
    
  end

end
# ----------------------------------------------------------
WIPhoto::WIPhoto.main(ARGV)
