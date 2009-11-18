#!/opt/local/bin/ruby

require 'sqlite3'
require 'yaml'

class WIPhoto
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

end

