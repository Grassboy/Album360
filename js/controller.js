$(function(){
    $(document.body).bind('touchstart', function(e){
        e = e.originalEvent;
        if(e.touches.length == 4) location.reload();
    });
    window.console_log = function(msg, is_sys){
        if(is_sys) {
            $('.tips-sys').text(msg);
        } else {
            $('.tips-photo').text(msg);
        }
    };
    var attachNavigatior = function($camera, $panel){
        var look_at_bottom = false;
        var $photo_grid = $('#photo-grid');
        $camera.bind('componentchanged', function(){
            var rotation = $camera.attr('rotation');
            var auto_hide_cursor = ($photo_grid.attr('scale').x == 0);
            if(!look_at_bottom && rotation.x < -60) {
                look_at_bottom = true;
                var to_rotation = [0, rotation.y, 0].join(' ');
                $('<a-animation>').attr({
                    attribute: 'rotation',
                    from: [0, $panel.attr('rotation').y, 0].join(' '),
                    to: to_rotation,
                    repeat: 0,
                    dur: 500
                }).bind('animationend', function(){
                    $panel.attr('rotation', to_rotation);
                    $(this).remove();
                }).appendTo($panel);
                auto_hide_cursor && $('a-cursor').attr({
                    transparent: false,
                    opacity: 1
                });
            }
            if(look_at_bottom && rotation.x > -40) {
                look_at_bottom = false;
                auto_hide_cursor && $('a-cursor').attr({
                    transparent: true,
                    opacity: 0
                });
            }
        });
    };
    attachNavigatior($('a-camera'), $('#navigator'));
    (new Promise(function(resolve, reject){
        var i = 0;
        var o = [10, 11, 12, 13, 14, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4]; //order_array for layout
        var fetchImg = function(i, j){
            if(i >= photos.length){
                resolve(photos);
                $('#navigator').attr('scale', '1 1 1');
			    console_log('', true);
            } else {
                var real_i = o[i];
                var fetchThumb = function(){
                    $('<img>').appendTo('#assets').bind('load', function(){
                        $('<a-entity template="src: #img-thumb"></a-entity>').attr({
                            'data-src': '#'+this.id,
                            'data-pid': real_i
                        }).appendTo('#photo-grid');
                        fetchImg(i+1);
                    }).attr({
                        src: photos[real_i].thumb, id: 'thumb-'+photos[real_i].id
                    });
                };
                //load full image
                var src = photos[real_i].src;
                var id;
                if(typeof src.push == 'function') { //src is array
                    j = j || 0;
                    if(j < src.length) {
                        src = src[j];
                        id = ['img', real_i+1, j+1].join('-');
                    } else {
                        fetchThumb();
                        return;
                    }
                } else {
                    id = ['img', real_i+1].join('-');
                }
                $('<img>').appendTo('#assets').bind('load', function(){
			        console_log(['載入相片中:', this.src.substr(this.src.lastIndexOf('/')+1)].join(' '), true);
                    if(j === undefined) {
                        fetchThumb();
                    } else {
                        fetchImg(i, j+1);
                    }
                }).attr({
                    src: src, id: id
                });
            }
        };
        fetchImg(0);
    })).then(function(photos){
        var i = 0;
        var album360 = $('a-entity[album-360]')[0].components['album-360'];
        album360.importPhotos(photos);
        album360.toggleSlide();
    });
    $('a-scene').bind('enter-vr', function(){
        if($('.webvr-polyfill-fullscreen-wrapper').length) {
            $('body').addClass('mobile-vr');
        }
    }).bind('exit-vr', function(){
        $('body').removeClass('mobile-vr');
    });
});
