
$.extend( true, designer, {

	functions : {

		select : function( o, singleItem )
		{
			if(typeof o.groupId != 'undefined' && !singleItem) {this.selectGroup( o.groupId );return;}
			else this.parent.selecteds.push( o );
			this.parent.onSelect();
		},

		selectGroup : function( groupId ){
			for(i in this.parent.objects)
			{
				o = this.parent.objects[i];
				if(typeof o.groupId != 'undefined' && o.groupId == groupId && !this.parent.helpers.isObjectSelected(o.id) ) this.parent.selecteds.push( o );
			}
		},

		selectAll : function(){
			this.parent.selecteds = [];
			for(o in this.parent.objects) this.select( this.parent.objects[o] );
			this.parent.render();
			this.parent.draw.ui();
			this.parent.draw.toolbar();
		},

		group   : function(){

			groupId = this.parent.groups.length;

			this.parent.groups.push({
				id        : groupId,
				name      : getString('group') + ' ' + groupId,
				collapsed : true,
				visible   : true,
				locked    : false
				//parentGroup : 
			});

			for(i in this.parent.selecteds) this.parent.selecteds[i].groupId = groupId;

			this.reorder();
			this.parent.redraw();

		},

		ungroup : function(){

			if(!this.parent.groups.length) return;
			for(i in this.parent.selecteds) {
				o = this.parent.selecteds[i]
				if(typeof o.groupId != 'undefined'){
					this.deleteGroup( o.groupId );
					delete o.groupId;
				}
			}
			this.parent.redraw();
		},

		deleteGroup : function( groupId ){
			for(i in this.parent.groups){
				group = this.parent.groups[i];
				if(group.id == groupId) idx = i;
			}
			if(idx) this.parent.groups.splice(idx,1);
		},

		reorder : function(){

			// remove empty groups
			emptyGroups = [];
			for(i in this.parent.groups)
			{
				flag = false;
				g = this.parent.groups[i];
				for(x in this.parent.objects)
				{
					o = this.parent.objects[x];
					if(o.groupId == g.id) flag = true;	
				}
				if(flag == false) emptyGroups.push( g.id );
			}
			for(i in emptyGroups) this.deleteGroup( emptyGroups[i] );

			order = [];

			for(i in this.parent.objects)
			{
				o = this.parent.objects[i];
				for(x in order) if(order[x]==o.id) continue;
				//console.log(Number(i)+1);
				if(typeof o.groupId != 'undefined'){
					// is group inside group?
					for(x in this.parent.objects)
					{
						gg = this.parent.objects[x];
						if(typeof gg.groupId != 'undefined' && gg.groupId == o.groupId) order.push(gg.id);
					}
				}else{
					// is in the middle of group?
					order.push(o.id);
				}
			}

			//selectedsClone = $.extend(true,{},this.parent.selecteds);

			this.parent.selecteds = [];

			for(i in order){
				o = $.extend(true,{},this.getObject( order[i] ) );
				this.deleteObject( order[i] );
				this.parent.objects.push( o );
				/*for(x in selectedsClone) 
					if(selectedsClone[x].id == o.id) 
						this.parent.selecteds.push( o );*/
			}
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

		getGroup : function( groupId ){
			for(i in this.parent.groups) if(this.parent.groups[i].id==groupId) return this.parent.groups[i];
		},

		getGroupObjects : function( groupId ){
			var objects = [];
			for(i in this.parent.objects)
			{
				var o = this.parent.objects[i];
				if(typeof o.groupId != 'undefined' && o.groupId == groupId) objects.push(o);
			}
			return objects;
		},

		getGroupTopObject : function( groupId ){
			var flag = false;
			for(i in this.parent.objects)
			{
				//console.log(o);
				var o = this.parent.objects[i];
				if(typeof o.groupId != 'undefined' && o.groupId == groupId) flag = Number(i);
			}
			if(flag != false) return this.parent.objects[flag];
			return false;
		},

		isGroupSelected : function( groupId ){
			var flag         = false,
				groupObjects = this.getGroupObjects( groupId );
			if(!groupObjects) return false;
			for(i in groupObjects) if( !this.parent.helpers.isObjectSelected( groupObjects[i].id ) ) flag = true;
			if(flag) return false;
			else return true;
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

		enterKey : function(){
			if(this.parent.events.createPathMode){
				this.parent.actions.path.removeLastSeg();
				this.parent.events.createPathMode = false;
			}
			if(this.parent.events.cropMode && this.parent.events.cropReview){
				
				this.crop({
					x1 : this.parent.actions.crop.x1,
					y1 : this.parent.actions.crop.y1,
					x2 : this.parent.actions.crop.x2,
					y2 : this.parent.actions.crop.y2,
				});
				
			}
		},

		crop : function( dimensions ){
		
			w = dimensions.x2 - dimensions.x1;
			h = dimensions.y2 - dimensions.y1;

			$('#canvas, #gridCanvas, #helperCanvas').attr( 'width',  w );
			$('#canvas, #gridCanvas, #helperCanvas').attr( 'height', h );

			this.parent.helpers.positionCanvas( w, h );
			this.parent.helpers.subtractFromPosition( dimensions.x1, dimensions.y1 );

			this.parent.events.cropMode   = false;
			this.parent.events.cropReview = false;
			this.parent.actions.x1 = 0;
			this.parent.actions.y1 = 0;
			this.parent.actions.x2 = 0;
			this.parent.actions.y2 = 0;

			this.parent.draw.grid();
			this.parent.redraw();
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

				c = { x : o.rotationData.center.x, y : o.rotationData.center.y }
				p = this.parent.helpers.getRotatedPoint( this.parent.rotateStartCenter.x, this.parent.rotateStartCenter.y, c.x, c.y, o.rotate - Number(o.rotationData.rotate));
				
				this.parent.helpers.setByCenter( o , p );

				this.parent.render();
				this.parent.draw.quickPoint(this.parent.rotateStartCenter.x, this.parent.rotateStartCenter.y, 'blue');	

			}

		},

		scale : function( amount ){

			for(i in this.parent.selecteds)
			{
				o = this.parent.selecteds[i];
				if( !o || o.locked || !o.visible || !o.scaleData ) continue;

				this.parent.helpers.scale( o, amount + 100, this.parent.scaleStartCenter );
				this.parent.render();
				this.parent.draw.quickPoint(this.parent.scaleStartCenter.x, this.parent.scaleStartCenter.y, 'blue');

			}
		},

		flattenImage : function(){

			if(!this.parent.objects.length) return;

			popup = new Popup({
				header    : getString('AreYouSure'),
				content   : 'Flatten Image?',
				closeText : getString('Cancel'),
				action    : $.proxy(function(){
					this.parent.history.save();
					this.parent.draw.resetHelperCanvas();
					//todo optimize canvas size to fit objects
					this.parent.draw.objects( this.parent.helperCtx );
					src = this.parent.helperCanvas.toDataURL("image/png");
					this.parent.selecteds = [];
					for(o in this.parent.objects) this.select( this.parent.objects[o] );
					this.delete();
					this.parent.create.box(0,0,this.parent.width,this.parent.height);
					this.parent.objects[0].src = src;
					this.parent.redraw();
					popup.close();
				},this)
			})
		},

		flattenSelecteds : function(){

			//todo optimize canvas size to fit selected objects
			this.parent.history.save();
			this.parent.draw.resetHelperCanvas();

			this.parent.helpers.forEachSelecteds($.proxy(function( object ) { 
				this.parent.draw.drawObject( object, this.parent.helperCtx );
				this.deleteObject( object.id );	
			},this));

			src = this.parent.helperCanvas.toDataURL("image/png");
			this.parent.create.box(0,0,this.parent.width,this.parent.height);
			this.parent.objects[ this.parent.objects.length-1 ].src = src;
			this.parent.redraw();

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

			this.parent.redraw();

		}

	},

	create : {

		box : function(x, y, w, h, params)
		{
			this.parent.selecteds = [];
			o 			          = this.object('box', x, y, w, h, params);
			this.temp 	  		  = this.parent.current;
			this.parent.functions.select( o );
			this.parent.objects.push( o );
			this.parent.current ++;
		},

		text : function(x,y,params){
			this.parent.selecteds = [];
			o 			          = this.object('text', x, y, 0, 0, params);
			this.temp 	  		  = this.parent.current;
			this.parent.functions.select( o );
			this.parent.objects.push( o );
			this.parent.current ++;
		},

		object : function(type, x, y, w, h, params)
		{

			if(!params) params = {};
			if(!type)   type = this.parent.action;

			if(typeof x === 'undefined') x = this.parent.events.mouseX;
			if(typeof y === 'undefined') y = this.parent.events.mouseY;
			if(typeof w === 'undefined') w = 0;
			if(typeof h === 'undefined') h = 0;

			var point = {
				x : params.dontSnap ? x : this.parent.helpers.getClosestSnapCoords( x ),
				y : params.dontSnap ? y : this.parent.helpers.getClosestSnapCoords( y )
			}

			o = {
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

			switch(type)
			{
				case 'box' :
					o.stroke 	  = params.stroke    || this.parent.defaults.box.stroke;
					o.lineWidth   = params.lineWidth || this.parent.defaults.box.lineWidth;
					o.strokeStyle = params.color1    || this.parent.color1;
					o.fill 	      = params.color2    || this.parent.color2;
					o.fillStyle   = params.fillStyle || this.parent.defaults.box.fillStyle;
					o.radius      = params.radius    || this.parent.defaults.box.radius;
					break;
				case 'text' :
					o.lineWidth     = params.lineWidth  || this.parent.defaults.text.lineWidth;
					o.fillStyle     = params.color1     || this.parent.color1;
					o.strokeStyle   = params.color2     || this.parent.color2;
					o.radius        = params.radius     || this.parent.defaults.text.radius;
					o.text 		    = params.text 	    || this.parent.defaults.text.text;
					o.font          = params.font 	    || this.parent.defaults.text.font;
					o.fontSize      = params.fontSize   || this.parent.defaults.text.fontSize;
					o.lineHeight    = params.lineHeight || this.parent.defaults.text.lineHeight;
					o.isItalic      = params.isItalic   || this.parent.defaults.text.isItalic;
					o.isBold        = params.isBold     || this.parent.defaults.text.isBold;
					o.stroke        = params.stroke     || this.parent.defaults.text.stroke;
					o.height        = params.fontSize   || this.parent.defaults.text.fontSize;
					break;
				case 'line' :
					o.stroke 	  = params.stroke    || this.parent.defaults.box.stroke;
					o.lineWidth   = params.lineWidth || this.parent.defaults.box.lineWidth;
					o.strokeStyle = params.color1    || this.parent.color1;
					break;
				case 'ellipse' :
					o.stroke 	  = params.lineWidth || this.parent.defaults.box.lineWidth;
					o.lineWidth   = params.lineWidth || this.parent.defaults.box.lineWidth;
					o.strokeStyle = params.color1    || this.parent.color1;
					o.fill 	      = params.fill      || this.parent.defaults.box.fill;
					o.fillStyle   = params.color2    || this.parent.color2;
					o.rx          = 0;
					o.ry          = 0;
					o.cx          = point.x;
					o.cy          = point.y;
					o.startX      = null;
					o.startX      = null;
					break;
				case 'path' :
					o.stroke 	  = params.lineWidth || this.parent.defaults.box.lineWidth;
					o.lineWidth   = params.lineWidth || this.parent.defaults.box.lineWidth;
					o.strokeStyle = params.color1    || this.parent.color1;
					o.fill 	      = params.fill      || this.parent.defaults.box.fill;
					o.fillStyle   = params.color2    || this.parent.color2;
					o.startX      = point.x;
					o.startY      = point.y;
					o.path        = 'm '+point.x+' '+point.y;
					if(this.parent.selectedShape != null){
						o.path    = this.parent.shapes[ this.parent.selectedShape ].data;
					}
					o.getPathSegs = function(){
						var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
						$(p).attr('d',this.path);
						return p.pathSegList;
					}
					o.getPath     = function(){
						var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
						$(p).attr('d',this.path);
						return p;
					}
					break;
			}
			return o;
		}

	},

})