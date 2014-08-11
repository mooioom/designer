
$.extend( true, editor, {

	helpers : {

		positionCanvas : function(){

			var stageW  = Number($('.stage').width()),
				stageH  = Number($('.stage').height()),
				marginW = (stageW - this.parent.width) / 2,
				marginH = (stageH - this.parent.height) / 2;

			if(marginH > 50 || marginH < 0) marginH = 50;

			$('#canvas, #gridCanvas').css('left',marginW + 'px');
			$('#canvas, #gridCanvas').css('top', marginH + 'px');

		},

		clickSelect : function()
		{
			if(!this.parent.events.ctrlIsPressed) this.parent.selecteds = [];
			o = this.getObjectInPoint( { x : this.parent.events.mouseX, y : this.parent.events.mouseY } );
			if(o) 
			{
				if( o.locked   ) return;
				if( !o.visible ) return;
				selectedsIndex = this.isObjectSelected( o.id );
				if(selectedsIndex) this.parent.selecteds.splice(selectedsIndex,1);
				else this.parent.select(o);
			}
		},

		getUnrotatedPoint : function(x, y, xm, ym, a){
			var cos = Math.cos,
		        sin = Math.sin,
		        a   = a * Math.PI / 180,
		        xr  = (x - xm) * cos(a) - (y - ym) * sin(a)   + xm,
		        yr  = (x - xm) * sin(a) + (y - ym) * cos(a)   + ym;
		    return {
		    	x : xr,
		    	y : yr
		    }
		},

		getCenter : function( o ){
			return {
				x : o.startX + (o.width/2),
				y : o.startY + (o.height/2)
			}
		},

		isCursorOnResize : function(){
			var flag = false;
			for(i in this.parent.selecteds){
				var o = this.parent.selecteds[i];
				actionPoints = this.getActionPoints(o);
				for(x in actionPoints){
					target = actionPoints[x];
					if( this.isInRadius( target, {x : this.mouseX, y: this.mouseY}, this.actionPointSize ) ) 
						{flag = { o : o, target : target, pIndex : x };return flag;}
				}
			}
			return flag;
		},

		isCursorOnRotate : function(){

		},

		isInRadius : function( targetPoint, point, radius )
		{
		    var dx = point.x - targetPoint.x;
		    var dy = point.y - targetPoint.y;
		    return dx*dx+dy*dy <= radius*radius;
		},

		getLastId : function(){

			id = 0;
			for(i in this.parent.objects) if(this.parent.objects[i].id > id) id = this.parent.objects[i].id;
			return id;

		},

		getActionPoints : function( o )
		{
			if(!o) return;

			var x  = o.startX,
				y  = o.startY,
				w  = o.width,
				h  = o.height,
				r  = o.rotate,
				cx = x + (w / 2),
				cy = y + (h / 2);

			p1 = this.getRotatedPoint( cx, cy, x, y, r);
			p2 = this.getRotatedPoint( cx, cy, x+w, y, r);
			p3 = this.getRotatedPoint( cx, cy, x, y+h, r);
			p4 = this.getRotatedPoint( cx, cy, x+w, y+h, r);

			var points = [
				{ x: p1.x, y: p1.y },
				{ x: p2.x, y: p2.y },
				{ x: p3.x, y: p3.y },
				{ x: p4.x, y: p4.y }
			]

			return points;

		},

		getRotatedPoint : function(cx, cy, x, y, angle){
			var radians = (Math.PI / 180) * angle,
		        cos = Math.cos(radians),
		        sin = Math.sin(radians),
		        nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
		        ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
		    return {
		    	x : nx,
		    	y : ny
		    };
		},

		

		getAbsCoords : function(x, y, w, h)
		{
			//returns absolute coords when width || height < 0
			if( w < 0 ) {w = Math.abs(w); x = x - w}
			if( h < 0 ) {h = Math.abs(h); y = y - h}
			return {
				x : x,
				y : y,
				w : w,
				h : h
			}
		},

		selectedIsText : function()
		{
			if( this.parent.selecteds.length != 1 )       return false;
			if( this.parent.selecteds[0].type == 'text' ) return true;
			else return false;
		},

		selectedIsBox : function()
		{
			if( this.parent.selecteds.length != 1 )      return false;
			if( this.parent.selecteds[0].type == 'box' ) return true;
			else return false;
		},

		getMousePosition : function( e )
		{
			this.parent.events.mouseX = e.offsetX;
			this.parent.events.mouseY = e.offsetY;
		},

		getPositionOnCanvas : function( globalPoint )
		{
			return { x: globalPoint.x - $('#canvas').offset().left, y: globalPoint.y - $('#canvas').offset().top };
		},

		getObjectInPoint : function( point )
		{
			var target = null;
			this.forEachObjects( $.proxy(function( object ){

				if(!target)
				{
					var x  = object.startX, y = object.startY, w = object.width, h = object.height,
						cx = w/2, cy = h/2, r = object.rotate;

					this.parent.ctx.save();
					this.parent.ctx.translate( x + cx, y + cy );
					x = 0 - cx; y = 0 - cy;
					this.parent.ctx.rotate(r*Math.PI/180);
					this.parent.ctx.beginPath();
					this.parent.ctx.rect(x,y,w,h);
					if (this.parent.ctx.isPointInPath(point.x,point.y)) target = object;
					this.parent.ctx.closePath();
					this.parent.ctx.restore();
				}

			},this), true );
			return target;
		},

		forEachObjects : function( callback, startAtTop ){

			// returns : callback(object, index)

			if(startAtTop)
			{
				var x = this.parent.objects.length;
				while(x--) { callback( this.parent.objects[x], x); }
			}
			else for(x in this.parent.objects) callback( this.parent.objects[x], x); 
		},

		collision : function( object1, object2 ){
			if(
				this.pointIsBetweenPoints({ x : object1.startX, y : object1.startY },object2) ||
				this.pointIsBetweenPoints({ x : object1.startX, y : object1.endY   },object2) ||
				this.pointIsBetweenPoints({ x : object1.endX,   y : object1.startY },object2) ||
				this.pointIsBetweenPoints({ x : object1.endX,   y : object1.endY   },object2) ||
				this.pointIsBetweenPoints({ x : object2.startX, y : object2.startY },object1) ||
				this.pointIsBetweenPoints({ x : object2.startX, y : object2.endY   },object1) ||
				this.pointIsBetweenPoints({ x : object2.endX,   y : object2.startY },object1) ||
				this.pointIsBetweenPoints({ x : object2.endX,   y : object2.endY   },object1) ||
				this.objectsIntersect( object2, object1 )
			) return true;
		},

		pointIsBetweenPoints : function( point , points ){
			if(
				(
					((point.x >= points.startX && point.x <= points.endX) || (point.x >= points.endX && point.x <= points.startX)) && 
					((point.y >= points.startY && point.y <= points.endY) || (point.y >= points.endY && point.y <= points.startY))
				)
			) return true;
		},

		objectsIntersect : function( object1, object2 ){
			if( 
				(
					(
						(object1.startX <= object2.startX && object1.endX >= object2.endX) &&
						(object1.startY >= object2.startY && object1.endY <= object2.endY)
					) ||
					(
						(object1.endX <= object2.startX && object1.startX >= object2.endX) &&
						(object1.endY >= object2.startY && object1.startY <= object2.endY)
					)
				) ||
				(
					(
						(object1.startY <= object2.startY && object1.endY >= object2.endY) &&
						(object1.startX >= object2.startX && object1.endX <= object2.endX)
					) ||
					(
						(object1.endY <= object2.startY && object1.startY >= object2.endY) &&
						(object1.endX >= object2.startX && object1.startX <= object2.endX)
					)
				)
			) return true;
		},

		isObjectSelected : function( objectId ){
			var flag = false;
			for(i in this.parent.selecteds) if( this.parent.selecteds[i].id == objectId ) flag = i;
			return flag;
		},

		getClosestSnapCoords : function( point ){
			if(this.parent.grid.snap && !this.parent.events.ctrlIsPressed) {
				if(point % this.parent.grid.size > Math.round(this.parent.grid.size / 2) ) 
					 { while(point++) if(point % this.parent.grid.size == 0) return point; }
				else if( point % this.parent.grid.size == 0 )                return point;
				else { while(point--) if(point % this.parent.grid.size == 0) return point; }
				
			}
			else return point;
		},

		updateSelectedObjProp : function( prop, val, isString){
			if(!this.parent.selecteds.length) return;
			var o = this.parent.getObject( this.parent.selecteds[0].id );
			if(!o) return;
			if(!isString) val = Number(val);
			if(this.parent.resizeLinked){
				if(prop=='width' || prop=='height'){
					oldW = o.width;
					oldH = o.height;
					if(prop =='width')  {d = val-oldW; o.height = o.height + d}
					if(prop =='height') {d = val-oldH; o.width  = o.width + d}
				}
			}
			o[prop] = val;
			this.parent.draw.toolbar();
		},

		toggleObjectsOptions : function(){

			if(this.parent.selecteds && this.parent.selecteds.length) {
				$('.toolbox.objects .toolboxMenu .shadow').removeClass('disabled');
				$('.toolbox.objects .toolboxMenu .transform').removeClass('disabled');
				$('.toolbox.objects .toolboxMenu .delete').removeClass('disabled');
			}
			else {
				$('.toolbox.objects .toolboxMenu .shadow').addClass('disabled');
				$('.toolbox.objects .toolboxMenu .transform').addClass('disabled');
				$('.toolbox.objects .toolboxMenu .delete').addClass('disabled');
			}

		}

	}

})