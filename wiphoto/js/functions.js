
defaults = { navigation_width: 200, thumb_size:120, slideShowSpeed:1};
preload = {};
keyCode = {32:'space',33:'pgup',34:'pgdown',35:'end',36:'home',37:'left',38:'up',39:'right',40:'down',27:'escape',9:'tab',13:'enter',48:'0'};

template = {
    'albumLink':
    '<A ID="showThumbs_${album}" CLASS="albumLink" HREF="JAVASCRIPT:showThumbs(${album},0);">${albums[album]["name"]}</A>',
// ----------------------------------------
    'albumThumb':

    '<A HREF="JAVASCRIPT:showThumbs(${album});">\
<SPAN ID="albumThumb_${album}" CLASS="albumThumb">\
<IMG ID="albumThumb_img_${album}" CLASS="albumThumb_img" WIDTH="${dim[0]}" HEIGHT="${dim[1]}" SRC="${photos[albums[album]["photos"][0]]["thumb"]["path"]}">\
<DIV STYLE="WIDTH: ${current["thumb_size"]+10}">${albums[album]["name"]} (${albums[album]["photos"].length})\
</DIV>\
</SPAN>\
</A>',
    
// ----------------------------------------
    'thumb':

    '<A HREF="JAVASCRIPT:showPhoto(${album},${i});"><IMG ID="thumb_${album}_${i}" CLASS="thumb" WIDTH="${dim[0]}" HEIGHT="${dim[1]}" SRC="${photos[key]["thumb"]["path"]};"></A>',
// ----------------------------------------
    'photo':
    '<CENTER><IMG WIDTH="${dim[0]}" HEIGHT="${dim[1]}" NAME="SlideShow" ID="showPhoto" SRC="${photos[key]["image"]["path"]}"></CENTER>'
};
    
    current = { photo:0,album:0,thumb_size:defaults.thumb_size,
                mode:function(mode) {
                    if(mode) { 
                        current._mode = mode;
                        if(mode != 'slide') show.stop()
                    }
                    return (current._mode)
                },
              };

    // --------------------------------------------------------------------------------
    function getElementsByClassName(classname, node)  {
        if(!node) node = document.getElementsByTagName("body")[0];
        var a = [];
        var re = new RegExp('\\b' + classname + '\\b');
        var els = node.getElementsByTagName("*");
        for(var i=0,j=els.length; i<j; i++)
            if(re.test(els[i].className))a.push(els[i]);
        return a;
    }
    function get1stElementByClassName(classname, node)  {
        return (getElementsByClassName(classname, node)[0])
    }
    // --------------------------------------------------------------------------------
    function setThumbSelection (album,thumb) {
        elem = $('thumb_'+album+'_'+thumb);
        setSelection(elem);
        if (current.mode('thumb')) { current.photo = thumb }
    }
    // --------------------------------------------------------------------------------
    function setSelection (elem,cls) {
        cls = cls || current.mode();
        if (elem_s = get1stElementByClassName(cls+' selected',document.body)) { elem_s.className = cls }
        elem.addClassName('selected');
        elem.scrollIntoView(false);
    }
    // --------------------------------------------------------------------------------
    function showAlbumThumbs () {
        current.mode('albumThumb');
	out = '';
        $('viewPanel').innerHTML = '';
	for (var album in albums) {
    	    out += TrimPath.parseTemplate(template['albumLink']).process({'album': album, 'albums': albums});
            dim = fitInto(current['thumb_size'], current['thumb_size'], photos[albums[album]['photos'][0]]['thumb']);
            $('viewPanel').innerHTML += 
            TrimPath.parseTemplate(template['albumThumb']).process({'current':current,'photos':photos,'dim':dim,'album': album, 'albums': albums});
	}
	$('albumdata').innerHTML = out
    }

    // --------------------------------------------------------------------------------
    function showThumbs (album,thumb) {
        current.mode('thumb');
        current.album = album || current.album;
        current.photo = (thumb==0) ?0 :(thumb || current.photo); 

        setSelection( $("showThumbs_"+current.album), 'albumLink'); // left side tab

	arr = albums[current.album].photos;	
	$('viewPanel').innerHTML = '';
	for (var i=0; i< arr.length; i=i+1) {
	    key=arr[i];
            dim = fitInto(current.thumb_size, current.thumb_size, photos[key].thumb);
	    $('viewPanel').innerHTML +=
	    TrimPath.parseTemplate(template.thumb).process(
		{'key': key, 'i': i, 'album': current.album, 'photos': photos, "albums": albums, 'dim':dim}
	    )
	}
        setThumbSelection(current.album,current.photo);
    }
    // --------------------------------------------------------------------------------
    function selectAlbum(album) {
        current.album = album;
        setSelection( $("showThumbs_"+current.album), 'albumLink'); // left side tab
        setSelection( $("albumThumb_img_"+current.album), 'albumThumb_img'); 

    }
    
    function fitInto (w,h,image) { // Container width and height, photo width and height
        proportion = Math.max(image['dim'][0]/w,image['dim'][1]/h);
	return([image['dim'][0]/proportion, image['dim'][1]/proportion])
    }
    
    // --------------------------------------------------------------------------------
    function showPhoto (album,index) {
//        current.mode('photo');
        current.photo = (index==0) ?0 :(index||current.photo)
        current.album = album || current.album
//        console.log ("show "+album+':'+index);
	w = $('viewPanel').clientWidth -20 
	h = $('viewPanel').clientHeight -20
        key = albums[current.album]['photos'][current.photo];
	dim = fitInto(w,h,photos[key]['image']);
 	$('viewPanel').innerHTML = 
	    TrimPath.parseTemplate(template.photo).process({'dim':dim, 'key':key, 'photos':photos})
    }
    // --------------------------------------------------------------------------------
    function last () {
        return (albums[current.album].photos.length-1)
    }
    function next () {
        return ( (current.photo==last()) ?0 :current.photo+1 )
    }

    function prev () {
        return ( (current.photo==0)?last():current.photo-1 )
    }


    function KeyCheck (e) {
        var KeyPress = (window.event) ? keyCode[event.keyCode] : keyCode[e.keyCode];
        switch (current.mode()) {
        case 'photo':
            switch(KeyPress) {
            case 'left': showPhoto(null,prev()); break;
            case 'right': 
            case 'space':  showPhoto(null,next()); break;
            case 'escape': showThumbs(); break;
            }
            break
        case 'thumb':
            switch(KeyPress) {
            case 'pgup': 
            case '0':      setThumbSelection(current.album,0); break;
            case 'right':  setThumbSelection(current.album,next ()); break;
            case 'left':   setThumbSelection(current.album,prev()); break;
            case 'pgdown': setThumbSelection(current.album,last()); break;

            case 'space':
            case 'enter': current.mode('photo');showPhoto();break;

            case 'escape': showAlbumThumbs(); break;
            }
            break
        case 'albumThumb':
            switch(KeyPress) {
            case 'enter': show.play(); break;
            case 'space': showThumbs(); break;
            }
            break
        case 'slide':
            switch(KeyPress) {
            case 'escape': show.stop(); break;
            case 'space': show.toggle(); break;
            case 'enter': show.toggle(); break;
            case 'right': show.next(); break;
            case 'left': show.prev(); break;
            }
        }
        return (true);
    }
    

// --------------------------------------------------------------------------------
    function init() {
        showAlbumThumbs();
        document.onkeyup = KeyCheck;       
        selectAlbum(1289);
    }