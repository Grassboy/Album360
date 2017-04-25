AFRAME.registerComponent('album-360', {
    schema: {
        photo_grid: {type: 'selector'}
    },
	init: function() {
		var el = this.el;
		this.covered = false;
		this.sky1 = el.getChildren('a-sky')[0];
		this.sky2 = el.getChildren('a-sky')[1];
        this.current_index = 0;
        this.photos = [];
        this._animate_timer = null;
        this._player_timer = null;
        this._grid_shown = false;
	},
	setImage: function(photo){
        var that = this;
        var src = photo.src;
        var changeImage = function(src){
            if (!that.covered) {
                that.sky2.setAttribute('src', src);
                that.sky2.emit('to-side-b');
            } else {
                that.sky1.setAttribute('src', src);
                that.sky2.emit('to-side-a');
            }
            that.covered = ! that.covered;
        };
        clearInterval(that._animate_timer);
        that._animate_timer = null;
        if(typeof src.push == 'function') { //src is array
            var i = 0;
            that._animate_timer = setInterval(function(){
                i = (i+1) % src.length;
                changeImage(src[i]);
            }, 1000);
            changeImage(src[i]);
        } else {
            changeImage(src);
        }
		console_log(photo.desc);
	},
	importPhotos: function(photos) {
        this.photos = photos;
        this.current_index = 0;
        this.setImage(this.photos[this.current_index]);
	},
    next: function(){
        this.current_index++;
        if(this.current_index >= this.photos.length) {
            this.current_index = 0;
        }
        this.setImage(this.photos[this.current_index]);
    },
    prev: function(){
        this.current_index--;
        if(this.current_index < 0) {
            this.current_index = this.photos.length-1;
        }
        this.setImage(this.photos[this.current_index]);
    },
    jumpTo: function(pid){
        if(pid >= 0 && pid < this.photos.length) {
            this.current_index = pid;
            this.setImage(this.photos[pid]);
        }
    },
    toggleSlide: function(){
        var that = this;
        if(that._player_timer) {
            clearInterval(that._player_timer);
            that._player_timer = null;
        } else {
            that._player_timer = setInterval(function tick(){
                if(that._animate_timer) {
                    clearInterval(that._animate_timer);
                    setTimeout(function(){
                        that.next();
                    }, 1000);
                } else {
                    that.next();
                }
            }, 25000);
        }
    },
    trigger: function(action, obj){
        if(action.indexOf('jumpto.')===0) {
            this.toggleSlide();
            this.jumpTo(parseInt(action.substr('jumpto.'.length), 10));
            this.toggleSlide();
        } else {
            switch(action) {
            case "prev":
                this.toggleSlide();
                this.prev();
                this.toggleSlide();
                break;
            case "next":
                this.toggleSlide();
                this.next();
                this.toggleSlide();
                break;
            case "pause":
                this.toggleSlide();
                if(this._player_timer) {
                    obj.setAttribute('material', {src: '#icon-pause'});
                    this.next();
                } else {
                    obj.setAttribute('material', {src: '#icon-play'});
                }
                break;
            case "grid":
                if(this._grid_shown) {
                    this.data.photo_grid.setAttribute('scale', '0 0 0');
                    obj.setAttribute('material', {src: '#icon-grid'});
                } else {
                    this.data.photo_grid.setAttribute('scale', '1 1 1');
                    obj.setAttribute('material', {src: '#icon-grid-close'});
                }
                this._grid_shown = !this._grid_shown;
                break;
            default:
                console.log('unknown: '+action);
                break;
            }
        }
    }
});
AFRAME.registerComponent('cursor-listener', {
    schema: {
        target: {type: 'selector'}
    },
	init: function() {
        var album360 = this.data.target.components['album-360'];
		this.el.addEventListener('click', function(evt) {
            album360.trigger(this.getAttribute('action'), this);
		});
		this.el.addEventListener('mouseenter', function(evt) {
			console_log(this.getAttribute('desc'), true);
		});
		this.el.addEventListener('mouseleave', function(evt) {
			console_log("", true);
		});
	}
});

