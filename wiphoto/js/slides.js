// Taken from:
// (C) 2000 www.CodeLifter.com
// http://www.codelifter.com
// Free for all users, but leave in this  header
// NS4-6,IE4-6
// Fade effect only in IE; degrades gracefully

// =======================================
// set the following variables
// =======================================


// Duration of crossfade (seconds)
var crossFadeDuration = 3


function play (album,photo) {
    current.album = album || current.album
    current.photo = (photo == 0) ? 0 : (photo || current.photo)

    current.preloaded = 0
    preload()
    if (current.runningShow) clearTimeout(current.runningShow)
    slides = albums[current.album].photos;
    current.slide = 0
    current.mode = 'slide'
    nextSlide();
}

function stopShow() {
    slides = [];
    clearTimeout(current.runningShow)
    showThumbs();
}
    
function preload () {
    for (i=0; i<5; i=i+1) {
        if (current.preloaded >= slides.length) return
        key = slides[current.preloaded]
        if (!preload[key]) preload[key] = new Image ()
        preload[key].src = photos[key].image.path
        current.preloaded += 1
    }
}

function prevSlide() {
    current.slide = current.slide -2
    clearTimeout(current.runningShow)
    nextSlide()
}
function nextSlide(){
    if (slides.length == 0) return
    if (current.runningShow) clearTimeout(current.runningShow)
    preload()

//     if (document.all){
//         document.images.SlideShow.style.filter="blendTrans(duration=2)"
//         document.images.SlideShow.style.filter="blendTrans(duration=crossFadeDuration)"
//         document.images.SlideShow.filters.blendTrans.Apply()      
//     }
    
    w = $('viewPanel').clientWidth -20 
    h = $('viewPanel').clientHeight -20
    key = slides[current.slide];
    current.photo = key
    dim = fitInto(w,h,photos[key]['image']);
    $('viewPanel').innerHTML = TrimPath.parseTemplate(template.slide).process({'dim':dim, 'key':key, 'photos':photos})

    document.images.SlideShow.src = preload[slides[current.slide]].src
    current['slide'] += 1
    if (current.slide > (slides.length-1)) current.slide = 0
    current.runningShow = setTimeout('nextSlide()', current.slideShowDelay*1000)
}
