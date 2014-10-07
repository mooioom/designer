
$.extend( true, designer, {

	actions : {

		select : 
		{
			mouseDown : function(){
				if( !this.parent.events.ctrl ) this.parent.selecteds = [];
				this.parent.temp                = null;
				this.parent.selectionBox.startX = this.parent.events.mouseX;
				this.parent.selectionBox.startY = this.parent.events.mouseY;
			},
			mouseUp : function(){
				this.parent.selectionBox.startX = null;
				this.parent.selectionBox.startY = null;
				this.parent.selectionBox.endX = null;
				this.parent.selectionBox.endY = null;
				if(!this.parent.events.drag) {
					this.parent.helpers.clickSelect();
				}
			},
			mouseMove : function(){
				if(this.parent.events.drag)
				{
					this.parent.selecteds = [];

					this.parent.selectionBox.endX = this.parent.events.mouseX;
					this.parent.selectionBox.endY = this.parent.events.mouseY;

					var found  = false;

					this.parent.helpers.forEachObjects( $.proxy(function( o ){
						if( this.parent.helpers.isObjectSelected(o.id) ) return;
						if( o.locked                                   ) return;
						if( !o.visible                                 ) return;
						if(this.parent.helpers.collision( o, this.parent.selectionBox ))
						{
							found = true;
							this.parent.functions.select(o);
						}
					},this));
				}
			}
		},

		move : 
		{
			mouseDown : function(){
				this.parent.history.save();
				if(!this.parent.selecteds.length || this.parent.selectAndMove) this.parent.helpers.clickSelect();
				if(this.parent.events.alt)
				{
					this.parent.functions.copy();
					this.parent.functions.paste( true );
				}
				this.parent.events.startMoveX = this.parent.events.mouseX;
				this.parent.events.startMoveY = this.parent.events.mouseY;
				for(i in this.parent.selecteds)
				{

					var o = this.parent.selecteds[i];

					o.onMove = true;

					// if(o.src && !o.rotate) 
					// {
					// 	if(!o.originalSrc) {
					// 		o.originalSrc = o.src;
					// 	} else {
					// 		o.src    = o.originalSrc;
					// 		o.startX = o.originalStartX;
					// 		o.startY = o.originalStartY;
					// 		o.width  = o.originalWidth;
					// 		o.height = o.originalHeight;
					// 	}
					// }

					this.parent.temps.push({
						startX : o.startX,
						startY : o.startY,
						endX   : o.endX,
						endY   : o.endY,
					});
				}
			},
			mouseUp : function(){
				// assign cropped image data
				for(i in this.parent.selecteds)
				{

					var o = this.parent.selecteds[i];

					o.onMove = true;
					if(o.onDrop) o.onDrop();

					if(o.src){

						// issues:
						// - should handle rotation & other transformation
						// - should find viewable size and only render this (on helper canvas)
						// - should work in first drop of image to canvas

						// var mime;

						// if( o.src.search('image/png') != -1 || 
						// 	o.src.search('image/gif') != -1 ||
						// 	o.src.search('image/tif') != -1 ) continue/*mime = 'png'*/; else mime = 'jpeg';

						// var w = this.parent.width,
						// 	h = this.parent.height;

						// o.originalStartX = o.startX;
						// o.originalStartY = o.startY;
						// o.originalWidth  = o.width;
						// o.originalHeight = o.height;

						//get rendering dimensions
						// var rsx, rsy, rex, rey, rw, rh;
						// if(o.startX < 0) rsx = 0; else rsx = o.startX;
						// if(o.startY < 0) rsy = 0; else rsy = o.startY;
						// if(o.endX > w) rex = w; else rex = o.endX;
						// if(o.endY > h) rey = h; else rey = o.endY;
						// rw = rex - rsx;
						// rh = rey - rsy;

						// $(this.parent.helperCanvas).attr('width',rw);
						// $(this.parent.helperCanvas).attr('height',rh);

						// //get dimensions within the original image
						// if(o.startX < 0 && o.startY < 0 && o.endX < w && o.endY < h){
						// 	o.startX = o.startX;
						// 	o.startY = o.startY;
						// 	o.endX = 
						// }
						// else if(o.startX > 0 && o.startY < 0 && o.endX < w && o.endY > h) // case 2

						// this.parent.draw.clearCanvas(this.parent.helperCtx);
						// this.parent.draw.drawObject(o,this.parent.helperCtx);

						// o.src = this.parent.helperCanvas.toDataURL('image/'+mime,0.5);
						// o.startX = 0; 
						// o.startY = 0; 
						// o.width  = this.parent.width; 
						// o.height = this.parent.height;
					}

				}
				this.parent.temps = [];
			},
			mouseMove : function(){

				if(this.parent.events.drag)
				{
					this.parent.events.movedX = this.parent.events.mouseX - this.parent.events.startMoveX;
					this.parent.events.movedY = this.parent.events.mouseY - this.parent.events.startMoveY;
					for(i in this.parent.selecteds)
					{
						var o    = this.parent.selecteds[i],
							temp = this.parent.temps[i],
							x    = this.parent.events.movedX,
							y    = this.parent.events.movedY;

						if( o.locked   ) return;
						if( !o.visible ) return;

						o.startX = this.parent.helpers.getClosestSnapCoords( temp.startX + x );
						o.endX   = this.parent.helpers.getClosestSnapCoords( temp.endX   + x );
						o.startY = this.parent.helpers.getClosestSnapCoords( temp.startY + y );
						o.endY   = this.parent.helpers.getClosestSnapCoords( temp.endY   + y );
					}	
				}
			}
		},

		transform : 
		{
			mouseDown : function(){
				this.parent.eventsstartMoveX = this.mouseX;
				this.parent.eventsstartMoveY = this.mouseY;
				this.onResize = this.isCursorOnResize();
				if( this.isCursorOnRotate() ) this.onRotate = true;
			},
			mouseUp : function(){
				this.onResize = false;
				this.onRotate = false;
			},
			mouseMove : function(){

				if(this.drag)
				{
					if(this.onResize)
					{
						var o      = this.onResize.o,
							center = this.getCenter( o ),
							i      = this.onResize.pIndex,
							p      = this.getUnrotatedPoint( this.mouseX, this.mouseY, center.x, center.y, -o.rotate ),
							sx     = o.startX,
							sy     = o.startY,
							w      = o.width,
							h      = o.height,
							p1,p2;

						if( this.onResize.pIndex == 0 ) { p1 = { x: p.x, y: p.y }; p2 = { x: sx + w, y: sy + h }; }
						if( this.onResize.pIndex == 1 ) { p1 = { x: sx,  y: p.y }; p2 = { x: p.x,    y: sy + h }; };
						if( this.onResize.pIndex == 2 ) { p1 = { x: p.x, y: sy };  p2 = { x: sx + w, y: p.y}; };
						if( this.onResize.pIndex == 3 ) { p1 = { x: sx,  y: sy };  p2 = { x: p.x,    y: p.y }; };

						o.startX = p1.x;
						o.startY = p1.y;
						o.width  = p2.x - p1.x;
						o.height = p2.y - p1.y;
					}
					if(this.onRotate)
					{
						
					}
				}
				else
				{
					if( this.isCursorOnResize() ) $('.stage').addClass('resize');
					else $('.stage').removeClass('resize');

					if( this.isCursorOnRotate() ) $('.stage').addClass('rotate');	
					else $('.stage').removeClass('rotate');
				}
			}
		},

		box : 
		{
			mouseDown : function()
			{
				this.parent.history.save();
				this.parent.selecteds = [];
				newObject 			  = this.parent.create.object();
				this.parent.temp 	  = this.parent.current;
				this.parent.functions.select( newObject );
				this.parent.objects.push( newObject );
			},
			mouseMove : function()
			{
				if(this.parent.events.drag)
				{
					var tempObject = this.parent.functions.getObject( this.parent.temp ),
						point      = {
							x : this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseX ),
							y : this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseY )
						}
					tempObject.endX   = point.x;
					tempObject.endY   = point.y;
					tempObject.width  = (tempObject.endX - tempObject.startX);
					tempObject.height = (tempObject.endY - tempObject.startY);
				}
			},
			mouseUp : function()
			{
				var tempObject = this.parent.functions.getObject( this.parent.temp );
				if(!tempObject) return;
				if(tempObject.startX == tempObject.endX && 
				   tempObject.startY == tempObject.endY)
				{
					this.parent.functions.deleteObject( tempObject.id );
					tempObject = null;
				}
				else {
					this.parent.current ++;
				}
			}
		},

		text : 
		{
			mouseDown : function(){
				this.parent.history.save();
				this.parent.selecteds = [];
				newObject        = this.parent.create.object();
				this.parent.temp = this.parent.current;
				this.parent.objects.push( newObject );
			},
			mouseMove : function(){
				if(this.parent.events.drag)
				{
					var tempObject  = this.parent.functions.getObject( this.parent.temp ),
						point = {
							x : this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseX ),
							y : this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseY )
						}
				}
			},
			mouseUp : function(){
				if(this.parent.temp == null) return;
				var tempObject = this.parent.functions.getObject( this.parent.temp );
				this.parent.functions.select(tempObject);
				this.parent.temp = null;
				this.parent.current++;
			}
		},

		line : 
		{
			mouseDown : function(){},
			mouseUp : function(){},
			mouseMove : function(){}
		}
	}
})