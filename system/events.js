
$.extend( true, editor, {

	events : {

		pressedKeys    : [],
		keyboardEvents : [],

		ctrlIsPressed  : false,
		altIsPressed   : false,
		shiftIsPressed : false,

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

			this.keyboardEvents.push({ action : editor.move, shortcut : 'left',  args : ['left'] });
			this.keyboardEvents.push({ action : editor.move, shortcut : 'up',    args : ['up'] });
			this.keyboardEvents.push({ action : editor.move, shortcut : 'right', args : ['right'] });
			this.keyboardEvents.push({ action : editor.move, shortcut : 'down',  args : ['down'] });

			this.parent.canvas.addEventListener("mousemove",$.proxy(this.mousemove,this),false);
			this.parent.canvas.addEventListener("mousedown",$.proxy(this.mousedown,this),false);
			this.parent.canvas.addEventListener("mouseup",  $.proxy(this.mouseup,this),false);

			$(document).unbind('keydown')
					   .unbind('keyup');

			$(document).keydown( $.proxy(this.keyDown,this) )
					   .keyup(   $.proxy(this.keyUp,this)   );

			$('body').bind('dragenter', $.proxy(this.ignoreDrag,this))
					 .bind('dragover',  $.proxy(this.ignoreDrag,this))
					 .bind('drop',      $.proxy(this.drop,this));

			$(window).resize( $.proxy(this.positionCanvas,this));

			$('.tools .button').click( $.proxy(this.toolButton,this) );

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

		keyDown : function( e )
		{
			if($("input:focus, textarea:focus").length) return;
			var p = false;
			console.log( e );
			// if( e.keyCode == 46 ) {
			// 	p = true;
			// 	this.delete(); // delete
			// 	this.render();
			// }
			// if( e.ctrlKey  )    {p = true; this.ctrlIsPressed   = true;}
			// if( e.altKey   )    {p = true; this.altIsPressed    = true;}
			// if( e.shiftKey )    {p = true; this.shiftIsPressed  = true;}
			// if(e.keyCode == 37) {p = true; this.move('left');}      		      // left
			// if(e.keyCode == 38) {p = true; this.move('up');}      			      // up
			// if(e.keyCode == 39) {p = true; this.move('right');}      		      // right
			// if(e.keyCode == 40) {p = true; this.move('down');}     			      // down
			// if(this.ctrlIsPressed)
			// {
				// if(e.keyCode == 90) {p = true; this.undo();}      			 	  // ctrl + z 
				// if(e.keyCode == 89) {p = true; this.redo();}      			 	  // ctrl + y 
				// if(e.keyCode == 67) {p = true; this.copy();}      			 	  // ctrl + c 
				// if(e.keyCode == 86) {p = true; this.paste();}     			 	  // ctrl + v
				// if(e.keyCode == 65) {p = true; this.selectAll();} 			 	  // ctrl + a
				// if(e.keyCode == 66) {p = true; this.sendToBack();} 			 	  // ctrl + b
				// if(e.keyCode == 70) {p = true; this.bringToFront();} 			  // ctrl + f
				// if(e.keyCode == 71) {p = true; $('.toolbox.grid').toggle();} 	  // ctrl + g
				// if(e.keyCode == 79) {p = true; $('.toolbox.objects').toggle();}   // ctrl + o
				// if(e.keyCode == 82) {p = true; $('.toolbox.resources').toggle();} // ctrl + r
			//}
			if(p) e.preventDefault(); e.stopPropagation();
		},

		keyUp : function( e )
		{
			if($("input:focus, textarea:focus").length) return;
			var p = false;
			if(this.ctrlIsPressed) {p = true; this.ctrlIsPressed  = false;}
			if(this.altIsPressed)  {p = true; this.altIsPressed   = false;}
			if(this.shiftIsPressed){p = true; this.shiftIsPressed = false;}
			if(p) e.preventDefault(); e.stopPropagation();
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

		addToPressed : function( keyCode )
		{

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