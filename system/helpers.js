
$.extend( true, Designer, {

	helpers : {

		init : function(){

			String.prototype.capitalize = function() {return this.charAt(0).toUpperCase() + this.slice(1);}
			String.prototype.format = function() { var args = arguments; return this.replace(/{(\d+)}/g, function(match, number) { return typeof args[number] != 'undefined' ? args[number] : match ; });};
			jQuery.fn.outerHTML = function(s) {return s ? this.before(s).remove() : jQuery("<p>").append(this.eq(0).clone()).html();};
			window.getString = function( name ){return $('string[resource="'+name+'"]').attr('value');}
			window.getParams = function(){var a,b,c = /\+/g,d = /([^&=]+)=?([^&]*)/g,e = function (s) { return decodeURIComponent(s.replace(c, " ")); },f = window.location.d.substring(1);a = {};while (b = d.exec(f)) a[e(b[1])] = e(b[2]);return a;}

		},

		context : function( item, root )
		{
			// create parent context for all child objects
			for(var i in item) if(item[i] && Object.prototype.toString.call(item[i]).search('Object') != -1) 
			{
				if(i == 'clipboard' || i == 'gradient') continue;
				if(i != 'parent' && i != 'root') this.context( item[i], root );
				item[i].parent = item;
				item[i].root   = root;
			}
		},

		positionCanvas : function(w,h){

			var stageW  = Number($('.stage').width()),
				stageH  = Number($('.stage').height()),
				marginW = (stageW - w) / 2,
				marginH = (stageH - h) / 2;

			if(marginH > 50 || marginH < 0) marginH = 50;

			if(w == window.screen.availWidth){
				marginH = 0;
				marginW = 0;
			}

			$('#canvas, #gridCanvas').css('left',marginW + 'px');
			$('#canvas, #gridCanvas').css('top', marginH + 'px');

		},

		where : function( q ){
			var q = q.split('='), r = [], os = this.parent.objects;
			for(i in os) if(os[i][q[0]] && os[i][q[0]] == q[1]) r.push(os[i]); return r;
		},

		log : function(){console.log( this.parent.selecteds[0] );},

		include : function( url ){$.ajax({url:url,dataType:'script',async:false });},
		getHtml : function( url ){var res;$.ajax({url:url,async:false,success : function(html){res = html;}});return res;},

		getToolbox : function( name ){
			for(i in this.parent.toolboxes) {t=this.parent.toolboxes[i];if(t.name==name) return t}
		},

		getPointInPath : function( path, pointIndex ){
			var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			$(p).attr('d',path.path);
			return {
				x : p.pathSegList.getItem(pointIndex).x,
				y : p.pathSegList.getItem(pointIndex).y
			};
		},

		getNested : function( fullVersion, keepOriginalOrder )
		{

			var objects   		= keepOriginalOrder ? $.extend(true,[],this.parent.objects) : $.extend(true,[],this.parent.objects).reverse(),
				selecteds 		= [], 
				groups    		= this.parent.groups,
				selectedsGroups = this.parent.selectedsGroups,
				a = [], b = [];

			for(i in this.parent.selecteds) selecteds.push( this.parent.selecteds[i].id );

			function processObject( o, gid ){
				var data = {};
				if(fullVersion){
					data = o; data.oType = 'object';
				}else{
					data = { 
						oType    : 'object', 
						title    : o.title, 
						id       : o.id,
						visible  : o.visible,
						locked   : o.locked,
						src      : o.src ? true : false,
						type     : o.type,
						text     : o.text,
						selected : selecteds.indexOf( o.id ) != -1
					}
				}
				createAtGid( gid, data ) 
			}
			function getGroup( id ){ for(i in groups) if(groups[i].id == id) return groups[i];
				var newGroup = {
					collapsed : false,
					groupId   : undefined,
					id        : id,
					locked    : false,
					title     : "Group "+id,
					visible   : true
				};
				groups.push(newGroup);
				return newGroup;
			}
			function createAtGid( gid, data ){
				if(!gid) a.push(data);
				else for(i in a) if( a[i].oType == 'group') createAtGidPath( a[i], gid, data );
			}
			function createAtGidPath( obj, gid, data ){
				if( obj.gid == gid ) { obj.objects.push( data ); return; }
				else for(i in obj.objects) if( obj.objects[i].oType == 'group' ) createAtGidPath( obj.objects[i], gid, data );
			}
			function processGroup( g ){
				if( b.indexOf( g.id ) == -1 ){
					if(g.groupId && b.indexOf( g.groupId ) == -1) processGroup( getGroup( g.groupId ), g.groupId );
					b.push( g.id );
					var data = {
						oType     : 'group',
						title     : g.title,
						gid       : g.id,
						groupId   : g.groupId,
						visible   : g.visible,
						locked    : g.locked,
						collapsed : g.collapsed,
						selected  : selectedsGroups.indexOf( g.id ) != -1,
						objects   : []
					} 
					createAtGid(g.groupId,data)
				}
			}

			for(i in objects)
			{
				var o = objects[i];
				if(typeof o.groupId == 'number') { processGroup( getGroup( o.groupId ), o.groupId ); processObject( o, o.groupId );
				}else processObject( o );
			}

			return a;

		},

		clickSelect : function( noGroup )
		{
			if(!this.parent.events.ctrl) this.parent.selecteds = [];
			if( noGroup && this.parent.selectGroup ) { var turnOnSelectGroup = true; this.parent.selectGroup = false }
			o = this.getObjectInPoint( { x : this.parent.events.mouseX, y : this.parent.events.mouseY } );
			if(o) 
			{
				if( o.locked   ) return;
				if( !o.visible ) return;
				selectedsIndex = this.isObjectSelected( o.id );
				if(selectedsIndex) this.parent.selecteds.splice(selectedsIndex,1);
				else this.parent.functions.select(o);
				return o;
			}
			if( turnOnSelectGroup ) this.parent.selectGroup = true;
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
			if(o.type == 'path'){
				return {
					x : o.topLeftX + (o.width/2),
					y : o.topLeftY + (o.height/2)
				}
			}
			return {
				x : o.startX + (o.width/2),
				y : o.startY + (o.height/2)
			}
		},

		setByCenter : function( o, centerPoint ){
			if(o.type == 'box' || o.type == 'text')
			{
				o.startX = centerPoint.x - (o.width / 2);
				o.startY = centerPoint.y - (o.height / 2);
			}
			if( o.type == 'line' )
			{
				o.startX = centerPoint.x - (o.width / 2);
				o.startY = centerPoint.y - (o.height / 2);
				o.endX   = centerPoint.x + (o.width / 2);
				o.endY   = centerPoint.y + (o.height / 2);
			}
			if( o.type == 'ellipse' )
			{
				o.cx = centerPoint.x;
				o.cy = centerPoint.y;
			}
			if( o.type == 'path' )
			{
				o.startX = centerPoint.x - (o.width / 2)  + Math.abs( o.startX - o.topLeftX );
				o.startY = centerPoint.y - (o.height / 2) + Math.abs( o.startY - o.topLeftY ); 
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

		getTransformDimensions : function(){

			var x1 = 100000,
				y1 = 100000,
				x2 = -100000,
				y2 = -100000,
				c;

			for(i in this.parent.selecteds){

				o = this.parent.selecteds[i];

				points = this.getActionPoints( o );

				for(j in points){

					point = points[j];

					if(point.x < x1) x1 = point.x;
					if(point.y < y1) y1 = point.y;
					if(point.x > x2) x2 = point.x;
					if(point.y > y2) y2 = point.y;
					
				}

			}

			c = { x : (x1 + x2) / 2, y : (y1 + y2) / 2 }

			transformDimensions = {
				x1 : x1, y1 : y1,
				x2 : x2, y2 : y2,
				c  : c
			}

			this.parent.events.transformDimensions = transformDimensions;

			return transformDimensions;

		},

		getActionPoints : function( o )
		{
			if(!o) return;

			if(o.type == 'line')
			{
				c = this.getCenter( o );
				return [
					this.getRotatedPoint( c.x, c.y, o.startX, o.startY, o.rotate ),
					this.getRotatedPoint( c.x, c.y, o.endX,    o.endY, o.rotate )
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

			if(o.type == 'box' || o.type == 'text'){

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
				cx     = o.topLeftX + ( o.width / 2  );
				cy     = o.topLeftY + ( o.height / 2 );

				pathLength = p.length || p.numberOfItems;

				for(i=0;i<=pathLength-1;i++)
				{
					x = x + p.getItem(i).x;
					y = y + p.getItem(i).y;

					point = this.getRotatedPoint( cx, cy, x, y, o.rotate );

					points.push( point );
				}
				return points;
			}
		},

		scale : function( o, percent, scaleCenter ){
			// scales an object from it's center (amount = percent)

			w  = o.scaleData.width;
			h  = o.scaleData.height;
			x1 = o.scaleData.startX;
			y1 = o.scaleData.startY;

			cx = x1 + w/2;
			cy = y1 + h/2;

			if(o.type == 'path')
			{
				oldPath = o.scaleData.path;
				x1 = o.scaleData.tlx;
				y1 = o.scaleData.tly;
				sx = o.scaleData.startX;
				sy = o.scaleData.startY;
				cx = x1 + w/2;
				cy = y1 + h/2;
			}

			o.width  = w * (percent/100);
			o.height = h * (percent/100);

			if(o.type == 'text')
			{
				fontSize = o.scaleData.fontSize;
				o.fontSize = fontSize * (percent/100);
			}

			if(o.type == 'ellipse')
			{
				rx = o.scaleData.rx;
				ry = o.scaleData.ry;
				o.rx = rx * (percent/100);
				o.ry = ry * (percent/100);
			}
			
			originalDistanceOfCXFromCenter = scaleCenter.x - cx;
			originalDistanceOfCYFromCenter = scaleCenter.y - cy;

			newDistanceOfCXFromCenter = originalDistanceOfCXFromCenter - ( originalDistanceOfCXFromCenter * ( percent/100 ) );
			newDistanceOfCYFromCenter = originalDistanceOfCYFromCenter - ( originalDistanceOfCYFromCenter * ( percent/100 ) );

			cx = cx + newDistanceOfCXFromCenter;
			cy = cy + newDistanceOfCYFromCenter;

			if(o.type == 'path')
			{

				o.topLeftX = x1 * (percent/100);
				o.topLeftY = y1 * (percent/100);

				o.startX = sx * (percent/100);
				o.startY = sy * (percent/100);

				var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				$(path).attr('d',o.path);

				var path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
				$(path2).attr('d',oldPath);

				pathLength = path.pathSegList.length || path.pathSegList.numberOfItems;

				for(i=0;i<=pathLength-1;i++)
				{
					if(i==0) continue;

					seg    = path.pathSegList.getItem(i);
					segOld = path2.pathSegList.getItem(i);

					if(segOld.x)  seg.x  = segOld.x  * (percent/100);
					if(segOld.y)  seg.y  = segOld.y  * (percent/100);
					if(segOld.x1) seg.x1 = segOld.x1 * (percent/100);
					if(segOld.y1) seg.y1 = segOld.y1 * (percent/100);
					if(segOld.x2) seg.x2 = segOld.x2 * (percent/100);
					if(segOld.y2) seg.y2 = segOld.y2 * (percent/100);
					if(segOld.r1) seg.r1 = segOld.r1 * (percent/100);
					if(segOld.r2) seg.r2 = segOld.r2 * (percent/100);

				}

				o.path = path.getAttribute('d');
			}
			this.setByCenter(o,{x:cx,y:cy});
		},

		subtractFromPosition : function( w, h ){

			for(i in this.parent.objects)
			{
				o = this.parent.objects[i];

				if( o.type == 'ellipse' ){
					o.cx = o.cx - w;
					o.cy = o.cy - h;
					continue;
				}

				o.startX = o.startX - w;
				o.startY = o.startY - h;

				if( o.type == 'line' )
				{
					o.endX = o.endX - w;
					o.endY = o.endY - h;
				}
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

		fill : function( o, color ){
			switch(o.type){
				case 'box' : o.fill = color; break;
				case 'text' : case 'path' : case 'ellipse' : o.fillStyle = color; break;
			}
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
			this.forEachObjects( $.proxy(function( o ){

				ImageTransparentPixel = false;

				this.parent.draw.clearCanvas( this.parent.helperCtx );

				if(!target && o.visible && !o.locked)
				{
					if(o.src)
					{
						this.parent.draw.drawObject(o,this.parent.helperCtx);
						x = this.parent.events.mouseX;
						y = this.parent.events.mouseY;
						pixelData = this.parent.helperCtx.getImageData(x,y,1,1).data;
						if(!pixelData[3]) ImageTransparentPixel = true;
						this.parent.draw.clearCanvas( this.parent.helperCtx );
					}

					if(!ImageTransparentPixel)
					{
						//todo line
						c = $.extend(true,{},o);
						if(c.type=='text') c.type = 'box';
						c.src = '';
						this.parent.draw.drawObject( c, this.parent.helperCtx );
						if (this.parent.helperCtx.isPointInPath(point.x,point.y)) target = o;
					}
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

		forEachSelecteds : function( callback, startAtTop ){

			// returns : callback(object, index)

			if(startAtTop)
			{
				var x = this.parent.selecteds.length;
				while(x--) { callback( this.parent.selecteds[x], x); }
			}
			else for(x in this.parent.selecteds) callback( this.parent.selecteds[x], x); 
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

		isTypeSelected : function( type ){
			for(i in this.parent.selecteds) if( this.parent.selecteds[i].type == type ) return true;
			return false;
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

		},

		getAnnularData : function( options ){
			// Options:
			// - centerX, centerY: coordinates for the center of the circle    
			// - startDegrees, endDegrees: fill between these angles, clockwise
			// - innerRadius, outerRadius: distance from the center
			// - thickness: distance between innerRadius and outerRadius
			//   You should only specify two out of three of the radii and thickness
			var opts = this.optionsWithDefaults(options);
			var p = [ // points
				[opts.cx + opts.r2*Math.cos(opts.startRadians),
				 opts.cy + opts.r2*Math.sin(opts.startRadians)],
				[opts.cx + opts.r2*Math.cos(opts.closeRadians),
				 opts.cy + opts.r2*Math.sin(opts.closeRadians)],
				[opts.cx + opts.r1*Math.cos(opts.closeRadians),
				 opts.cy + opts.r1*Math.sin(opts.closeRadians)],
				[opts.cx + opts.r1*Math.cos(opts.startRadians),
				 opts.cy + opts.r1*Math.sin(opts.startRadians)],
			];

			var angleDiff = opts.closeRadians - opts.startRadians,
				largeArc  = (angleDiff % (Math.PI*2)) > Math.PI ? 1 : 0,
				cmds      = [];

			cmds.push("m"+p[0].join());                                // Move to P0
			cmds.push("A"+[opts.r2,opts.r2,0,largeArc,1,p[1]].join()); // Arc to  P1
			cmds.push("L"+p[2].join());                                // Line to P2
			cmds.push("A"+[opts.r1,opts.r1,0,largeArc,0,p[3]].join()); // Arc to  P3
			cmds.push("z");

			var newpath = document.createElementNS("http://www.w3.org/2000/svg","path");
			newpath.setAttributeNS(null,"d", cmds.join(' '));

			var relative = this.convertToRelative( newpath );

			return relative.attributes.d.value;
		},

		optionsWithDefaults : function( o ){
			var o2 = 
			{
				cx           : o.centerX || 0,
				cy           : o.centerY || 0,
				startRadians : (o.startDegrees || 0) * Math.PI/180,
				closeRadians : (o.endDegrees   || 0) * Math.PI/180,
		    };

		    var t = o.thickness!==undefined ? o.thickness : 100;
		    if (o.innerRadius!==undefined)      o2.r1 = o.innerRadius;
		    else if (o.outerRadius!==undefined) o2.r1 = o.outerRadius - t;
		    else                                o2.r1 = 200           - t;
		    if (o.outerRadius!==undefined)      o2.r2 = o.outerRadius;
		    else                                o2.r2 = o2.r1         + t;

		    if (o2.r1<0) o2.r1 = 0;
		    if (o2.r2<0) o2.r2 = 0;

		    return o2;
		},

		convertToRelative : function(path) {

			function set(type) 
			{
			var args = [].slice.call(arguments, 1)
			  , rcmd = 'createSVGPathSeg'+ type +'Rel'
			  , rseg = path[rcmd].apply(path, args);
			segs.replaceItem(rseg, i);
			}

			var dx, dy, x0, y0, x1, y1, x2, y2, segs = path.pathSegList;

			for (var x = 0, y = 0, i = 0, len = segs.numberOfItems; i < len; i++) {
				var seg = segs.getItem(i)
				  , c   = seg.pathSegTypeAsLetter;
				if (/[MLHVCSQTAZz]/.test(c)) {
				  if ('x1' in seg) x1 = seg.x1 - x;
				  if ('x2' in seg) x2 = seg.x2 - x;
				  if ('y1' in seg) y1 = seg.y1 - y;
				  if ('y2' in seg) y2 = seg.y2 - y;
				  if ('x'  in seg) dx = -x + (x = seg.x);
				  if ('y'  in seg) dy = -y + (y = seg.y);
				  switch (c) {
				    case 'M': set('Moveto',dx,dy);                   break;
				    case 'L': set('Lineto',dx,dy);                   break;
				    case 'H': set('LinetoHorizontal',dx);            break;
				    case 'V': set('LinetoVertical',dy);              break;
				    case 'C': set('CurvetoCubic',dx,dy,x1,y1,x2,y2); break;
				    case 'S': set('CurvetoCubicSmooth',dx,dy,x2,y2); break;
				    case 'Q': set('CurvetoQuadratic',dx,dy,x1,y1);   break;
				    case 'T': set('CurvetoQuadraticSmooth',dx,dy);   break;
				    case 'A': set('Arc',dx,dy,seg.r1,seg.r2,seg.angle,
				                  seg.largeArcFlag,seg.sweepFlag);   break;
				    case 'Z': case 'z': x = x0; y = y0; break;
				  }
				}
				else {
				  if ('x' in seg) x += seg.x;
				  if ('y' in seg) y += seg.y;
				}
				// store the start of a subpath
				if (c == 'M' || c == 'm') {
				  x0 = x;
				  y0 = y;
				}
			}
			path.setAttribute('d', path.getAttribute('d').replace(/Z/g, 'z'));
			return path;
		},

		jqEvents : function(){
			/* (c) 2013 by DBJ.ORG, GPL/MIT applies */
			// usage jQuery.events( selector ) - to see registered events
			jQuery.events = function (expr ) {
			  var rez = [], evo ;
			   jQuery(expr).each(
			      function () {
			         if ( evo = jQuery._data( this, "events"))
			           rez.push({ element: this, events: evo }) ;
			     });
			 return rez.length > 0 ? rez : null ;
			}
		}

	}

})