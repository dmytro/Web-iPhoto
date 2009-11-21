
photo = [];
screen = [];

keyCode = {37:'left',38:'up',39:'right',40:'down',27:'escape',9:'tab',13:'enter',32:'space'};
defaults = { 'navigation_width': 200, 'thumb_size': 120 };
template = {
    'albumLink':
    '<A ID="showThumbs_${album}" CLASS="thumb" HREF="JAVASCRIPT:showThumbs(${album});">${albums[album]["name"]}</A>',
// ----------------------------------------
    'albumThumb':

    '<A HREF="JAVASCRIPT:showThumbs(${album});">\
<SPAN ID="albumThumb_${album}" CLASS="albumThumb">\
<IMG ID="albumThumb_img_${album}" WIDTH="${dim[0]}" HEIGHT="${dim[1]}" SRC="${photos[albums[album]["photos"][0]]["thumb"]["path"]}">\
<DIV STYLE="WIDTH: ${current["thumb_size"]+10}">${albums[album]["name"]} (${albums[album]["photos"].length})\
</DIV>\
</SPAN>\
</A>',
    
// ----------------------------------------
    'thumb':

    '<A HREF="JAVASCRIPT:showPhoto(${album},${i});"><IMG ID="thumb_${album}_${i}" CLASS="thumb" WIDTH="${dim[0]}" HEIGHT="${dim[1]}" SRC="${photos[key]["thumb"]["path"]};"></A>',
// ----------------------------------------
    'photo':
    '<CENTER><IMG WIDTH="${dim[0]}" HEIGHT="${dim[1]}" ID="showPhoto" SRC="${photos[key]["image"]["path"]}"></CENTER>'
// ----------------------------------------
};
    
    current = { 'photo':0, 'album': 0, 'mode':'',thumb_size : defaults['thumb_size']};
    document.onkeyup = KeyCheck;       
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
        cls = current['mode'];
        console.log ('setThumbSelection: '+album+':'+thumb);
        if (elem = get1stElementByClassName(cls+' selected',document.body)) { elem.className = cls }
        $('thumb_'+album+'_'+thumb).addClassName('selected')
    }
    // --------------------------------------------------------------------------------
    function showAlbumThumbs () {
        current['mode'] = 'albumThumbs';
	out = '';
        document.getElementById('viewPanel').innerHTML = '';
	for (var album in albums) {
    	    out += TrimPath.parseTemplate(template['albumLink']).process({'album': album, 'albums': albums});
            dim = fitInto(current['thumb_size'], current['thumb_size'], photos[albums[album]['photos'][0]]['thumb']);
            document.getElementById('viewPanel').innerHTML += 
            TrimPath.parseTemplate(template['albumThumb']).process({'current':current,'photos':photos,'dim':dim,'album': album, 'albums': albums});
	}
	document.getElementById('albumdata').innerHTML = out
    }

    // --------------------------------------------------------------------------------
    function showThumbs (album) {
        current['mode'] = 'thumb';
        current['album'] = album;
	arr = albums[album]['photos'];

	elem = getElementsByClassName('selected', document.body)[0]
	if (elem) { elem.className = 'albumLink' }

	document.getElementById("showThumbs_"+album).className = 'selected';
	
	document.getElementById('viewPanel').innerHTML = '';
	for (var i=0; i< arr.length; i=i+1) {
	    key=arr[i];
            dim = fitInto(current['thumb_size'], current['thumb_size'], photos[key]['thumb']);
	    document.getElementById('viewPanel').innerHTML +=
	    TrimPath.parseTemplate(template['thumb']).process(
		{'key': key, 'i': i, 'album': album, 'photos': photos, "albums": albums, 'dim':dim}
	    )
	}
        setThumbSelection(album,current['photo']);
    }
    // --------------------------------------------------------------------------------
    
    function fitInto (w,h,image) { // Container width and height, photo width and height
        proportion = Math.max(image['dim'][0]/w,image['dim'][1]/h);
	return([image['dim'][0]/proportion, image['dim'][1]/proportion])
    }
    
    // --------------------------------------------------------------------------------
    function showPhoto (album,index) {
        index = index || current['photo']
        album = album || current['album']
        current['photo'] = index;
        current['album'] = album;
        current['mode'] = 'photo';
	w = document.getElementById('viewPanel').clientWidth -20 
	h = document.getElementById('viewPanel').clientHeight -20
        key = albums[album]['photos'][index];
	dim = fitInto(w,h,photos[key]['image']);
 	document.getElementById('viewPanel').innerHTML = 
	    TrimPath.parseTemplate(template['photo']).process({'dim':dim, 'key':key, 'photos':photos})
    }
    // --------------------------------------------------------------------------------
    function next () {
        return (
            current['photo']=(current['photo']==albums[current['album']]['photos'].length-1)?0:current['photo']+1
        )
    }

    function prev () {
        return (
            current['photo']=(current['photo']==0)?albums[current['album']]['photos'].length-1:current['photo']-1
        )
    }

    function KeyCheck (e) {
        var KeyPress = (window.event) ? keyCode[event.keyCode] : keyCode[e.keyCode];
        switch (current['mode']) {
        case 'photo':
            switch(KeyPress) {
            case 'left': showPhoto(current['album'],prev()); break;
            case 'right': showPhoto(current['album'],next()); break;
            case 'space': showPhoto(current['album'],next()); break;
            case 'escape': showThumbs(current['album']); break;
                // enter: play show
            }
            break
        case 'thumb':
            switch(KeyPress) {
            case 'right': setThumbSelection(current['album'],next ()); break;
            case 'left': setThumbSelection(current['album'],prev()); break;
            case 'space': showPhoto();break;
            case 'enter': showPhoto();break;
            case 'escape': showAlbumThumbs(); break;
            }
            break
        case 'albumThumbs':
            break
        }
        return (true);
    }
    

// --------------------------------------------------------------------------------
    function init() {
        showAlbumThumbs();
    }