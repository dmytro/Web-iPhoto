
photo = [];
screen = [];

keyCode = {37:'left',38:'up',39:'right',40:'down',27:'escape',9:'tab',13:'enter',32:'space'};
defaults = { 'navigation_width': 200, 'thumb_size': 120 };
template = {
    'albumLink':
    '<A ID="showThumbs_${album}" CLASS="albumLink" HREF="JAVASCRIPT:showThumbs(${album});">${albums[album]["name"]}</A>',

    'albumThumb':
    '<A HREF="JAVASCRIPT:showThumbs(${album});"><SPAN ID="albumThumb_${album}" CLASS="albumThumb"><IMG ID="albumThumb_img_${album}" WIDTH="${dim[0]}" HEIGHT="${dim[1]}" SRC="${photos[albums[album]["photos"][0]]["thumb"]["path"]}"><DIV STYLE="WIDTH: ${current["thumb_size"]+10}">${albums[album]["name"]} (${albums[album]["photos"].length})</DIV></SPAN></A>',

    'thumb':
    '<A HREF="JAVASCRIPT:showPhoto(${album},${i});"><IMG CLASS="thumb" WIDTH="${dim[0]}" HEIGHT="${dim[1]}" SRC="${photos[key]["thumb"]["path"]};"></A>',

    'photo':
    '<CENTER><IMG WIDTH="${dim[0]}" HEIGHT="${dim[1]}" ID="showPhoto" SRC="${photos[key]["image"]["path"]}"></CENTER>'
};
    
    current = { 'photo':[], 'album': 0, 'mode':'',
                thumb_size : defaults['thumb_size']
              };
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
        current['mode'] = 'thumbs';
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
    }
    // --------------------------------------------------------------------------------
    
    function fitInto (w,h,image) { // Container width and height, photo width and height
        proportion = Math.max(image['dim'][0]/w,image['dim'][1]/h);
	return([image['dim'][0]/proportion, image['dim'][1]/proportion])
    }
    
    // --------------------------------------------------------------------------------
    function showPhoto (album,index) {
        current['photo'] = [album,index];
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
        //current['photo'][0] - album index
        //current['photo'][1] - photo index in album
        if (current['mode'] == 'thumbs') { 
            showPhoto(current['album'],0)
            return (true)
        } 
        nextIdx = (current['photo'][1] == albums[current['photo'][0]]['photos'].length-1) ? 0 : current['photo'][1]+1
        showPhoto (current['album'], nextIdx)
    }

    function prev () {
        if (current['mode'] == 'thumbs') { 
            showPhoto(current['album'],albums[current['album']]['photos'].length-1)
            return(true)
        }
        nextIdx = (current['photo'][1] == 0) ? albums[current['photo'][0]]['photos'].length-1 : current['photo'][1]-1
        showPhoto (current['photo'][0], nextIdx)
    }

    function KeyCheck (e) {
        var KeyPress = (window.event) ? keyCode[event.keyCode] : keyCode[e.keyCode];
        switch (current['mode']) {
        case 'photo':
            switch(KeyPress) {
            case 'left': prev(); break;
            case 'right': next(); break;
            case 'space': next(); break;
            case 'escape': showThumbs(current['album']); break;
            }
            break
/*  TODO
 In thumbs mode key should do this:
 left/right - move selection back or forward,
 enter,space - open photo
 esc - go back to list of albums (album thumbs)
*/
        case 'thumbs':
            switch(KeyPress) {
            case 'right': next (); break;
            case 'left': prev(); break;
            case 'space': next(); break;
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