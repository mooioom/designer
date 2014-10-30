
$.extend( true, designer, {

	functions : {

		select : function( o )
		{
			this.parent.selecteds.push( o );
			this.parent.onSelect();
		},

		selectAll : function(){
			this.parent.selecteds = [];
			for(o in this.parent.objects) this.select( this.parent.objects[o] );
			this.parent.render();
			this.parent.draw.ui();
			this.parent.draw.toolbar();
		},

		unselect : function( t )
		{
			for(i in this.parent.selecteds)
			{
				o = this.parent.selecteds[i];
				if(o == t) this.parent.selecteds.splice(i,1);
			}
		},

		delete : function(){

			this.parent.history.save();

			for(i in this.parent.selecteds)
			{
				var id = this.parent.selecteds[i].id;
				this.parent.helpers.forEachObjects($.proxy(function( obj, i ){
					if(obj.id == id) this.parent.objects.splice(i,1);
				},this));
			}

			this.parent.selecteds = [];

			this.parent.render();
			this.parent.draw.toolbar();
			this.parent.draw.ui();

		},

		getObject : function( id ){
			var object;
			this.parent.helpers.forEachObjects($.proxy(function( obj ){ if(id == obj.id) object = obj; },this));
			return object;
		},

		deleteObject : function( id )
		{
			this.parent.helpers.forEachObjects( $.proxy(function(object, i){
				if(id == object.id) this.parent.objects.splice(i,1);
			},this))
		},

		copy : function(){
			this.parent.clipboard = jQuery.extend(true, {}, this.parent.selecteds);
		},

		paste : function(){
			this.parent.history.save();
			this.parent.selecteds = [];
			for(i in this.parent.clipboard)
			{
				var o = jQuery.extend(true, {}, this.parent.clipboard[i]);
				o.id  = this.parent.current;
				this.parent.objects.push( o );
				this.parent.current ++;
				this.select( o );
			}
			this.parent.render();
			this.parent.draw.toolbar();
			this.parent.draw.ui();
		},

		escapeKey : function(){
			if(this.parent.events.createPathMode){
				this.parent.actions.path.removeLastSeg();
				this.parent.events.createPathMode = false;
			}
		},

		edit : function( what ){

			$('.toolbox.text').hide();
			$('.toolbar').hide();
			$('.toolbar.'+what).show();

			if(what == 'text')
			{
				$('.toolbox.text').show();
				$('.toolbox.text #text').val( this.parent.selecteds[0].text );
			}

			var o = this.parent.selecteds[0];

			this.parent.ui.toolboxs.update( o );
			this.parent.ui.toolbars.update( o );

		},

		transform : function(){

			if(this.parent.events.transformMode) {
				$('.toolbox.transform').hide();
				this.parent.events.transformMode = false;
			}
			else {
				if(!this.parent.selecteds.length) return;
				this.parent.events.transformMode = true;
				$('.toolbox.transform').show();
			}

			this.parent.render();

		},

		rotate : function( amount ){

			for(i in this.parent.selecteds)
			{
				o = this.parent.selecteds[i];
				if( !o || o.locked || !o.visible || !o.rotationData ) continue;

				o.rotate = Number(Number(o.rotationData.rotate) + Number(this.parent.rotateAmount));

				c = {
					x : o.rotationData.center.x,
					y : o.rotationData.center.y
				}

				p = this.parent.helpers.getRotatedPoint( this.parent.rotateStartCenter.x, this.parent.rotateStartCenter.y, c.x, c.y, o.rotate - Number(o.rotationData.rotate));
				
				this.parent.helpers.setByCenter( o , p );

				this.parent.render();

				this.parent.draw.quickPoint(this.parent.rotateStartCenter.x, this.parent.rotateStartCenter.y, 'blue');	

			}

		},

		exitEditMode : function(){

			this.parent.editMode = false;
			$('.toolbar .edit').removeClass('active');

		},

		changeText : function( newText ) { if(!this.parent.helpers.selectedIs('text')) return; this.parent.selecteds[0].text = newText; this.parent.render(); },

		align : function( to ){

			this.parent.history.save();
			
			var v,v1,v2,v3,vc,t = this.parent.selecteds[0];

			if(to == 'right')  { v1 = 'endX'   ; v2 = 'startX' ; v3 = 'width';  };
			if(to == 'left')   { v1 = 'startX' ; v2 = 'startX' ; 		 	    };
			if(to == 'top')    { v1 = 'startY' ; v2 = 'startY' ; 		 	    };
			if(to == 'bottom') { v1 = 'endY'   ; v2 = 'startY' ; v3 = 'height'; };
			if(to == 'middleV'){ v1 = 'x'      ; v2 = 'startX' ; v3 = 'width' ; vc = true; };
			if(to == 'middleH'){ v1 = 'y'      ; v2 = 'startY' ; v3 = 'height'; vc = true; };

			if(!vc) v = t[v1];
			else    v = this.parent.helpers.getCenter( t )[v1];

			for(i in this.parent.selecteds)
			{
				o = this.parent.selecteds[i];
				if( o.id == t.id ) continue;
				if     ( v3 && !vc ) o[v2] = v - o[v3];
				else if( v3 && vc  ) o[v2] = v - ( o[v3] / 2 );
				else                 o[v2] = v;
			}
			this.parent.render();
		},

		alignRight   : function(){ this.align('right');   },
		alignLeft    : function(){ this.align('left');    },
		alignBottom  : function(){ this.align('bottom');  },
		alignTop     : function(){ this.align('top');     },
		alignMiddleV : function(){ this.align('middleV'); },
		alignMiddleH : function(){ this.align('middleH'); },
		alignCenter  : function(){ this.alignMiddleV(); this.alignMiddleH(); },

		sendTo : function( where ){
			this.parent.history.save();
			if(!this.parent.selecteds.length) return;
			var t  = this.parent.selecteds[0],
				id = t.id;
			for(i in this.parent.objects){
				if( id == this.parent.objects[i].id ){
					this.parent.objects.splice(i,1);
					if( where == 'front' ) this.parent.objects.push( t );
					if( where == 'back'  ) this.parent.objects.unshift( t );
				}
			}
			this.parent.render();
			this.parent.draw.ui();
		},

		bringToFront : function(){ this.sendTo( 'front' ); },
		sendToBack   : function(){ this.sendTo( 'back' );  },

		move : function( direction )
		{
			for(i in this.parent.selecteds)
			{
				var o = this.parent.selecteds[i],
					d,
					moveEndPoints  = (o.type == 'line'),
					moveFromCenter = (o.type == 'ellipse');

				if( this.parent.events.ctrl ) d = 1;
				else d = this.parent.grid.size;

				if(moveFromCenter)
				{
					switch( direction )
					{
						case 'left'  : o.cx = o.cx - d; break;
						case 'up'    : o.cy = o.cy - d; break;
						case 'right' : o.cx = o.cx + d; break;
						case 'down'  : o.cy = o.cy + d; break;
					}
				}else
				{
					switch( direction )
					{
						case 'left'  : o.startX = o.startX - d; if(moveEndPoints) o.endX = o.endX - d; break;
						case 'up'    : o.startY = o.startY - d; if(moveEndPoints) o.endY = o.endY - d; break;
						case 'right' : o.startX = o.startX + d; if(moveEndPoints) o.endX = o.endX + d; break;
						case 'down'  : o.startY = o.startY + d; if(moveEndPoints) o.endY = o.endY + d; break;
					}
				}

				
			}

			//todo save undo

			this.parent.render();

		}

	},

	create : {

		box : function(x, y, w, h)
		{
			this.parent.selecteds = [];
			newObject 			  = this.object('box', x, y, w, h);
			this.temp 	  		  = this.parent.current;
			this.parent.functions.select( newObject );
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
					newObject.lineWidth     = this.parent.defaults.text.lineWidth;
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
				case 'line' :
					newObject.stroke 	  = this.parent.defaults.box.stroke;
					newObject.lineWidth   = this.parent.defaults.box.lineWidth;
					newObject.strokeStyle = this.parent.defaults.box.strokeStyle;
					newObject.fill 	      = this.parent.defaults.box.fill;
					newObject.fillStyle   = this.parent.defaults.box.fillStyle;
					break;
				case 'ellipse' :
					newObject.stroke 	  = this.parent.defaults.box.lineWidth;
					newObject.lineWidth   = this.parent.defaults.box.lineWidth;
					newObject.strokeStyle = this.parent.defaults.box.strokeStyle;
					newObject.fill 	      = this.parent.defaults.box.fill;
					newObject.fillStyle   = this.parent.defaults.box.fillStyle;
					newObject.rx          = 0;
					newObject.ry          = 0;
					newObject.cx          = point.x;
					newObject.cy          = point.y;
					newObject.startX      = null;
					newObject.startX      = null;
					break;
				case 'path' :
					newObject.stroke 	  = this.parent.defaults.box.lineWidth;
					newObject.lineWidth   = this.parent.defaults.box.lineWidth;
					newObject.strokeStyle = this.parent.defaults.box.strokeStyle;
					newObject.fill 	      = this.parent.defaults.box.fill;
					newObject.fillStyle   = this.parent.defaults.box.fillStyle;
					newObject.startX      = point.x;
					newObject.startY      = point.y;
					newObject.path        = 'm '+point.x+' '+point.y;
					if(this.parent.selectedShape != null){
						newObject.path    = this.parent.shapes[ this.parent.selectedShape ].data;
					}
					newObject.getPathSegs = function(){
						var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
						$(p).attr('d',this.path);
						return p.pathSegList;
					}
					newObject.getPath     = function(){
						var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
						$(p).attr('d',this.path);
						return p;
					}
					break;
			}
			return newObject;
		}

	},

})