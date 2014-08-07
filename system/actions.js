
$.extend( true, editor, {

	actions : {

		select : 
		{
			mouseDown : function(){
				if(!this.ctrlIsPressed) this.selectedObjects = [];
				this.tempObject          = null;
				this.selectionBox.startX = this.mouseX;
				this.selectionBox.startY = this.mouseY;
			},
			mouseUp : function(){
				this.selectionBox.startX = null;
				this.selectionBox.startY = null;
				this.selectionBox.endX   = null;
				this.selectionBox.endY   = null;
				if(!this.drag) this.clickSelect();
			},
			mouseMove : function(){
				if(this.drag)
				{
					this.selectedObjects = [];

					this.selectionBox.endX = this.mouseX;
					this.selectionBox.endY = this.mouseY;

					var found  = false;

					this.forEachObjects( $.proxy(function( o ){
						if( this.isObjectSelected(o.id) ) return;
						if( o.locked                    ) return;
						if( !o.visible                  ) return;
						if(this.collision( o, this.selectionBox ))
						{
							found = true;
							this.select(o);
						}
					},this));
				}
			}
		},

		move : 
		{
			mouseDown : function(){
				this.saveHistory();
				if(!this.selectedObjects.length || this.selectAndMove) this.clickSelect();
				if(this.altIsPressed)
				{
					this.copy();
					this.paste( true );
				}
				this.startMoveX = this.mouseX;
				this.startMoveY = this.mouseY;
				for(i in this.selectedObjects)
					this.tempSelecteds.push({
						startX : this.selectedObjects[i].startX,
						startY : this.selectedObjects[i].startY,
						endX   : this.selectedObjects[i].endX,
						endY   : this.selectedObjects[i].endY,
					});
			},
			mouseUp : function(){
				this.tempSelecteds = [];
			},
			mouseMove : function(){
				if(this.drag)
				{
					this.movedX = this.mouseX - this.startMoveX;
					this.movedY = this.mouseY - this.startMoveY;
					for(i in this.selectedObjects)
					{
						var o = this.selectedObjects[i];
						if( o.locked   ) return;
						if( !o.visible ) return;
						o.startX = this.getClosestSnapCoords( this.tempSelecteds[i].startX + this.movedX );
						o.endX   = this.getClosestSnapCoords( this.tempSelecteds[i].endX   + this.movedX );
						o.startY = this.getClosestSnapCoords( this.tempSelecteds[i].startY + this.movedY );
						o.endY   = this.getClosestSnapCoords( this.tempSelecteds[i].endY   + this.movedY );
					}	
				}
			}
		},

		transform : 
		{
			mouseDown : function(){
				this.startMoveX = this.mouseX;
				this.startMoveY = this.mouseY;
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
				this.saveHistory();
				this.selectedObjects = [];
				newObject 			 = this.createObject();
				this.tempObject 	 = this.currentObject;
				this.select( newObject );
				this.objects.push( newObject );
			},
			mouseMove : function()
			{
				if(this.drag)
				{
					var tempObject = this.getObject( this.tempObject ),
						point      = {
							x : this.getClosestSnapCoords( this.mouseX ),
							y : this.getClosestSnapCoords( this.mouseY )
						}
					tempObject.endX   = point.x;
					tempObject.endY   = point.y;
					tempObject.width  = (tempObject.endX - tempObject.startX);
					tempObject.height = (tempObject.endY - tempObject.startY);
				}
			},
			mouseUp : function()
			{
				var tempObject = this.getObject( this.tempObject );
				if(tempObject.startX == tempObject.endX && 
				   tempObject.startY == tempObject.endY)
				{
					this.deleteObject( tempObject.id );
					tempObject = null;
				}
				else {
					this.currentObject++;
				}
			}
		},

		text : 
		{
			mouseDown : function(){
				this.saveHistory();
				this.selectedObjects = [];
				newObject       = this.createObject();
				this.tempObject = this.currentObject;
				this.objects.push( newObject );
			},
			mouseMove : function(){
				if(this.drag)
				{
					var tempObject  = this.getObject( this.tempObject ),
						point      = {
							x : this.getClosestSnapCoords( this.mouseX ),
							y : this.getClosestSnapCoords( this.mouseY )
						}
				}
			},
			mouseUp : function(){
				if(this.tempObject == null) return;
				var tempObject = this.getObject( this.tempObject );
				this.select(tempObject);
				this.tempObject = null;
				this.currentObject++;
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