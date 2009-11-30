slideShow = {
    slides: [],
    running: false,
    timeout: false,
    preloaded: 0,
    speed: wiphoto.defaults.slideShowSpeed,
    current: 0,

    play: function (album,photo) {
        wiphoto.album = album || wiphoto.album
        wiphoto.photo.current = (photo == 0) ? 0 : (photo || wiphoto.photo.current)
        this.slides = albums[wiphoto.album].photos;
        this.preload(0)
        this.current = wiphoto.photo.current
        this.next();
    },
    clear: function() {
        clearTimeout(slideShow.timeout)
    },
    stop: function () {
        slideShow.slides = [];
        slideShow.clear()
        slideShow.running = false
    },
    toggle: function () {
        if (slideShow.running) slideShow.stop()
        else slideShow.play(wiphoto.album,wiphoto.photo.current)
    },
    prev: function () {
        slideShow.current = slideShow.current -2
        slideShow.next()
    },
    next: function (){
        wiphoto.mode('slide')
        slideShow.running = true
        if (slideShow.slides.length == 0) return
        slideShow.clear()
        slideShow.preload()
        
        //     if (document.all){
        //         document.images.SlideSlideShow.style.filter="blendTrans(duration=2)"
        //         document.images.SlideSlideShow.style.filter="blendTrans(duration=crossFadeDuration)"
        //         document.images.SlideShow.filters.blendTrans.Apply()      
        //     }
        wiphoto.photo.show(); wiphoto.photo.current++
        
        if (wiphoto.preload[slideShow.slides[slideShow.current]]) 
            document.images.SlideShow.src = wiphoto.preload[slideShow.slides[slideShow.current]].src
        else slideShow.preload(slideShow.current)

        if (++slideShow.current > (slideShow.slides.length-1)) slideShow.current = 0
        slideShow.timeout = setTimeout('slideShow.next()', slideShow.speed*1000)
    },
    preload: function (startAt) {
        slideShow.preloaded = (startAt == 0) ? 0 : (startAt || slideShow.preloaded)
        for (i=0; i<5; i=i+1) {
            key = slideShow.slides[slideShow.preloaded]
            if (!wiphoto.preload[key]) { 
                wiphoto.preload[key] = new Image ()
                wiphoto.preload[key].src = photos[key].image.path
            }
            slideShow.preloaded = (slideShow.preloaded > slideShow.slides.length-1) ? 0 : slideShow.preloaded+1
        }
        console.log (slideShow.preloaded)
        
    }
}
    

