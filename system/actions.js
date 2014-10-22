
$.extend( true, designer, {

	actions : {

		select : 
		{
			mouseDown : function(){
				if( !this.parent.events.ctrl ) this.parent.selecteds = [];
				this.parent.events.exitEditMode();
				this.parent.temp                = null;
				this.parent.selectionBox.startX = this.parent.events.mouseX;
				this.parent.selectionBox.startY = this.parent.events.mouseY;
			},
			mouseUp : function(){
				this.parent.selectionBox.startX = null;
				this.parent.selectionBox.startY = null;
				this.parent.selectionBox.endX = null;
				this.parent.selectionBox.endY = null;
				if(!this.parent.events.drag)  this.parent.helpers.clickSelect();
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

						if(o.type == 'ellipse'){
							o.cx = this.parent.helpers.getClosestSnapCoords( temp.startX + o.rx / 2 + x );
							o.cy = this.parent.helpers.getClosestSnapCoords( temp.startY + o.ry / 2 + y );
							continue;
						}

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
				this.parent.events.exitEditMode();
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
			},
			actionPointDown : function( p ){
				//console.log('box actionPointDown')
			},
			actionPointMove : function( p ){
				//console.log('box actionPointMove')
			},
			actionPointUp   : function( p ){
				//console.log('box actionPointUp')
			}
		},

		line : 
		{
			mouseDown : function(){
				this.parent.history.save();
				this.parent.selecteds = [];
				this.parent.events.exitEditMode();
				newObject 			  = this.parent.create.object();
				this.parent.temp 	  = this.parent.current;
				this.parent.functions.select( newObject );
				this.parent.objects.push( newObject );
			},
			mouseMove : function(){
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
			mouseUp : function(){
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
			},
			actionPointDown : function( p ){

			},
			actionPointMove : function( p ){
				if(this.parent.events.actionPointDrag)
				{
					if(p.pointIndex == 0) a = 'start';
					if(p.pointIndex == 1) a = 'end';
					this.parent.selecteds[0][a+'X'] = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseX );
					this.parent.selecteds[0][a+'Y'] = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseY );	
				}
			},
			actionPointUp   : function( p ){

			}
		},

		ellipse : 
		{
			mouseDown : function(){
				this.parent.history.save();
				this.parent.selecteds = [];
				this.parent.events.exitEditMode();
				newObject 			  = this.parent.create.object();
				this.parent.temp 	  = this.parent.current;
				this.parent.functions.select( newObject );
				this.parent.objects.push( newObject );
			},
			mouseMove : function(){
				if(this.parent.events.drag)
				{
					var tempObject = this.parent.functions.getObject( this.parent.temp ),
						point      = {
							x : this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseX ),
							y : this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseY )
						}
					tempObject.rx  = this.parent.helpers.getLineDistance(
						{
							x : tempObject.cx,
							y : tempObject.cy
						},{
							x : point.x,
							y : point.y
						}
					) * 2;
					tempObject.ry = tempObject.rx;
				}
			},
			mouseUp : function(){
				var tempObject = this.parent.functions.getObject( this.parent.temp );
				if(!tempObject) return;
				if(tempObject.rx < 1)
				{
					this.parent.functions.deleteObject( tempObject.id );
					tempObject = null;
				}
				else {
					this.parent.current ++;
				}
			},
			actionPointDown : function( p ){},
			actionPointMove : function( p ){
				if(this.parent.events.actionPointDrag)
				{
					o = this.parent.selecteds[0];
					if(p.pointIndex == 0 || p.pointIndex == 1) a = 'ry'; 
					if(p.pointIndex == 2 || p.pointIndex == 3) a = 'rx'; 
					o[a] = this.parent.helpers.getLineDistance(
						{
							x : o.cx,
							y : o.cy
						},{
							x : this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseX ),
							y : this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseY )
						}
					) * 2
				}
			},
			actionPointUp   : function( p ){}
		},

		path : 
		{
			currentPoint  : 0,
			currentPointX : 0,
			currentPointY : 0,
			initX         : 0,
			initY         : 0,
			createNewSeg  : false,

			movedX     : 0,
			movedY     : 0,
			initPointX : 0,
			initPointY : 0,

			mouseDown : function(){
				if(!this.parent.events.createPathMode)
				{
					//create
					this.parent.events.createPathMode = true;
					this.parent.history.save();
					this.parent.selecteds = [];
					this.parent.events.exitEditMode();
					newObject        = this.parent.create.object();
					this.parent.temp = this.parent.current;
					this.parent.objects.push( newObject );
					this.path.currentPoint  = 0;
					this.path.currentPointX = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseX );
					this.path.currentPointY = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseY );
					this.path.initX         = this.path.currentPointX;
					this.path.initY         = this.path.currentPointY;
					this.path.createNewSeg  = true;
					this.parent.functions.select(newObject);
					this.parent.current ++;
				}else{
					//add point
					this.path.currentPoint ++ ;
					x = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseX ) - this.path.currentPointX;
					y = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseY ) - this.path.currentPointY;
					this.path.currentPointX = this.path.currentPointX + x;
					this.path.currentPointY = this.path.currentPointY + y;
					this.path.createNewSeg  = true;
				}
			},
			mouseMove : function(){
				if(this.parent.events.createPathMode)
				{
					tempPath = this.parent.functions.getObject( this.parent.temp );
					x = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseX ) - this.path.currentPointX;
					y = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseY ) - this.path.currentPointY;
					p = tempPath.getPath();
					if(this.path.createNewSeg){
						this.path.createNewSeg = false;
						p.pathSegList.appendItem(p.createSVGPathSegLinetoRel(x,y));
					}
					p.pathSegList.getItem(p.pathSegList.length-1).x = x;
					p.pathSegList.getItem(p.pathSegList.length-1).y = y;
					tempPath.path = p.getAttribute('d');
				}
			},
			removeLastSeg : function(){
				if(this.parent.parent.events.createPathMode)
				{
					tempPath = this.parent.parent.functions.getObject( this.parent.parent.temp );
					p = tempPath.getPath();
					p.pathSegList.removeItem( p.pathSegList.length - 1 );
					tempPath.path = p.getAttribute('d');
					this.parent.parent.render();
				}
			},
			mouseUp : function(){},

			actionPointDown : function( p ){
				o                    = this.parent.selecteds[0];
				tempPath             = o.getPath();
				this.path.initX      = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseX );
				this.path.initY      = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseY );
				this.path.initPoints = [];
				for(i in tempPath.pathSegList)
				{
					if(typeof tempPath.pathSegList.getItem(i).x != 'undefined')
					this.path.initPoints.push({
						x : tempPath.pathSegList.getItem(i).x,
						y : tempPath.pathSegList.getItem(i).y
					})
				}
				this.parent.events.selectedActionPoint = p;
			},
			actionPointMove : function( p ){
				if(this.parent.events.actionPointDrag)
				{
					
					this.path.movedX = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseX - this.path.initX );
					this.path.movedY = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseY - this.path.initY );

					o = this.parent.selecteds[0];

					tempPath = o.getPath();

					if(tempPath.pathSegList.length > p.pointIndex+1)
					{
						tempPath.pathSegList.getItem(p.pointIndex+1).x = this.path.initPoints[p.pointIndex+1].x - this.path.movedX;
						tempPath.pathSegList.getItem(p.pointIndex+1).y = this.path.initPoints[p.pointIndex+1].y - this.path.movedY;
					}

					tempPath.pathSegList.getItem(p.pointIndex).x = this.path.initPoints[p.pointIndex].x + this.path.movedX;
					tempPath.pathSegList.getItem(p.pointIndex).y = this.path.initPoints[p.pointIndex].y + this.path.movedY;

					if(p.pointIndex == 0){
						o.startX = this.path.initPoints[p.pointIndex].x + this.path.movedX;
						o.startY = this.path.initPoints[p.pointIndex].y + this.path.movedY;
					}

					o.path = tempPath.getAttribute('d');

					actionPoints = this.parent.helpers.getActionPoints(o);

					this.parent.events.selectedActionPoint = {
						pointIndex : p.pointIndex,
						objectType : o.type,
						target : {
							x : actionPoints[p.pointIndex].x,
							y : actionPoints[p.pointIndex].y
						}
					}

					this.parent.render();
				}
			},
			actionPointUp   : function( p ){

			}
		},

		text : 
		{
			mouseDown : function(){
				this.parent.history.save();
				this.parent.selecteds = [];
				this.parent.events.exitEditMode();
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
		}
	},

	actionPoints : {



	}
})