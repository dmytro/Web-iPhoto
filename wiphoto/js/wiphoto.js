
keyCode = { 32:'space',33:'pgup',34:'pgdown',35:'end',36:'home',37:'left',38:'up',39:'right',40:'down',27:'escape',9:'tab',13:'enter',48:'0', 83:'s' }

// Define defaults here, so that can use them later on
wiphoto = { defaults: { navigation_width: 200, thumb_size:120, slideShowSpeed:1, partload: { startat: 30, firstload: 20, nextload: 10, delay: 0.1} } }

wiphoto = {
    defaults: wiphoto.defaults,
    template: {
        'menuAlbum':
        '<DIV CLASS="menuItem"><A ID="navMenu_${album}" HREF="JAVASCRIPT:wiphoto.photo.thumb.show(${album},0);">'+
            '<IMG CLASS="menu_icon" SRC="./wiphoto/images/album.png">${albums[album]["name"]}</A></DIV>',

        'menuFolder':
        '<DIV CLASS="menuItem">'+
            '<A ID="navMenu_${album}" HREF="JAVASCRIPT:wiphoto.menu.item.hide(${album});">'+
            '<IMG ID="closeTriangle_${album}" CLASS="menuOpen" SRC="./wiphoto/images/open.png">'+
            '<IMG CLASS="menu_icon" SRC="./wiphoto/images/folder.png">${albums[album]["name"]}</A></DIV>',
        // ----------------------------------------
        'albumThumb':
        
        '<A id="aThumbHREF_${album}" HREF="JAVASCRIPT:wiphoto.photo.thumb.show(${album});">'+
            '<SPAN ID="albumThumb_${album}" CLASS="albumThumb">'+
            '<IMG ID="albumThumb_img_${album}" CLASS="albumThumb_img" WIDTH="${dim[0]}" HEIGHT="${dim[1]}" SRC="${photos[albums[album]["photos"][0]]["thumb"]["path"]}">'+
            '<DIV STYLE="WIDTH: ${wiphoto.photo.thumb.size+10}">${albums[album]["name"]} (${albums[album]["photos"].length})</DIV></SPAN></A>',
        // ----------------------------------------
        'thumb':
        '<A id="t_href_${album}_${i}" HREF="JAVASCRIPT:wiphoto.photo.setmode(${album},${i});">'+
            '<IMG ID="thumb_${album}_${i}" CLASS="thumb" WIDTH="${dim[0]}" HEIGHT="${dim[1]}" SRC="${photos[key]["thumb"]["path"]}"></A>',
        // ----------------------------------------
        'photo':
        '<CENTER><IMG WIDTH="${dim[0]}" HEIGHT="${dim[1]}" NAME="SlideShow" ID="showPhoto" SRC="${photos[key]["image"]["path"]}"></CENTER>'
    },
    // ------------------------------------------------------------
    album: {
        current: 0,
        keys: [],
        _selected:false,
        selected: function(a) {
            with (wiphoto.album) {
                if (a) {
                    if ($("navMenu_"+_selected)) $("navMenu_"+_selected).removeClassName('selected')
                    if ($("navMenu_"+a)) $("navMenu_"+a).addClassName('selected');
                    if (wiphoto.mode() == 'albumThumb') {
                        if ($("albumThumb_img_"+_selected)) $("albumThumb_img_"+_selected).removeClassName('selected')
                        if ($("albumThumb_img_"+a)) $("albumThumb_img_"+a).addClassName('selected')
                    }
                    current = a
                    _selected = a
                    wiphoto.photo.preload(0)
                }
                return (_selected)
            }
        },
        first: function() { return wiphoto.album.keys[0]},
        last:  function() {  with(wiphoto.album) { return keys[keys.length-1]}},
        prev:  function() { 
            with(wiphoto.album) { 
                if (current == keys[0]) return last()
                for (i=0; i<=keys.length; i=i+1) {
                    if (current == keys[i]) return keys[i-1]
                }
            }
        },
        next:  function() {             
            with(wiphoto.album) { 
                if (current == last()) return first()
                for (i=0; i<=keys.length; i=i+1) {
                    if (current == keys[i]) return keys[i+1]
                }
            }
        },
        // ----------
        thumb: { // album.thumb
            show: function () {
                with(wiphoto) {
                    mode('albumThumb');
                    parse = TrimPath.parseTemplate

                    $('viewPanel').update('')

	            for (var a in albums) {

                        link = new Element('span')
                        X = photo.thumb.size
                        dim = photos[albums[a]['photos'][0]] ? fitInto( X, X, photos[albums[a]['photos'][0]]['thumb']) : [0,0];
                        
                        link.update(parse(template.albumThumb).process({'wiphoto':wiphoto,'photos':photos,'dim':dim,'album': a, 'albums': albums}))

                        $('viewPanel').insert(link)
	            }
                    album.selected(album.current)
                }
            }
        }
    },
    menu : { // wiphoto.menu
        init: function () { // wiphoto.menu.show
            $('albumMenu').update('')
            for (var node in tree) wiphoto.menu.item.init (node,tree[node],0, $("albumMenu"))
            wiphoto.album.current = wiphoto.album.keys[0]
        },
        item: { // wiphoto.menu.item
            init: function (node,arr,indent,container) { // wiphoto.menu.item.init
                parse = TrimPath.parseTemplate
                item = new Element('div')
                with (wiphoto) {
                    if (!albums[node]) { return }
                    wiphoto.album.keys.push(node)
                    if (albums[node]['type'] == 'Album') {
                        item.update(parse(template.menuAlbum).process({'album': node, 'albums': albums}))
    	                container.insert(item)
                    } else {
                        // nested group (folder)
                        item.update(parse(template.menuFolder).process({'album': node, 'albums': albums}))
     	                container.insert(item)
                        group = new Element('div', {"id": "menuGroup_" + node}).setStyle({ display: 'block'}); 
                        container.insert(group)
                        for (var sub in arr) menu.item.init(sub,arr[sub],indent+1,group)
                    }
                    $("navMenu_"+node).style.paddingLeft = indent * 10;
                }
            },
            hide: function (group) { // wiphoto.menu.item.hide
                elem = $("menuGroup_" + group)
                img = $("closeTriangle_"+group)
                console.log(elem.style.display)
                if (elem.style.display == 'block') {
                    elem.style.display = 'none'
                    img.src = "./wiphoto/images/closed.png"
                } else {
                    elem.style.display = 'block'
                    img.src = "./wiphoto/images/open.png"
                }
            }
        }
    },
    // ------------------------------------------------------------
    // Display PHOTO both manual and slide show mode
    //
    photo: { // wiphoto.photo
        current: 0,
        show: function (a,p) { // wiphoto.photo.show
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
        preload: function(i) { // wiphoto.photo.preload
            key = albums[wiphoto.album.current].photos[i]
            wiphoto.preload[key] = new Image ()
            wiphoto.preload[key].src = photos[key] ? photos[key].image.path : ''
        },
        last:    function () { return (albums[wiphoto.album.current].photos.length-1) },
        next:    function () { with(wiphoto.photo) {return ( (current == last()) ? 0 :current+1 ) }},
        prev:    function () { with(wiphoto.photo) {return ( (current == 0) ? last():current-1 ) }},
        setmode: function(a,i)  { wiphoto.mode('photo'); show(a,i) },
        thumb: { // wiphoto.photo.thumb
            size: wiphoto.defaults.thumb_size,
            _selected: 0,
            selected: function(a,t) { // wiphoto.photo.thumb.selected
                a = a || wiphoto.album.current
                t = (t==0) ? 0 : t || wiphoto.photo.current
                with(wiphoto.photo.thumb) {
                    if ($(_selected)) {
                        $(_selected).removeClassName('selected')
                        _selected = 'thumb_'+a+'_'+t
                        $(_selected).addClassName('selected')
                        $(_selected).scrollIntoView(false)
                    }
                    if (wiphoto.mode('thumb')) {
                        wiphoto.photo.current = t 
                        wiphoto.photo.preload(t)
                    }
                    return (_selected)
                }
            },
            timeout: false,
            // Load thumbs of an album in smaller pieces if album has
            // too many pictures. To avould JS script timeout.
            showPart: function(from,n) { // wiphoto.photo.thumb.showPart
                with(wiphoto) {
                    a = album.current
	            for (var i=from; i< from+n; i=i+1) {
                        if (i == albums[a].photos.length-1) return (true)
                        
	                key=albums[a].photos[i]
                        elem = new Element('span')
                        dim = fitInto(photo.thumb.size, photo.thumb.size, photos[key].thumb);
                        
                        elem.update(TrimPath.parseTemplate(template.thumb).process(
		            {'key': key, 'i': i, 'album': album.current, 'photos': photos, "albums": albums, 'dim':dim}))
                        
	                $('viewPanel').insert(elem)
                
                        if (photo.current == i) 
                            photo.thumb.selected (album.current, photo.current);
                    }
                    s = from + n
                    with (wiphoto.defaults.partload) 
                        wiphoto.photo.thumb.timeout = setTimeout('wiphoto.photo.thumb.showPart('+s+','+nextload+')',delay*1000)
                }
            },

            show: function(a,t) { //wiphoto.photo.thumb.show
                with(wiphoto) {
                    mode('thumb');
                    album.current = a || album.current;
                    photo.current = (t==0) ?0 :(t || photo.current); 
                    
                    album.selected(album.current)
                    
	            arr = albums[album.current].photos;	
	            $('viewPanel').update('');
                    
                    with(wiphoto.defaults.partload) 
                        if (arr.length > startat) { photo.thumb.showPart(0,firstload); return }


	            for (var i=0; i< arr.length; i=i+1) {
                        elem = new Element('span')
	                key=arr[i];
                        dim = fitInto(photo.thumb.size, photo.thumb.size, photos[key].thumb);
                        
                        elem.update(TrimPath.parseTemplate(template.thumb).process(
		            {'key': key, 'i': i, 'album': album.current, 'photos': photos, "albums": albums, 'dim':dim}))

	                $('viewPanel').insert(elem)
	            }
                    photo.thumb.selected (album.current, photo.current);
                }
            }
        }
    },
    preload: {}, // hash of preloaded images for slide show
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
                play = wiphoto.slides.play;
                break;

            case 'albumThumb':
                next = wiphoto.album.next;
                prev = wiphoto.album.prev;
                play = wiphoto.slides.play;
                wiphoto.photo.current = 0
                break;
            }
            if(mode != 'slide') wiphoto.slides.stop()
            if(mode != 'thumb') clearTimeout(wiphoto.photo.thumb.timeout)
        }
        return (wiphoto._mode)
    },
    // ------------------------------------------------------------
    slides: {
        data: [],
        running: false,
        timeout: false,
        preloaded: 0,
        speed: wiphoto.defaults.slideShowSpeed,

        play: function (a,p) {
            with(wiphoto) {
                album.current = a || album.current
                photo.current = (p == 0) ? 0 : (p || photo.current)
            }
            with(wiphoto.slides) {
                data = albums[wiphoto.album.current].photos;
                preload(0)
                next();
            }
        },
        clear: function() {
            clearTimeout(wiphoto.slides.timeout)
        },
        stop: function () {
            with(wiphoto.slides) {
                data = [];
                clear()
                running = false
            }
        },
        toggle: function () {
            with(wiphoto.slides) {
                if (running) stop()
                else with(wiphoto) play(album.current, photo.current)
            }
        },
        prev: function () {
            with(wiphoto.photo) {current = current -2; wiphoto.slides.next() }
        },
        next: function (){
            with(wiphoto.slides) {
                wiphoto.mode('slide')
                running = true
                if (data.length == 0) return
                clear()
                preload()
                
                //     if (document.all){
                //         document.images.SlideSlideShow.style.filter="blendTrans(duration=2)"
                //         document.images.SlideSlideShow.style.filter="blendTrans(duration=crossFadeDuration)"
                //         document.images.SlideShow.filters.blendTrans.Apply()      
                //     }
                with (wiphoto.photo) { 
                    show(); 
                    
                    if (wiphoto.preload[data[current]]) 
                        document.images.SlideShow.src = wiphoto.preload[data[current]].src
                    else preload(current)
                    
                    if (++current > (data.length-1)) current = 0
                    timeout = setTimeout('wiphoto.slides.next()', speed*1000)
                }
            }
        },
        preload: function (startAt) {
            with(wiphoto.slides) {
                preloaded = (startAt == 0) ? 0 : (startAt || preloaded)
                for (i=0; i<5; i=i+1) {
                    if (preloaded > data.length-1) preloaded = 0
                    key = data[preloaded]
                    if (!wiphoto.preload[key]) { 
                        wiphoto.preload[key] = new Image ()
                        wiphoto.preload[key].src = photos[key].image.path
                    }
                    preloaded++
                }
            }
            
        }
        
    }
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
            case 's':     wiphoto.slides.play(); break;
            case 'space': wiphoto.photo.thumb.show(); break;
            case 'right': 
            case 'down': with(wiphoto.album) selected(next()); break;
            case 'left':
            case 'up':   with(wiphoto.album) selected(prev()); break;
            }
            break
        case 'photo':
            switch(KeyPress) {
            case 'left': show(null,prev()); break;
            case 'right': 
            case 'space':  show(null,next()); break;
            case 'escape': wiphoto.photo.thumb.show(); break;
            case 'enter': wiphoto.slides.play(); break;
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
                case 'enter': wiphoto.slides.play(); break;
                    
                case 'escape': wiphoto.album.thumb.show(); break;
                }
            }
            break
        case 'slide':
            with (wiphoto.slides) {
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
        document.onkeyup = KeyCheck
//        with(wiphoto.album) {
     //       for (var k in albums) keys.push(k)
//            current = keys[0]
//            thumb.show()
//        }
        wiphoto.menu.init()
        wiphoto.album.thumb.show()
    }