
$.extend( true, Designer, {
	
	filters : {

		original : null,

		canvas : null,
		ctx    : null,

		tmpCanvas : null,
		tmpCtx    : null,

		setup : function(){
			if( !this.parent.selecteds.length || typeof this.parent.selecteds[0].src == 'undefined' ) return false;
			this.tmpCanvas = document.createElement('canvas');
			this.tmpCtx    = this.tmpCanvas.getContext('2d');
			var img        = document.createElement('img');
			img.src        = this.parent.selecteds[0].src;
			this.original  = img;
			return true;
		},

		getCanvas : function( w, h ){
			var c    = document.createElement('canvas');
			c.width  = w;
			c.height = h;
			return c;
		},

		getPixels : function( img ){
			this.canvas = this.getCanvas(img.width, img.height);
			this.ctx    = this.canvas.getContext('2d');
			this.ctx.drawImage(img,0,0);
			return this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
		},

		getSrc : function( pixels, img ){
			this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
			this.ctx.putImageData(pixels, 0, 0);
			return this.canvas.toDataURL();
		},

		getOriginalSrc : function(){
			var pixels = this.getPixels( this.original );
			return this.getSrc( pixels, this.original );
		},

		filterImage : function( filter, image, var_args ){
			var args = [this.getPixels(image)];
			for (var i=2; i<arguments.length; i++) 
				args.push(arguments[i]);
			return filter.apply(null, args);
		},

		brightness : function( amount ){
			var newPixels = this.filterImage( this.brightnessFilter, this.original, amount );
			var src       = this.getSrc( newPixels, this.original );
			this.parent.selecteds[0].src = src;
		},

		brightnessFilter : function( pixels, adjustment ) {
			var d = pixels.data;
			for (var i=0; i<d.length; i+=4) {
				d[i]   += adjustment;
				d[i+1] += adjustment;
				d[i+2] += adjustment;
			}
			return pixels;
		},

		contrast : function( amount ){
			var newPixels = this.filterImage( this.contrastFilter, this.original, amount );
			var src       = this.getSrc( newPixels, this.original );
			this.parent.selecteds[0].src = src;
		},

		contrastFilter : function( pixels, adjustment ){
			var d = pixels.data;
			var f = ( 259 * ( adjustment + 255 ) ) / ( 255 * ( 259 - adjustment ) );

			for (var i=0; i<d.length; i+=4)
			{
				d[i]   = f * ( d[i] - 128 ) + 128;
				d[i+1] = f * ( d[i+1] - 128 ) + 128;
				d[i+2] = f * ( d[i+2] - 128 ) + 128;
			}
			return pixels;
		},

		greyscale : function(){
			this.parent.history.save();
			if(!this.setup()) return;
			var newPixels = this.filterImage( this.greyscaleFilter, this.original);
			var src       = this.getSrc( newPixels, this.original );
			this.parent.selecteds[0].src = src;
		},

		greyscaleFilter : function( pixels, args ){
			var d = pixels.data;
			for (var i=0; i<d.length; i+=4) {
				var r = d[i];
				var g = d[i+1];
				var b = d[i+2];
				var v = 0.2126*r + 0.7152*g + 0.0722*b;
				d[i] = d[i+1] = d[i+2] = v
			}
			return pixels;
		},

		createImageData : function(w,h) {
			return this.tmpCtx.createImageData(w,h);
		},

		sharpen : function( amount )
		{
			var rest = -((amount-1)/4);
			var arr = [0,rest,0,rest,amount,rest,0,rest,0];
			var newPixels = this.filterImage( $.proxy(this.convolute,this), this.original, arr);
			var src       = this.getSrc( newPixels, this.original );
			this.parent.selecteds[0].src = src;
		},

		blur : function( amount ){
			amount = amount * amount;
			var arr = [], originalAmount = amount;
			for(i = 0;i<=amount-1;i++) arr.push(1/amount);
			var newPixels = this.filterImage( $.proxy(this.convolute,this), this.original, arr);
			var src       = this.getSrc( newPixels, this.original );
			this.parent.selecteds[0].src = src;
		},

		convolute : function(pixels, weights, opaque) 
		{
			var side = Math.round(Math.sqrt(weights.length));
			var halfSide = Math.floor(side/2);
			var src = pixels.data;
			var sw = pixels.width;
			var sh = pixels.height;
			// pad output by the convolution matrix
			var w = sw;
			var h = sh;
			var output = this.createImageData(w, h);
			var dst = output.data;
			// go through the destination image pixels
			var alphaFac = opaque ? 1 : 0;
			for (var y=0; y<h; y++) {
				for (var x=0; x<w; x++) {
					var sy = y;
					var sx = x;
					var dstOff = (y*w+x)*4;
					// calculate the weighed sum of the source image pixels that
					// fall under the convolution matrix
					var r=0, g=0, b=0, a=0;
					for (var cy=0; cy<side; cy++) {
						for (var cx=0; cx<side; cx++) {
							var scy = sy + cy - halfSide;
							var scx = sx + cx - halfSide;
							if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
								var srcOff = (scy*sw+scx)*4;
								var wt = weights[cy*side+cx];
								r += src[srcOff] * wt;
								g += src[srcOff+1] * wt;
								b += src[srcOff+2] * wt;
								a += src[srcOff+3] * wt;
							}
						}
					}
					dst[dstOff] = r;
					dst[dstOff+1] = g;
					dst[dstOff+2] = b;
					dst[dstOff+3] = a + alphaFac*(255-a);
				}
			}
			return output;
		},

		hsl : function( h, s, l ){

			var pixels = this.getPixels( this.original ),
				data   = pixels.data;

			for (var i = 0; i < data.length; i += 4) 
			{
				red   = data[i + 0];
		        green = data[i + 1];
		        blue  = data[i + 2];
		        alpha = data[i + 3];

		        var hsl = this.rgbToHsl(red, green, blue);
		        
	            var newRgb = this.hslToRgb(hsl.h + h, hsl.s * s / 100, hsl.l + l);
	            pixels.data[i + 0] = newRgb.r;
	            pixels.data[i + 1] = newRgb.g;
	            pixels.data[i + 2] = newRgb.b;
	            pixels.data[i + 3] = alpha;
			}

			var src = this.getSrc( pixels, this.original );
			this.parent.selecteds[0].src = src;

		},

		hslToRgb : function(h, s, l){
			var r, g, b;

			if(s == 0){
			    r = g = b = l; // achromatic
			}else{
			    function hue2rgb(p, q, t){
			        if(t < 0) t += 1;
			        if(t > 1) t -= 1;
			        if(t < 1/6) return p + (q - p) * 6 * t;
			        if(t < 1/2) return q;
			        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			        return p;
			    }

			    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			    var p = 2 * l - q;
			    r = hue2rgb(p, q, h + 1/3);
			    g = hue2rgb(p, q, h);
			    b = hue2rgb(p, q, h - 1/3);
			}
			return { r:Math.round(r * 255), g:Math.round(g * 255), b:Math.round(b * 255)};
		},

		rgbToHsl : function(r, g, b){
		    r /= 255, g /= 255, b /= 255;
		    var max = Math.max(r, g, b), min = Math.min(r, g, b);
		    var h, s, l = (max + min) / 2;

		    if(max == min){
		        h = s = 0; // achromatic
		    }else{
		        var d = max - min;
		        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		        switch(max){
		            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
		            case g: h = (b - r) / d + 2; break;
		            case b: h = (r - g) / d + 4; break;
		        }
		        h /= 6;
		    }
		    return {
		    	h : h,
		    	s : s,
		    	l : l
		    };
		},

		colorize : function( r, g, b, s ){

			var pixels = this.getPixels( this.original ),
				data   = pixels.data;

			for (var i = 0; i < data.length; i += 4) 
			{
				red   = data[i + 0];
		        green = data[i + 1];
		        blue  = data[i + 2];
		        alpha = data[i + 3];
		        var v = 0.2126*red + 0.7152*green + 0.0722*blue;
				data[i] = data[i+1] = data[i+2] = v;

		        data[i + 0] = data[i + 0] * r / 100;
		        data[i + 1] = data[i + 1] * g / 100;
		        data[i + 2] = data[i + 2] * b / 100;
			}

			var src = this.getSrc( pixels, this.original );
			this.parent.selecteds[0].src = src;

		}

	}
	
})