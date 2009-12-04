
wiPhoto
==========

Web iPhoto (or wiPhoto) is a client side web album application. Main
use for it is thought to browse iPhoto picture collections in web
browser without need of iPhoto application.

Why would somebody need tool like this? There could be several reasons: 

- I want to present my iPhoto collection on the web for me or other to
  see it. (Attention: wiPhoto does not offer any means of security, it
  not in the scope of this program);

- I want to make backup of my iPhoto library, burn it on CD or DVD and
  be able to browse it without need to re-import everything back into
  iPhoto;

- I want to have access to my photo collections from other OS's, in my
  case Linux server or desktops.


When wiPhoto creates albums image files are not copied to other
location on the hard disk.  wiPhoto parses several iPhoto data files
(SQLite database files and/or XML files) and generates JSON file with
links to location on the hard disk. There is very low overhead in the
terms of disk storage for the albums.

Additionally wiPhoto produces all necessary Java-script code, CSS for
browsing, slide-shows etc. All this is stored in sub-directory inside
the iPhoto Library folder.

Once HTML files created there's no need for server-side
application. All is happening in the web browser only.


Other uses
-----------

Any collection of photo images on the disk can be used together with
wiPhoto, not just iPhoto libraries. As long as you have photo files
(JPEG's or other common formats) on a disk -- better if images are
accompanied by smaller thumbnail file -- wiPhoto can be used to browse
photos. You can generate JSON files with links to photos and
thumbnails, unzip wiPhoto distribution at the top level.

Please see details of data formats of albums.js and photos.js files.

Data formats
------------

albums.js contains JSON formatted hash:

albums =
   {
    "<ALBUM_INDEX>":{"name":"<Album_Name>",
         "photos":[ <ALBUM_PHOTOS_KEYS> ]
       },

    };

Where

        <ALBUM_INDEX>: Integer
        <Album_Name>: string
        <ALBUM_PHOTOS_KEYS>: array of Integers



photos.js contains JSON formatted data structure, which is description
of photo image files. 

photos= 
  {
      "982": <--- photo key
      {"thumb": {
                  "path":"Data\/2009\/Sep 22, 2009\/IMG_2626.jpg",
                  "dim":[360.0,240.0] <-- width,height
                 },
       "image":{
                 "path":"Originals\/2009\/Sep 22, 2009\/IMG_2626.JPG", 
                 "dim":[3072.0,2048.0]
                }
                
       }, ...
  };

Each photo key corresponds to key in <ALBUM_PHOTOS_KEYS> array in
albums.js <ALBUM_INDEX> and photo key can have any integer value.
Indexes should be unique, specific value does not matter.

Path should be relative to index.html file

Design
----------

Following goals were pursued in development of wiPhoto :

* Very minimal index.html file, that does not change.

* All data are stored in auto-generated JSON files - albums.js and
  photos.js;

* Look and feel heavily relies on CSS instead on HTML markup; 

* Java-script to provide normal application type interaction (keybord
  use for navigation, do not rely heavily on mouse). Application
  should look like application, not like web page.

Author
--------------------
Dmytro Kovalov,
dmytro.kovalov@gmail.com
2009
