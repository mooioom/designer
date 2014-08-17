
$.extend( true, editor, {

	events : {

		pressed        : [],
		keyboardEvents : [],
		clickEvents    : [],

		ctrl  : false,
		alt   : false,
		shift : false,

		mouseX : 0,
		mouseY : 0,

		startMoveX : 0,
		startMoveY : 0,
		movedX     : 0,
		movedY     : 0,

		mouseDown : false,
		drag      : false,

		init : function()
		{

			this.droppable();

			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'left',  args : 'left'  });
			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'up',    args : 'up'    });
			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'right', args : 'right' });
			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'down',  args : 'down'  });

			this.parent.canvas.addEventListener("mousemove",$.proxy(this.mousemove,this),false);
			this.parent.canvas.addEventListener("mousedown",$.proxy(this.mousedown,this),false);
			this.parent.canvas.addEventListener("mouseup",  $.proxy(this.mouseup,this),false);

			$(document).unbind('keydown')
					   .unbind('keyup');

			$(document).bind('keydown', $.proxy(this.keyDown,this) )
					   .bind('keyup',   $.proxy(this.keyUp,this)   );

			$('body').bind('dragenter', $.proxy(this.ignoreDrag,this))
					 .bind('dragover',  $.proxy(this.ignoreDrag,this))
					 .bind('drop',      $.proxy(this.drop,this));

			$(window).resize( $.proxy(this.parent.helpers.positionCanvas,this));

			$('.tools .button').click( $.proxy(this.toolButton,this) );

			for(i in this.clickEvents){
				var clickEvent = this.clickEvents[i];
				$(clickEvent.selector).unbind('click').bind('click', $.proxy( clickEvent.action, clickEvent.scope, clickEvent.args ) );
			}

		},

		ignoreDrag : function( e ){
			e.originalEvent.stopPropagation();
			e.originalEvent.preventDefault();
		},

		drop : function( e ){
			if(!e.originalEvent.dataTransfer) return;
			this.ignoreDrag(e);
			var dt    = e.originalEvent.dataTransfer,
				files = dt.files;
				
			if(!files || !dt.files.length) return;
			var file = dt.files[0];
			if (!file.type.match('image')) return;

			var reader = new FileReader();

			reader.onload = ($.proxy(function(theFile) {
				return $.proxy(function(e) {
					this.parent.resources.push({
						src       : e.target.result,
						name      : theFile.name,
						size      : theFile.size,
						type      : theFile.type
					});
					this.parent.getResources();
				},this);
			},this))(file);
			// Read in the image file as a data URL.
			reader.readAsDataURL(file);
		},

		mousedown : function( e )
		{
			this.parent.helpers.getMousePosition( e );
			this.mouseDown = true;
			this.parent.actions[ this.parent.action ].mouseDown.call(this);
			this.parent.render();
			this.parent.draw.ui();
			this.parent.draw.reOrderByUi();
			this.parent.draw.toolbar();
		},

		mouseup : function( e )
		{
			this.parent.helpers.getMousePosition( e );
			this.parent.actions[ this.parent.action ].mouseUp.call(this);
			this.mouseDown = false;
			this.drag      = false;
			this.parent.render();
			this.parent.draw.ui();
			this.parent.draw.reOrderByUi();
			this.parent.draw.toolbar();
		},

		mousemove : function( e )
		{	
			this.parent.helpers.getMousePosition( e );
			if( this.mouseDown ) this.drag = true; else this.drag = false;
			this.parent.actions[ this.parent.action ].mouseMove.call(this);
			this.parent.render();
		},


		keyDown : function( e )
		{
			if($("input:focus, textarea:focus, select:focus").length) return;
			var p = false;
			
			keyCode = e.keyCode;

			if(!this.addToPressed( keyCode )) return;

			this.setSpecialKeys( keyCode, true );

			for(i in this.keyboardEvents)
			{
				var found 		  = [],
					keyboardEvent = this.keyboardEvents[i],
					keys 		  = keyboardEvent.shortcut.split('+');

				for(i in keys) if( this.isPressed(keys[i]) ) found.push( true );
				if(found.length && found.length == keys.length)
				{
					p = true;
					$.proxy(keyboardEvent.action,keyboardEvent.scope,keyboardEvent.args)();
				}
			}

			if(p) e.preventDefault(); e.stopPropagation();
		},

		keyUp : function( e )
		{
			if($("input:focus, textarea:focus, select:focus").length) return;
			var p = false;
			keyCode = e.keyCode;
			this.setSpecialKeys( keyCode, false );
			this.clearPressed( keyCode );
			if(p) e.preventDefault(); e.stopPropagation();
		},

		addToPressed : function( keyCode )
		{
			var flag = true;
			for(i in this.pressed) if(this.pressed[i] == keyCode) flag = false;
			if(flag) this.pressed.push(keyCode);
			return flag;
		},

		isPressed : function( keyCode )
		{
			keyCode = keyCode.replace(' ','');
			if( String(keyCode).search('shift')       == 0 ) keyCode = 16;
			if( String(keyCode).search('ctrl')        == 0 ) keyCode = 17;
			if( String(keyCode).search('alt')         == 0 ) keyCode = 18;
			if( String(keyCode).search('backspace')   == 0 ) keyCode =  8;
			if( String(keyCode).search('tab')	      == 0 ) keyCode =  9;
			if( String(keyCode).search('enter')	      == 0 ) keyCode = 13;
			if( String(keyCode).search('pause')	      == 0 ) keyCode = 19;
			if( String(keyCode).search('caps lock')   == 0 ) keyCode = 20;
			if( String(keyCode).search('escape')	  == 0 ) keyCode = 27;
			if( String(keyCode).search('page up')     == 0 ) keyCode = 33;
			if( String(keyCode).search('page down')   == 0 ) keyCode = 34;
			if( String(keyCode).search('end')	      == 0 ) keyCode = 35;
			if( String(keyCode).search('home')	      == 0 ) keyCode = 36;
			if( String(keyCode).search('left')        == 0 ) keyCode = 37;
			if( String(keyCode).search('up')	      == 0 ) keyCode = 38;
			if( String(keyCode).search('right')       == 0 ) keyCode = 39;
			if( String(keyCode).search('down')        == 0 ) keyCode = 40;
			if( String(keyCode).search('insert')	  == 0 ) keyCode = 45;
			if( String(keyCode).search('del')	      == 0 ) keyCode = 46;

			for(i in this.pressed) {
				if(typeof keyCode == 'string' && String.fromCharCode(this.pressed[i]).toLowerCase() == keyCode) return true;
				else if(this.pressed[i] == keyCode) return true;
			}
		},

		clearPressed : function( keyCode )
		{
			for(i in this.pressed) if(this.pressed[i] == keyCode) this.pressed.splice(i,1);
		},

		setSpecialKeys : function( keyCode, on ){
			if(keyCode == 16) this.shift = on;
			if(keyCode == 17) this.ctrl  = on;
			if(keyCode == 18) this.alt   = on;
		},

		toolButton : function( e ){
			$('.tools .button').removeClass('active');
			$(e.target).addClass('active');
			this.parent.action = $(e.target).attr('id');
			this.parent.render();
			this.parent.draw.ui();
			this.parent.draw.toolbar();
			this.parent.draw.reOrderByUi();
		},

		droppable : function(){

			$( "#canvas" ).droppable({
				drop: $.proxy(function( event, ui )
				{

					if(!$(event.toElement).hasClass('dropItem')) return;

					var src      = event.toElement.src,
						point    = { x:event.clientX, y:event.clientY },
					    position = this.parent.helpers.getPositionOnCanvas( point );

					img     = new Image();
					img.src = src;
					w       = img.width;
					h       = img.height;

					this.parent.getResources();
					this.parent.history.save();

					this.parent.selecteds = [];

					this.parent.create.box( position.x, position.y, w, h );
					this.parent.selecteds[0].src = src;

					$('.tools .move').click();

					this.parent.render();
					this.parent.draw.ui();
					this.parent.draw.toolbar();

				},this)
		    });

			this.parent.getResources();

		}

	}

});