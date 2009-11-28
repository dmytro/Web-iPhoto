slides = [];
show = {
    running: false,
    timeout: false,
    preloaded: 0,
    speed: 3, //defaults.slideShowSpeed,
    current: 0,

    play: function (album,photo) {
        current.album = album || current.album
        current.photo = (photo == 0) ? 0 : (photo || current.photo)
        slides = albums[current.album].photos;
        show.preload(0)
        show.current = current.photo
        show.next();
    },
    clear: function() {
        clearTimeout(show.timeout)
    },
    stop: function () {
        slides = [];
        show.clear()
        show.running = false
    },
    toggle: function () {
        if (show.running) show.stop()
        else show.play(current.album,current.photo)
    },
    prev: function () {
        show.current = show.current -2
        show.next()
    },
    next: function (){
        current.mode('slide')
        show.running = true
        if (slides.length == 0) return
        show.clear()
        show.preload()
        
        //     if (document.all){
        //         document.images.SlideShow.style.filter="blendTrans(duration=2)"
        //         document.images.SlideShow.style.filter="blendTrans(duration=crossFadeDuration)"
        //         document.images.SlideShow.filters.blendTrans.Apply()      
        //     }
        photo.show(); current.photo++
        
        if (preload[slides[show.current]]) document.images.SlideShow.src = preload[slides[show.current]].src
        else show.preload(show.current)

        if (++show.current > (slides.length-1)) show.current = 0
        show.timeout = setTimeout('show.next()', show.speed*1000)
    },
    preload: function (startAt) {
        show.preloaded = (startAt == 0) ? 0 : (startAt || show.preloaded)
        for (i=0; i<5; i=i+1) {
            key = slides[show.preloaded]
            if (!preload[key]) { 
                preload[key] = new Image ()
                preload[key].src = photos[key].image.path
            }
            show.preloaded = (show.preloaded > slides.length-1) ? 0 : show.preloaded+1
        }
    }
}
    

