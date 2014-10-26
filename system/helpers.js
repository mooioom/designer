
$.extend( true, designer, {

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

		getPointInPath : function( path, pointIndex ){
			var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			$(p).attr('d',path.path);
			return {
				x : p.pathSegList.getItem(pointIndex).x,
				y : p.pathSegList.getItem(pointIndex).y
			};
		},

		clickSelect : function()
		{
			if(!this.parent.events.ctrl) this.parent.selecteds = [];
			o = this.getObjectInPoint( { x : this.parent.events.mouseX, y : this.parent.events.mouseY } );
			if(o) 
			{
				if( o.locked   ) return;
				if( !o.visible ) return;
				selectedsIndex = this.isObjectSelected( o.id );
				if(selectedsIndex) this.parent.selecteds.splice(selectedsIndex,1);
				else this.parent.functions.select(o);
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

			if(o.type == 'line'){
				return [
					{ x: o.startX, y: o.startY },
					{ x: o.endX,   y: o.endY   },
				]
			}

			if(o.type == 'ellipse'){
				cx = o.cx;
				cy = o.cy;
				return [
					this.getRotatedPoint( cx, cy, o.startX + o.rx / 2, o.startY + o.ry, o.rotate),
					this.getRotatedPoint( cx, cy, o.startX + o.rx / 2, o.startY, o.rotate),
					this.getRotatedPoint( cx, cy, o.startX, o.startY + o.ry / 2, o.rotate),
					this.getRotatedPoint( cx, cy, o.startX + o.rx, o.startY + o.ry / 2, o.rotate)
				]
			}

			if(o.type == 'box'){

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

				return [
					{ x: p1.x, y: p1.y },
					{ x: p2.x, y: p2.y },
					{ x: p3.x, y: p3.y },
					{ x: p4.x, y: p4.y }
				];
			}

			if(o.type == 'path')
			{
				p      = o.getPathSegs();
				points = [];
				x      = 0;
				y      = 0;
				cx     = o.topLeftX+(o.width/2);
				cy     = o.topLeftY+(o.height/2);

				pathLength = p.length || p.numberOfItems;

				for(i=0;i<=pathLength-1;i++)
				{
					x = x + p.getItem(i).x;
					y = y + p.getItem(i).y;

					point = this.getRotatedPoint( cx, cy, x, y, o.rotate);

					points.push(point);
				}
				return points;
			}
		},

		isOverActionPoint : function(){

			var flag = false;
			var o = this.parent.selecteds[0];
			actionPoints = this.getActionPoints(o);
			for(x in actionPoints){
				target = actionPoints[x];
				var mouse = { x : this.parent.events.mouseX, y : this.parent.events.mouseY };
				if( this.isInRadius( target, mouse, this.parent.defaults.actionPoint.size ) ) 
				{
					flag = { objectType : o.type, target : target, pointIndex : Number(x) };
					this.parent.events.activeActionPoint = flag;
					return flag;
				}
			}
			return flag;

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

		selectedIs : function( what ){
			if( this.parent.selecteds.length != 1 )     return false;
			if( this.parent.selecteds[0].type == what ) return true;
			else return false;
		},

		getMousePosition : function( e )
		{
			var x = e.offsetX == undefined ? e.layerX : e.offsetX;
			var y = e.offsetY == undefined ? e.layerY : e.offsetY;
			this.parent.events.mouseX = x;
			this.parent.events.mouseY = y;
		},

		getPositionOnCanvas : function( globalPoint )
		{
			return { x: globalPoint.x - $('#canvas').offset().left, y: globalPoint.y - $('#canvas').offset().top };
		},

		getAngleBetweenTwoPoints : function(p1,p2){
			// radians
			var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
			// degrees
			var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;

			return angleDeg;
		},

		getLineDistance : function(p1,p2){
			var xs = 0,
				ys = 0;

			xs = p2.x - p1.x;
			xs = xs * xs;

			ys = p2.y - p1.y;
			ys = ys * ys;

			return Math.sqrt( xs + ys );
		},

		getObjectInPoint : function( point )
		{
			var target = null;
			this.forEachObjects( $.proxy(function( object ){

				if(!target && object.visible && !object.locked)
				{
					var x  = object.startX, y = object.startY, w = object.width, h = object.height,
						cx = w/2, cy = h/2, r = object.rotate;

					if(object.type == 'path')
					{
						x = object.topLeftX;
						y = object.topLeftY;
					}

					if(object.type == 'line')
					{

						r = this.getAngleBetweenTwoPoints({x:object.startX,y:object.startY},{x:object.endX,y:object.endY});
						d = this.getLineDistance({x:object.startX,y:object.startY},{x:object.endX,y:object.endY});

						w = d;
						h = object.lineWidth;

						cx = 0, cy = 0;

					}

					this.parent.ctx.save();
					this.parent.ctx.translate( x + cx, y + cy );
					this.parent.ctx.rotate(r*Math.PI/180);
					this.parent.ctx.translate( -(x + cx), -(y + cy) );
					this.parent.ctx.beginPath();

					if(object.type == 'line') y = y - object.lineWidth / 2;
					if(object.type != 'path') this.parent.ctx.rect(x,y,w,h);

					else{
						var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
						$(path).attr('d',object.path);
						this.parent.draw.path(this.parent.ctx,path);
						this.parent.ctx.closePath();
					}
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
			point = Math.round(point);
			if(this.parent.grid.snap && !this.parent.events.ctrl) {
				if(point % this.parent.grid.size > Math.round(this.parent.grid.size / 2) ) 
					 { while(point++) if(point % this.parent.grid.size == 0) return point; }
				else if( point % this.parent.grid.size == 0 )                return point;
				else { while(point--) if(point % this.parent.grid.size == 0) return point; }
			}
			else return point;
		},

		updateSelectedObjProp : function( prop, val, isString){
			if(!this.parent.selecteds.length) return;
			var o = this.parent.functions.getObject( this.parent.selecteds[0].id );
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

		timer : function( startStop, title){
			if(startStop == 'start' ) {
				this.timerStart = new Date().getTime();
				console.log(title+' started');
			}
			if(startStop == 'stop' ) {
				timerStop = new Date().getTime();
				console.log(title+' ended - '+ (timerStop - this.timerStart) +' milliseconds');
			}
		},

		equalObjects : function(obj1,obj2){
			if (!obj1 && !obj2) return true;
			if (obj2.constructor !== obj1.constructor) return false;
			var aMemberCount = 0;
			for (var a in obj2) {
				if (!obj2.hasOwnProperty(a)) continue;
				if (typeof obj2[a] === 'object' && 
					typeof obj1[a] === 'object' ? !this.equalObjects(obj2[a],obj1[a]) : obj2[a] !== obj1[a]) return false;
				++aMemberCount;
			}
			for (var a in obj1) if (obj1.hasOwnProperty(a)) --aMemberCount;
			return aMemberCount ? false : true;
		},

		resizePath : function( startingPoint, pathData, size){

			var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			$(path).attr('d',pathData);

			var pathClone = document.createElementNS("http://www.w3.org/2000/svg", "path");
			$(pathClone).attr('d',pathData);

			pathCloneData = this.getSvgPathInfo(pathClone);

			dividerW = 0;
			dividerH = 0;

			if(pathCloneData.w) dividerW = pathCloneData.w;
			if(pathCloneData.h) dividerH = pathCloneData.h;

			if(dividerW > dividerH) divider = dividerW;
			else divider = dividerH;

			pathLength = path.pathSegList.length || path.pathSegList.numberOfItems;

			for(i=0;i<=pathLength-1;i++)
			{

				seg       = path.pathSegList.getItem(i);
				segClone  = pathClone.pathSegList.getItem(i);

				if(i == 0) {
					seg.x = startingPoint.x;
					seg.y = startingPoint.y;
				}else{
					seg.x = (segClone.x * size) / divider;
					seg.y = (segClone.y * size) / divider;

					if(seg.x1) seg.x1 = (segClone.x1 * size) / divider;
					if(seg.y1) seg.y1 = (segClone.y1 * size) / divider;

					if(seg.x2) seg.x2 = (segClone.x2 * size) / divider;
					if(seg.y2) seg.y2 = (segClone.y2 * size) / divider;

					if(seg.r1) seg.r1 = (segClone.r1 * size) / divider;
					if(seg.r2) seg.r2 = (segClone.r2 * size) / divider;
				}
			}

			return path.getAttribute('d');
		},

		getSvgPathInfo : function( path ){

			var sx = 0,
				sy = 0,
				lx = 0,
				ly = 0,
				cx = 0,
				cy = 0;

			pathLength = path.pathSegList.length || path.pathSegList.numberOfItems;

			for(i=0;i<=pathLength-1;i++)
			{
				seg = path.pathSegList.getItem(i);

				if(seg.x) cx = cx + seg.x;
				if(seg.y) cy = cy + seg.y;

				if(i==0){
					sx = cx; 
					sy = cy;
				}
				if(seg.x){
					if(cx < sx) sx = cx;
					if(cx > lx) lx = cx;
				}
				if(seg.y){
					if(cy < sy) sy = cy;
					if(cy > ly) ly = cy;
				}
			}

			w = Math.abs(lx - sx);
			h = Math.abs(ly - sy);

			return {
				x : sx,
				y : sy,
				w : w,
				h : h 
			}

		}

	}

})