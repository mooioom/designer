
$.extend( true, editor, {

	box : function(){
		return {name : "name"}
	},

	select : function( o )
	{
		this.selectedObjects.push( o );
	},

	unselect : function( t )
	{
		for(i in this.selectedObjects)
		{
			o = this.selectedObjects[i];
			if(o == t) this.selectedObjects.splice(i,1);
		}
	},

	createBox : function(x, y, w, h)
	{
		this.selectedObjects = [];
		newObject 			 = this.createObject('box', x, y, w, h);
		this.tempObject 	 = this.currentObject;
		this.select( newObject );
		this.objects.push( newObject );
		this.currentObject ++;
	},

	deleteCurrent : function(){

		this.saveHistory();

		for(i in this.selectedObjects)
		{
			var id = this.selectedObjects[i].id;
			this.forEachObjects($.proxy(function( obj, i ){
				if(obj.id == id) this.objects.splice(i,1);
			},this));
		}

		this.selectedObjects = [];

		this.render();
		this.drawSubMenu();
		this.drawExternalUi();

	},

	getObject : function( id ){
		var object;
		this.forEachObjects($.proxy(function( obj ){ if(id == obj.id) object = obj; },this));
		return object;
	},

	createObject : function(type, x, y, w, h)
	{
		if(!type) type = this.action;
		if(typeof x === 'undefined') x = this.mouseX;
		if(typeof y === 'undefined') y = this.mouseY;
		if(typeof w === 'undefined') w = 0;
		if(typeof h === 'undefined') h = 0;

		var point = {
			x : this.getClosestSnapCoords( x ),
			y : this.getClosestSnapCoords( y )
		}

		newObject = {
			id     		  : this.currentObject,
			layer  		  : this.currentLayer,
			type          : type,
			startX 		  : point.x,
			startY 		  : point.y,
			endX   		  : point.x,
			endY   		  : point.y,
			width         : w,
			height        : h,
			rotate        : 0,
			shadowColor   : '',
			shadowBlur    : '',
			shadowOffsetX : '',
			shadowOffsetY : '',
			visible       : true,
			locked        : false
		};

		switch(this.action)
		{
			case 'box' :
				newObject.stroke 	  = this.stroke;
				newObject.lineWidth   = this.lineWidth;
				newObject.strokeStyle = this.strokeStyle;
				newObject.fill 	      = this.fill; //$('.sp-preview-inner').css('background-color');
				newObject.fillStyle   = this.fillStyle;
				newObject.radius      = this.radius;
				break;
			case 'text' :
				newObject.lineWidth     = 0;
				newObject.strokeStyle   = this.strokeStyle;
				newObject.fillStyle     = '#000';
				newObject.radius        = this.radius;
				newObject.text 		    = this.defaultText.text;
				newObject.font          = this.defaultText.font;
				newObject.fontSize      = this.defaultText.fontSize;
				newObject.lineHeight    = this.defaultText.lineHeight;
				newObject.isItalic      = this.defaultText.isItalic;
				newObject.isBold        = this.defaultText.isBold;
				newObject.stroke        = this.defaultText.stroke;
				newObject.strokeStyle   = this.defaultText.strokeStyle;
				newObject.fillStyle     = this.defaultText.fillStyle;
				newObject.height        = this.defaultText.fontSize;
				break;
		}
		return newObject;
	},

	copy : function(){
		this.clipboard = jQuery.extend(true, {}, this.selectedObjects);
	},

	paste : function( selectNewItems ){
		this.saveHistory();
		if( selectNewItems ) this.selectedObjects = [];
		for(i in this.clipboard)
		{
			var o = jQuery.extend(true, {}, this.clipboard[i]);
			o.id  = this.currentObject;
			this.objects.push( o );
			this.currentObject ++;
			if( selectNewItems ) this.select( o );
		}
	},

	selectAll : function(){
		this.selectedObjects = [];
		for(o in this.objects) this.select( this.objects[o] );
		this.render();
		this.drawExternalUi();
		this.drawSubMenu();
	},

	editText : function(){

		$('.subMenu.text').show();
		$('.toolbox.box').hide();
		$('.toolbox.text').show();
		$('.toolbox.text #text').val( this.selectedObjects[0].text );

		var text = this.selectedObjects[0];

		var textPositionTop  = ( text.startY - 100 ); if(textPositionTop<0) textPositionTop = 10;
		var textPositionLeft = ( text.startX + text.width  + 40 ); if(textPositionLeft>(this.width - 300)) textPositionLeft = this.width - 300;

		$('.toolbox.text').css('right', 'initial' );
		$('.toolbox.text').css('left',( textPositionLeft ) + 'px' );
		$('.toolbox.text').css('top', ( textPositionTop ) + 'px' );

		$('.submenu.text').show();
		this.updateUi( text );

	},

	changeText     : function( newText )     { if(!this.selectedIsText()) return; this.selectedObjects[0].text     = newText; this.render(); },
	changeFont     : function( newFont )     { if(!this.selectedIsText()) return; this.selectedObjects[0].font     = newFont; this.render(); },
	changeFontSize : function( newFontSize ) { if(!this.selectedIsText()) return; this.selectedObjects[0].fontSize = newFontSize; this.render(); },
	changeBold     : function( isBold )      { if(!this.selectedIsText()) return; this.selectedObjects[0].isBold   = isBold; this.render(); },
	changeItalic   : function( isItalic )    { if(!this.selectedIsText()) return; this.selectedObjects[0].isItalic = isItalic; this.render(); },

	editBox : function()
	{
		var box = this.selectedObjects[0];
		$('.toolbox.text').hide();
		$('.subMenu.box').show();
		this.updateUi( box );

	},

	updateUi : function( o )
	{

		$('.subMenu.'+o.type+' .startX').val(      o.startX 	 );
		$('.subMenu.'+o.type+' .startY').val( 	   o.startY 	 );
		$('.subMenu.'+o.type+' .width').val( 	   o.width 		 );
		$('.subMenu.'+o.type+' .height').val( 	   o.height 	 );
		$('.subMenu.'+o.type+' .lineWidth').val(   o.lineWidth 	 );
		$('.subMenu.'+o.type+' .strokeStyle').val( o.strokeStyle );
		$('.subMenu.'+o.type+' .radius').val( 	   o.radius 	 );
		$('.subMenu.'+o.type+' .fill').val( 	   o.fill 		 );
		$('.subMenu.'+o.type+' .opacity').val();

		$(".subMenu .fill").spectrum("set", 	   o.fill        );
		$(".subMenu .fillStyle").spectrum("set",   o.fillStyle   );
		$(".subMenu .strokeStyle").spectrum("set", o.strokeStyle );

		$('.toolbox.transform .rotate').val( o.rotate );
		
		$('.toolbox.shadow .shadowBlur').val(    o.shadowBlur    );
		$('.toolbox.shadow .shadowOffsetX').val( o.shadowOffsetX );
		$('.toolbox.shadow .shadowOffsetY').val( o.shadowOffsetY );

		$(".toolbox.shadow .shadowColor").spectrum("set", o.shadowColor);

	},

	align : function( to ){

		this.saveHistory();
		
		var v,v1,v2,v3,vc,t = this.selectedObjects[0];

		if(to == 'right')  { v1 = 'endX'   ; v2 = 'startX' ; v3 = 'width';  };
		if(to == 'left')   { v1 = 'startX' ; v2 = 'startX' ; 		 	    };
		if(to == 'top')    { v1 = 'startY' ; v2 = 'startY' ; 		 	    };
		if(to == 'bottom') { v1 = 'endY'   ; v2 = 'startY' ; v3 = 'height'; };
		if(to == 'middleV'){ v1 = 'x'      ; v2 = 'startX' ; v3 = 'width' ; vc = true; };
		if(to == 'middleH'){ v1 = 'y'      ; v2 = 'startY' ; v3 = 'height'; vc = true; };

		if(!vc) v = t[v1];
		else    v = this.getCenter( t )[v1];

		this.forEachObjects($.proxy(function( o ){
			if( o.id == t.id || !this.isObjectSelected(t.id) ) return;
			if     ( v3 && !vc ) o[v2] = v - o[v3];
			else if( v3 && vc  ) o[v2] = v - ( o[v3] / 2 );
			else                 o[v2] = v;
		},this));

		this.render();
	},

	alignRight   : function(){ this.align('right');   },
	alignLeft    : function(){ this.align('left');    },
	alignBottom  : function(){ this.align('bottom');  },
	alignTop     : function(){ this.align('top');     },
	alignMiddleV : function(){ this.align('middleV'); },
	alignMiddleH : function(){ this.align('middleH'); },
	alignCenter  : function(){ this.alignMiddleV(); this.alignMiddleH(); },

	sendTo : function( where ){
		this.saveHistory();
		if(!this.selectedObjects.length) return;
		var t  = this.selectedObjects[0],
			id = t.id;
		for(i in this.objects){
			if( id == this.objects[i].id ){
				this.objects.splice(i,1);
				if( where == 'front' ) this.objects.push( t );
				if( where == 'back'  ) this.objects.unshift( t );
			}
		}
		this.render();
		this.drawExternalUi();
	},

	bringToFront : function(){ this.sendTo( 'front' ); },
	sendToBack   : function(){ this.sendTo( 'back' );  },

	saveHistory : function( keepOld )
	{
		var objects     = jQuery.extend(true, [], this.objects ),
			selecteds   = jQuery.extend(true, [], this.selectedObjects ),
			spliceItems = this.history.objects.length - this.history.index;

		if(!keepOld) {
			this.history.objects.splice( this.history.index, spliceItems );
			this.history.selecteds.splice( this.history.index, spliceItems );
			this.history.last = -1;
		}

		this.history.objects.push( objects );
		this.history.selecteds.push( selecteds );
		this.history.index ++ ;
	},

	undo : function()
	{
		console.log('undo');

		if( this.history.index == 0 ) return;

		var index 	       = this.history.index - 1,
			last 		   = this.history.last,
			item 		   = this.history.objects[ index ], 
			itemSelecteds  = this.history.selecteds[ index ],
			historyLength  = this.history.objects.length - 1,
			historyObjects = this.history.objects,
			o;

		if( index > last )
		{
			this.history.last = index;
			this.saveHistory( true );
		}

		this.selectedObjects    = itemSelecteds;
		if( item ) this.objects = item;

		//todo undo : change prop, add resource, edit text

		this.render();
		this.drawSelectedBox();
		this.drawSelectionBox();
		this.drawExternalUi();
		this.drawSubMenu();

		this.history.index = index;

	},

	redo : function()
	{

		if( this.history.index == this.history.objects.length - 1 || !this.history.objects.length ) return;

		var index 		  = this.history.index + 1,
			item 		  = this.history.objects[ index ],
			itemSelecteds = this.history.selecteds[ index ], 
			o;

		this.selectedObjects = itemSelecteds;
		this.objects         = item;

		//todo undo : change prop, add resource, edit text

		this.render();
		this.drawSelectedBox();
		this.drawSelectionBox();
		this.drawExternalUi();
		this.drawSubMenu();

		this.history.index ++ ;

	},

	move : function( direction )
	{
		for(i in this.selectedObjects)
		{
			var o = this.selectedObjects[i],
				d;

			if( this.ctrlIsPressed ) d = 1;
			else d = this.grid.size;

			switch( direction )
			{
				case 'left'  : o.startX = o.startX - d; break;
				case 'up'    : o.startY = o.startY - d; break;
				case 'right' : o.startX = o.startX + d; break;
				case 'down'  : o.startY = o.startY + d; break;
			}
		}

		//todo save undo

		this.render();

	}
})