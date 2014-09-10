
$.extend( true, editor, {

	events : {

		pressed           : [],
		keyboardEvents    : [],
		clickEvents       : [],
		browserDropEvents : [],
		canvasDropEvents  : [],

		ctrl  : false,
		alt   : false,
		shift : false,

		mouseX : 0,
		mouseY : 0,

		prevMoveX : false,
		prevMoveY : false,

		startMoveX : 0,
		startMoveY : 0,
		movedX     : 0,
		movedY     : 0,

		mousePressed : false,
		drag         : false,

		init : function()
		{
			console.log('events init');

			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'left',  args : 'left'  });
			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'up',    args : 'up'    });
			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'right', args : 'right' });
			this.keyboardEvents.push({ action : this.parent.functions.move, scope : this.parent.functions, shortcut : 'down',  args : 'down'  });

			this.parent.canvas.addEventListener("mousemove",$.proxy(this.mouseMove,this),false);
			this.parent.canvas.addEventListener("mousedown",$.proxy(this.mouseDown,this),false);
			this.parent.canvas.addEventListener("mouseup",  $.proxy(this.mouseUp,this),false);

			$(document).unbind('keydown')
					   .unbind('keyup');

			$(document).bind('keydown', $.proxy(this.keyDown,this) )
					   .bind('keyup',   $.proxy(this.keyUp,this)   );

			$('body').bind('dragenter', $.proxy(this.ignoreDrag,this))
					 .bind('dragover',  $.proxy(this.ignoreDrag,this))
					 .bind('drop',      $.proxy(this.browserDrop,this));

			$("#canvas").droppable({drop:$.proxy(this.canvasDrop,this)});

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

		mouseDown : function( e )
		{
			this.parent.helpers.getMousePosition( e );
			this.mousePressed = true;
			this.parent.actions[ this.parent.action ].mouseDown.call(this);
			this.parent.render();
			this.parent.draw.ui();
			//this.parent.draw.reOrderByUi();
			this.parent.draw.toolbar();
			this.parent.onMouseDown();
		},

		mouseUp : function( e )
		{
			this.parent.helpers.getMousePosition( e );
			this.parent.actions[ this.parent.action ].mouseUp.call(this);
			this.mousePressed = false;
			this.drag      = false;
			this.parent.render();
			this.parent.draw.ui();
			//this.parent.draw.reOrderByUi();
			this.parent.draw.toolbar();
			this.parent.onMouseUp();
		},

		mouseMove : function( e )
		{
			this.parent.helpers.getMousePosition( e );

			if( this.prevMoveX == this.mouseX && 
				this.prevMoveY == this.mouseY ) return;

			this.prevMoveX = this.mouseX;
			this.prevMoveY = this.mouseY;

			if( this.mousePressed ) this.drag = true; else this.drag = false;
			this.parent.actions[ this.parent.action ].mouseMove.call(this);
			this.parent.render();
			this.parent.onMouseMove();
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
				if(found.length && found.length == keys.length && !p)
				{
					p = true;
					$.proxy(keyboardEvent.action,keyboardEvent.scope,keyboardEvent.args)();
				}
			}

			if(p) e.preventDefault(); e.stopPropagation();

			this.parent.onKeyDown();
		},

		keyUp : function( e )
		{
			if($("input:focus, textarea:focus, select:focus").length) return;
			var p = false;
			keyCode = e.keyCode;
			this.setSpecialKeys( keyCode, false );
			this.clearPressed( keyCode );
			if(p) e.preventDefault(); e.stopPropagation();
			this.parent.onKeyUp();
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
			//this.parent.draw.reOrderByUi();
		},

		browserDrop : function( e ){         for(i in this.browserDropEvents) this.browserDropEvents[i]( e ); },
		canvasDrop  : function( event, ui ){ for(i in this.canvasDropEvents)  this.canvasDropEvents[i]( event, ui ); }

	}

});