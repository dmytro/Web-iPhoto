
keyCode = { 32:'space',33:'pgup',34:'pgdown',35:'end',36:'home',37:'left',38:'up',39:'right',40:'down',27:'escape',9:'tab',13:'enter',48:'0',
            83:'s'
          };
wiphoto = {defaults: { navigation_width: 200, thumb_size:120, slideShowSpeed:1}}

wiphoto = {
    defaults: wiphoto.defaults,
    template: {
        'menuItem':
        '<A ID="navMenu_${album}" CLASS="menuItem" HREF="JAVASCRIPT:wiphoto.photo.thumb.show(${album},0);">${albums[album]["name"]}</A>',
        // ----------------------------------------
        'albumThumb':
        
        '<A HREF="JAVASCRIPT:wiphoto.photo.thumb.show(${album});">'+
            '<SPAN ID="albumThumb_${album}" CLASS="albumThumb">'+
            '<IMG ID="albumThumb_img_${album}" CLASS="albumThumb_img" WIDTH="${dim[0]}" HEIGHT="${dim[1]}" SRC="${photos[albums[album]["photos"][0]]["thumb"]["path"]}">'+
            '<DIV STYLE="WIDTH: ${wiphoto.thumb.size+10}">${albums[album]["name"]} (${albums[album]["photos"].length})'+
            '</DIV></SPAN></A>',
        // ----------------------------------------
        'thumb':
        '<A HREF="JAVASCRIPT:wiphoto.photo.setmode(${album},${i});">'+
            '<IMG ID="thumb_${album}_${i}" CLASS="thumb" WIDTH="${dim[0]}" HEIGHT="${dim[1]}" SRC="${photos[key]["thumb"]["path"]};"></A>',
        // ----------------------------------------
        'photo':
        '<CENTER><IMG WIDTH="${dim[0]}" HEIGHT="${dim[1]}" NAME="SlideShow" ID="showPhoto" SRC="${photos[key]["image"]["path"]}"></CENTER>'
    },
    // ------------------------------------------------------------
    album: {
        current: 0,
        _selected:false,
        selected: function(a) {
            with (wiphoto.album) {
                if (a) {
                    if ($("navMenu_"+_selected)) $("navMenu_"+_selected).removeClassName('selected')
                    $("navMenu_"+a).addClassName('selected');
                    if (wiphoto.mode() == 'albumThumb') {
                        if ($("albumThumb_img_"+_selected)) $("albumThumb_img_"+_selected).removeClassName('selected')
                        $("albumThumb_img_"+a).addClassName('selected')
                    }
                    current = a
                    _selected = a
                }
                return (_selected)
            }
        },
        // ----------
        thumb: { // album.thumb
            show: function () {
                with(wiphoto) {
                    mode('albumThumb');
                    parse = TrimPath.parseTemplate

                    $('viewPanel').update('')
                    $('albumdata').update('')

	            for (var a in albums) {
                        menu = new Element('div')
                        link = new Element('span')
                        menu.update(parse(template.menuItem).process({'album': a, 'albums': albums}))
    	                $('albumdata').insert(menu)


                        X = photo.thumb.size
                        dim = fitInto( X, X, photos[albums[a]['photos'][0]]['thumb']);
                        link.update(parse(template.albumThumb).process({'wiphoto':wiphoto,'photos':photos,'dim':dim,'album': a, 'albums': albums}))
                        $('viewPanel').insert(link)
	            }
                }
            }
        }
    },
    // ------------------------------------------------------------
    // Display PHOTO both manual and slide show mode
    //
    photo: {
        current: 0,
        show: function (a,p) {
            with(wiphoto){
                photo.current = (p==0) ?0 :(p || photo.current)
                album.current = a || album.current
                with (wiphoto.photo) { //load +/- 1 image into cache
                    preload(next())
                    preload(prev())
                }
	        w = $('viewPanel').clientWidth -20 
	        h = $('viewPanel').clientHeight -20
                key = albums[album.current].photos[photo.current];
	        dim = fitInto(w,h,photos[key]['image']);
 	        $('viewPanel').innerHTML = TrimPath.parseTemplate(template.photo).process({'dim':dim, 'key':key, 'photos':photos})
            }
        },
        preload: function(i) {
            key = albums[wiphoto.album.current].photos[i]
            wiphoto.preload[key] = new Image ()
            wiphoto.preload[key].src = photos[key].image.path
        },
        last:    function () { return (albums[wiphoto.album.current].photos.length-1) },
        next:    function () { with(wiphoto.photo) {return ( (current == last()) ? 0 :current+1 ) }},
        prev:    function () { with(wiphoto.photo) {return ( (current == 0) ? last():current-1 ) }},
        setmode: function(a,i)  { wiphoto.mode('photo'); show(a,i) },
        // photo.thumb
        thumb: {
            size: wiphoto.defaults.thumb_size,
            _selected: 0,
            selected: function(a,t) {
                a = a || wiphoto.album.current
                t = (t==0) ? 0 : t || wiphoto.photo.current
                with(wiphoto.photo.thumb) {
                    if (_selected) $(_selected).removeClassName('selected')
                    _selected = 'thumb_'+a+'_'+t
                    $(_selected).addClassName('selected')
                    $(_selected).scrollIntoView(false)
                    if (wiphoto.mode('thumb')) {
                        wiphoto.photo.current = t 
                        wiphoto.photo.preload(t)
                    }
                    return (_selected)
                }
            },
            show: function(a,t) {
                with(wiphoto) {
                    mode('thumb');
                    album.current = a || album.current;
                    photo.current = (t==0) ?0 :(t || photo.current); 
                    
                    album.selected(album.current)
                    
	            arr = albums[album.current].photos;	
	            $('viewPanel').innerHTML = '';
	            for (var i=0; i< arr.length; i=i+1) {
	                key=arr[i];
                        dim = fitInto(photo.thumb.size, photo.thumb.size, photos[key].thumb);
	                $('viewPanel').innerHTML +=
	                TrimPath.parseTemplate(template.thumb).process(
		            {'key': key, 'i': i, 'album': album.current, 'photos': photos, "albums": albums, 'dim':dim}
	                )
	            }
                    photo.thumb.selected (album.current, photo.current);
                }
            }
        }
    },
    // --------------------------------------------------------------------------------
    // ------------------------------------------------------------
    // hash of preloaded images for slide show
    preload: {},
    // ------------------------------------------------------------
    mode: function(mode) {
        if(mode) {
            wiphoto._mode = mode;
            switch (mode) {
            case 'photo':
            case 'thumb': 
            case 'slide': 
                next = wiphoto.photo.next; 
                prev = wiphoto.photo.prev; 
                show = wiphoto.photo.show; 
                play = slideShow.play;
                break;

            case 'albumThumb':
                next = false;
                prev = false;
                play = slideShow.play;
                break;
            }
            if(mode != 'slide') slideShow.stop()
        }
        return (wiphoto._mode)
    }
    // ------------------------------------------------------------
}

              
              function fitInto (w,h,image) { // Container width and height, photo width and height
                  proportion = Math.max(image['dim'][0]/w,image['dim'][1]/h);
	          return([image['dim'][0]/proportion, image['dim'][1]/proportion])
              }
              
              // --------------------------------------------------------------------------------

              function KeyCheck (e) {
                  var KeyPress = (window.event) ? keyCode[event.keyCode] : keyCode[e.keyCode];
                  switch (wiphoto.mode()) {
                  case 'albumThumb':
                      switch(KeyPress) {
                      case 'enter': 
                      case 's': 
                          slideShow.play(); break;
                      case 'space': wiphoto.photo.thumb.show(); break;
                      }
                      break
                  case 'photo':
                      switch(KeyPress) {
                      case 'left': show(null,prev()); break;
                      case 'right': 
                      case 'space':  show(null,next()); break;
                      case 'escape': wiphoto.photo.thumb.show(); break;
                      case 'enter': slideShow.play(); break;
                      }
                      break
                  case 'thumb':
                      with(wiphoto.photo.thumb) {
                          switch(KeyPress) {
                              
                          case 'pgup': 
                          case '0':      selected(null, 0); break;
                          case 'right':  selected(null, wiphoto.photo.next()); break;
                          case 'left':   selected(null, wiphoto.photo.prev()); break;
                          case 'pgdown': selected(null, wiphoto.photo.last()); break;
                              
                          case 'space': wiphoto.photo.setmode();break;
                          case 'enter': slideShow.play(); break;
                              
                          case 'escape': wiphoto.album.thumb.show(); break;
                          }
                      }
                      break
                  case 'slide':
                      with (slideShow) {
                          switch(KeyPress) {
                          case 'escape': 
                              if (running) stop()
                              else wiphoto.photo.thumb.show()
                              break;
                          case 'space':
                          case 'enter': toggle(); break;
                          case 'right': show(null, window.next()); break;
                          case 'left':  show(null, window.prev()); break;
                          }
                      }
                  }
                  return (true);
              }
              

              // --------------------------------------------------------------------------------
              function init() {
                  wiphoto.album.thumb.show();
                  document.onkeyup = KeyCheck;       
                  wiphoto.album.selected(1289);
                  parse = TrimPath.parseTemplate
              }