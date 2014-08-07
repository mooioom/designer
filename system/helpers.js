
$.extend( true, editor, {

	clickSelect : function()
	{
		if(!this.ctrlIsPressed) this.selectedObjects = [];
		o = this.getObjectInPoint( { x : this.mouseX, y : this.mouseY } );
		if(o) 
		{
			if( o.locked   ) return;
			if( !o.visible ) return;
			selectedsIndex = this.isObjectSelected( o.id );
			if(selectedsIndex) this.selectedObjects.splice(selectedsIndex,1);
			else this.select(o);
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

	clearCanvas : function()
	{
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	getCenter : function( o ){
		return {
			x : o.startX + (o.width/2),
			y : o.startY + (o.height/2)
		}
	},

	isCursorOnResize : function(){
		var flag = false;
		for(i in this.selectedObjects){
			var o = this.selectedObjects[i];
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
		for(i in this.objects) if(this.objects[i].id > id) id = this.objects[i].id;
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
		if( this.selectedObjects.length != 1 ) return false;
		if( this.selectedObjects[0].type == 'text' ) return true;
		else return false;
	},

	selectedIsBox : function()
	{
		if( this.selectedObjects.length != 1 ) return false;
		if( this.selectedObjects[0].type == 'box' ) return true;
		else return false;
	},

	deleteObject : function( id )
	{
		this.forEachObjects( $.proxy(function(object, i){
			if(id == object.id) this.objects.splice(i,1);
		},this))
	},

	getMousePosition : function( e )
	{
		this.mouseX = e.offsetX;
		this.mouseY = e.offsetY;
	},

	getPositionOnCanvas : function( globalPoint )
	{
		return { x: globalPoint.x, y: globalPoint.y - $('#canvas').offset().top };
	},

	getObjectInPoint : function( point )
	{
		var target = null;
		this.forEachObjects( $.proxy(function( object ){

			if(!target)
			{
				var x  = object.startX, y = object.startY, w = object.width, h = object.height,
					cx = w/2, cy = h/2, r = object.rotate;

				this.ctx.save();
				this.ctx.translate( x + cx, y + cy );
				x = 0 - cx; y = 0 - cy;
				this.ctx.rotate(r*Math.PI/180);
				this.ctx.beginPath();
				this.ctx.rect(x,y,w,h);
				if (this.ctx.isPointInPath(point.x,point.y)) target = object;
				this.ctx.closePath();
				this.ctx.restore();
			}

		},this), true );
		return target;
	},

	forEachObjects : function( callback, startAtTop ){

		// returns : callback(object, index)

		if(startAtTop)
		{
			var x = this.objects.length;
			while(x--) { callback( this.objects[x], x); }
		}
		else for(x in this.objects) callback( this.objects[x], x); 
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
		for(i in this.selectedObjects) if( this.selectedObjects[i].id == objectId ) flag = i;
		return flag;
	},

	getClosestSnapCoords : function( point ){
		if(this.grid.snap && !this.ctrlIsPressed) {
			if(point % this.grid.size > Math.round(this.grid.size / 2) ) 
				 { while(point++) if(point % this.grid.size == 0) return point; }
			else if( point % this.grid.size == 0 )                return point;
			else { while(point--) if(point % this.grid.size == 0) return point; }
			
		}
		else return point;
	},

	updateSelectedObjProp : function( prop, val, isString){
		if(!this.selectedObjects.length) return;
		var o = this.getObject( this.selectedObjects[0].id );
		if(!o) return;
		if(!isString) val = Number(val);
		if(this.resizeLinked){
			if(prop=='width' || prop=='height'){
				oldW = o.width;
				oldH = o.height;
				if(prop =='width')  {d = val-oldW; o.height = o.height + d}
				if(prop =='height') {d = val-oldH; o.width  = o.width + d}
			}
		}
		o[prop] = val;
		this.drawSubMenu();
	},

	drawSubMenu : function(){

		$('.subMenu').hide();

		if(this.selectedObjects.length && this.action != 'move')
		{
			var flag = false;

			if(this.selectedIsText()) { this.editText(); flag = true; }
			if(this.selectedIsBox())  { this.editBox();  flag = true; }

			if(this.selectedObjects.length     && 
			   this.selectedObjects.length > 1 && 
			   this.action == 'select'         &&
			   !flag) { $('.subMenu.selectMultiple').show(); flag = true; }

			if(!flag) $('.subMenu.'+this.action).show();
		}
		else
		{
			$('.subMenu.'+this.action).show();	
		}

	},

	toggleObjectsOptions : function(){

		if(this.selectedObjects && this.selectedObjects.length) {
			$('.toolbox.objects .toolboxMenu .shadow').removeClass('disabled');
			$('.toolbox.objects .toolboxMenu .transform').removeClass('disabled');
			$('.toolbox.objects .toolboxMenu .delete').removeClass('disabled');
		}
		else {
			$('.toolbox.objects .toolboxMenu .shadow').addClass('disabled');
			$('.toolbox.objects .toolboxMenu .transform').addClass('disabled');
			$('.toolbox.objects .toolboxMenu .delete').addClass('disabled');
		}

	},

	drawExternalUi : function(){

		$('.toolbox.objects .body .objectsItem').remove();

		this.toggleObjectsOptions();
		
		for(i in this.objects)
		{
			var object = this.objects[i],
				title  = "";
			var objectsItem = $('#ceTemplates .objectsItem').clone();
			objectsItem.attr('objectid',object.id);

			title = object.type;
			if(object.src) title = 'image';
			title += ' ' + object.id;
			if(object.type == 'text') title += ' - '+object.text;
			title = title.capitalize();
			objectsItem.find('.objectName').html( title );

			if(this.isObjectSelected(object.id))
				objectsItem.addClass('selected');

			object.visible ? '' : objectsItem.find('.objectVisible').addClass('invisible') ;
			object.locked  ? objectsItem.find('.objectLock').removeClass('unlocked') : '' ;

			$('.toolbox.objects .body').prepend( objectsItem );
		}

		$('.sortable').multisortable({
			items         : ".objectsItem",
			selectedClass : "selected",
			stop          : $.proxy(function(){ 
				this.reOrderByUi();
				this.toggleObjectsOptions();
			},this),
			click         : $.proxy(function(){
				debugger;
				this.reOrderByUi(); 
				this.toggleObjectsOptions();
			},this)
		});

	},

	reOrderByUi : function( renderAllThumbs ){

		var order       = [],
			selecteds   = [],
			tempObjects = [];

		this.selectedObjects = [];

		$($('.toolbox.objects .body .objectsItem').get().reverse()).each(function(){
			objectId = Number($(this).attr('objectid'));
			order.push(objectId);
			if( $(this).hasClass('selected') ) selecteds.push( objectId )
		});

		for(i in order)     tempObjects.push( this.getObject( order[i] ) );
		for(s in selecteds) this.select( this.getObject( selecteds[s] ) );

		this.objects = tempObjects;

		//this.renderThumbnails( renderAllThumbs );

		this.render();
		this.drawSubMenu();

	}
})