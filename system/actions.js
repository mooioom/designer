
$.extend( true, editor, {

	actions : {

		select : 
		{
			mouseDown : function(){
				if( !this.parent.events.ctrlIsPressed() ) this.parent.selecteds = [];
				this.parent.temp                = null;
				this.parent.selectionBox.startX = this.parent.events.mouseX;
				this.parent.selectionBox.startY = this.parent.events.mouseY;
			},
			mouseUp : function(){
				this.parent.selectionBox = {};
				if(!this.parent.events.drag) this.parent.helpers.clickSelect();
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
				if(this.parent.events.altIsPressed)
				{
					this.parent.copy();
					this.parent.paste( true );
				}
				this.parent.events.startMoveX = this.parent.events.mouseX;
				this.parent.events.startMoveY = this.parent.events.mouseY;
				for(i in this.parent.selecteds)
					this.parent.temps.push({
						startX : this.parent.selecteds[i].startX,
						startY : this.parent.selecteds[i].startY,
						endX   : this.parent.selecteds[i].endX,
						endY   : this.parent.selecteds[i].endY,
					});
			},
			mouseUp : function(){
				this.parent.temps = [];
			},
			mouseMove : function(){
				if(this.parent.events.drag)
				{
					this.parent.events.movedX = this.parent.events.mouseX - this.parent.events.startMoveX;
					this.parent.events.movedY = this.parent.events.mouseY - this.parent.events.startMoveY;
					for(i in this.parent.selecteds)
					{
						var o = this.parent.selecteds[i];
						if( o.locked   ) return;
						if( !o.visible ) return;
						o.startX = this.parent.helpers.getClosestSnapCoords( this.parent.temps[i].startX + this.parent.events.movedX );
						o.endX   = this.parent.helpers.getClosestSnapCoords( this.parent.temps[i].endX   + this.parent.events.movedX );
						o.startY = this.parent.helpers.getClosestSnapCoords( this.parent.temps[i].startY + this.parent.events.movedY );
						o.endY   = this.parent.helpers.getClosestSnapCoords( this.parent.temps[i].endY   + this.parent.events.movedY );
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