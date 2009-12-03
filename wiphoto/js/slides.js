slideShow = {
    slides: [],
    running: false,
    timeout: false,
    preloaded: 0,
    speed: wiphoto.defaults.slideShowSpeed,

    play: function (_album,photo) {
        wiphoto.album.current = _album || wiphoto.album.current
        wiphoto.photo.current = (photo == 0) ? 0 : (photo || wiphoto.photo.current)
        with(slideShow) {
            slides = albums[wiphoto.album.current].photos;
            preload(0)
            next();
        }
    },
    clear: function() {
        clearTimeout(slideShow.timeout)
    },
    stop: function () {
        with(slideShow) {
            slides = [];
            clear()
            running = false
        }
    },
    toggle: function () {
// TODO
// file:///Users/dmytro/Development/Web-iPhoto/wiphoto/js/slides.js:12TypeError: Result of expression 'albums[wiphoto.album.current]' [undefined] is not an object.
        with(slideShow) {
            if (running) stop()
            else with(wiphoto) play(album, photo.current)
        }
    },
    prev: function () {
        with(wiphoto.photo) {current = current -2; slideShow.next() }
    },
    next: function (){
        with(slideShow) {
            wiphoto.mode('slide')
            running = true
            if (slides.length == 0) return
            clear()
            preload()
        
            //     if (document.all){
            //         document.images.SlideSlideShow.style.filter="blendTrans(duration=2)"
            //         document.images.SlideSlideShow.style.filter="blendTrans(duration=crossFadeDuration)"
            //         document.images.SlideShow.filters.blendTrans.Apply()      
            //     }
            with (wiphoto.photo) { 
                show(); 
            
                if (wiphoto.preload[slides[current]]) 
                    document.images.SlideShow.src = wiphoto.preload[slides[current]].src
                else preload(current)
                
                if (++current > (slides.length-1)) current = 0
                timeout = setTimeout('slideShow.next()', speed*1000)
            }
        }
    },
    preload: function (startAt) {
        with(slideShow) {
            preloaded = (startAt == 0) ? 0 : (startAt || preloaded)
            for (i=0; i<5; i=i+1) {
                key = slides[preloaded]
                if (!wiphoto.preload[key]) { 
                    wiphoto.preload[key] = new Image ()
                    wiphoto.preload[key].src = photos[key].image.path
                }
                preloaded = (preloaded > slides.length-1) ? 0 : preloaded+1
            }
        }
        
    }
}
    

