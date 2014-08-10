
$.extend( true, editor, {

	create : {

		box : function(x, y, w, h)
		{
			this.parent.selecteds = [];
			newObject 			  = this.create.object('box', x, y, w, h);
			this.temp 	  		  = this.parent.current;
			this.parent.select( newObject );
			this.parent.objects.push( newObject );
			this.parent.current ++;
		},

		object : function(type, x, y, w, h)
		{
			if(!type) type = this.parent.action;
			if(typeof x === 'undefined') x = this.parent.events.mouseX;
			if(typeof y === 'undefined') y = this.parent.events.mouseY;
			if(typeof w === 'undefined') w = 0;
			if(typeof h === 'undefined') h = 0;

			var point = {
				x : this.parent.helpers.getClosestSnapCoords( x ),
				y : this.parent.helpers.getClosestSnapCoords( y )
			}

			newObject = {
				id     		  : this.parent.current,
				layer  		  : 0,
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

			switch(this.parent.action)
			{
				case 'box' :
					newObject.stroke 	  = this.parent.defaults.box.stroke;
					newObject.lineWidth   = this.parent.defaults.box.lineWidth;
					newObject.strokeStyle = this.parent.defaults.box.strokeStyle;
					newObject.fill 	      = this.parent.defaults.box.fill;
					newObject.fillStyle   = this.parent.defaults.box.fillStyle;
					newObject.radius      = this.parent.defaults.box.radius;
					break;
				case 'text' :
					newObject.lineWidth     = this.parent.defaults.text.lineWidth;;
					newObject.strokeStyle   = this.parent.defaults.text.strokeStyle;
					newObject.fillStyle     = this.parent.defaults.text.color;
					newObject.radius        = this.parent.defaults.text.radius;
					newObject.text 		    = this.parent.defaults.text.text;
					newObject.font          = this.parent.defaults.text.font;
					newObject.fontSize      = this.parent.defaults.text.fontSize;
					newObject.lineHeight    = this.parent.defaults.text.lineHeight;
					newObject.isItalic      = this.parent.defaults.text.isItalic;
					newObject.isBold        = this.parent.defaults.text.isBold;
					newObject.stroke        = this.parent.defaults.text.stroke;
					newObject.strokeStyle   = this.parent.defaults.text.strokeStyle;
					newObject.fillStyle     = this.parent.defaults.text.fillStyle;
					newObject.height        = this.parent.defaults.text.fontSize;
					break;
			}
			return newObject;
		}

	},

	select : function( o )
	{
		this.selecteds.push( o );
	},

	selectAll : function(){
		this.selecteds = [];
		for(o in this.objects) this.select( this.objects[o] );
		this.render();
		this.drawExternalUi();
		this.drawtoolbar();
	},

	unselect : function( t )
	{
		for(i in this.selecteds)
		{
			o = this.selecteds[i];
			if(o == t) this.selecteds.splice(i,1);
		}
	},

	deleteCurrent : function(){

		this.history.save();

		for(i in this.selecteds)
		{
			var id = this.selecteds[i].id;
			this.helpers.forEachObjects($.proxy(function( obj, i ){
				if(obj.id == id) this.objects.splice(i,1);
			},this));
		}

		this.selecteds = [];

		this.render();
		this.draw.toolbar();
		this.draw.ui();

	},

	getObject : function( id ){
		var object;
		this.helpers.forEachObjects($.proxy(function( obj ){ if(id == obj.id) object = obj; },this));
		return object;
	},

	deleteObject : function( id )
	{
		this.helpers.forEachObjects( $.proxy(function(object, i){
			if(id == object.id) this.objects.splice(i,1);
		},this))
	},

	copy : function(){
		this.clipboard = jQuery.extend(true, {}, this.selecteds);
	},

	paste : function( selectNewItems ){
		this.history.save();
		if( selectNewItems ) this.selecteds = [];
		for(i in this.clipboard)
		{
			var o = jQuery.extend(true, {}, this.clipboard[i]);
			o.id  = this.current;
			this.objects.push( o );
			this.current ++;
			if( selectNewItems ) this.select( o );
		}
	},

	editText : function(){

		$('.toolbar.text').show();
		$('.toolbox.box').hide();
		$('.toolbox.text').show();
		$('.toolbox.text #text').val( this.selecteds[0].text );

		var text = this.selecteds[0];

		var textPositionTop  = ( text.startY - 100 ); if(textPositionTop<0) textPositionTop = 10;
		var textPositionLeft = ( text.startX + text.width  + 40 ); if(textPositionLeft>(this.width - 300)) textPositionLeft = this.width - 300;

		$('.toolbox.text').css('right', 'initial' );
		$('.toolbox.text').css('left',( textPositionLeft ) + 'px' );
		$('.toolbox.text').css('top', ( textPositionTop ) + 'px' );

		$('.toolbar.text').show();
		this.updateUi( text );

	},

	changeText     : function( newText )     { if(!this.helpers.selectedIsText()) return; this.selecteds[0].text     = newText; this.render(); },
	changeFont     : function( newFont )     { if(!this.helpers.selectedIsText()) return; this.selecteds[0].font     = newFont; this.render(); },
	changeFontSize : function( newFontSize ) { if(!this.helpers.selectedIsText()) return; this.selecteds[0].fontSize = newFontSize; this.render(); },
	changeBold     : function( isBold )      { if(!this.helpers.selectedIsText()) return; this.selecteds[0].isBold   = isBold; this.render(); },
	changeItalic   : function( isItalic )    { if(!this.helpers.selectedIsText()) return; this.selecteds[0].isItalic = isItalic; this.render(); },

	editBox : function()
	{
		var box = this.selecteds[0];
		$('.toolbox.text').hide();
		$('.toolbar.box').show();
		this.updateUi( box );
	},

	updateUi : function( o )
	{

		$('.toolbar.'+o.type+' .startX').val(      o.startX 	 );
		$('.toolbar.'+o.type+' .startY').val( 	   o.startY 	 );
		$('.toolbar.'+o.type+' .width').val( 	   o.width 		 );
		$('.toolbar.'+o.type+' .height').val( 	   o.height 	 );
		$('.toolbar.'+o.type+' .lineWidth').val(   o.lineWidth 	 );
		$('.toolbar.'+o.type+' .strokeStyle').val( o.strokeStyle );
		$('.toolbar.'+o.type+' .radius').val( 	   o.radius 	 );
		$('.toolbar.'+o.type+' .fill').val( 	   o.fill 		 );
		$('.toolbar.'+o.type+' .opacity').val();

		$(".toolbar .fill").spectrum("set", 	   o.fill        );
		$(".toolbar .fillStyle").spectrum("set",   o.fillStyle   );
		$(".toolbar .strokeStyle").spectrum("set", o.strokeStyle );

		$('.toolbox.transform .rotate').val( o.rotate );
		$('.toolbox.shadow .shadowBlur').val(    o.shadowBlur    );
		$('.toolbox.shadow .shadowOffsetX').val( o.shadowOffsetX );
		$('.toolbox.shadow .shadowOffsetY').val( o.shadowOffsetY );
		$(".toolbox.shadow .shadowColor").spectrum("set", o.shadowColor);

	},

	align : function( to ){

		this.history.save();
		
		var v,v1,v2,v3,vc,t = this.selecteds[0];

		if(to == 'right')  { v1 = 'endX'   ; v2 = 'startX' ; v3 = 'width';  };
		if(to == 'left')   { v1 = 'startX' ; v2 = 'startX' ; 		 	    };
		if(to == 'top')    { v1 = 'startY' ; v2 = 'startY' ; 		 	    };
		if(to == 'bottom') { v1 = 'endY'   ; v2 = 'startY' ; v3 = 'height'; };
		if(to == 'middleV'){ v1 = 'x'      ; v2 = 'startX' ; v3 = 'width' ; vc = true; };
		if(to == 'middleH'){ v1 = 'y'      ; v2 = 'startY' ; v3 = 'height'; vc = true; };

		if(!vc) v = t[v1];
		else    v = this.getCenter( t )[v1];

		this.parent.helpers.forEachObjects($.proxy(function( o ){
			if( o.id == t.id || !this.helpers.isObjectSelected(t.id) ) return;
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
		this.history.save();
		if(!this.selecteds.length) return;
		var t  = this.selecteds[0],
			id = t.id;
		for(i in this.objects){
			if( id == this.objects[i].id ){
				this.objects.splice(i,1);
				if( where == 'front' ) this.objects.push( t );
				if( where == 'back'  ) this.objects.unshift( t );
			}
		}
		this.render();
		this.draw.ui();
	},

	bringToFront : function(){ this.sendTo( 'front' ); },
	sendToBack   : function(){ this.sendTo( 'back' );  },

	move : function( direction )
	{
		for(i in this.selecteds)
		{
			var o = this.selecteds[i],
				d;

			if( this.events.ctrlIsPressed ) d = 1;
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