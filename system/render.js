
$.extend( true, editor, {

	render : function()
	{
		var focusedInputs = $("input:focus");
		var inputHasFocus = false;
		if (focusedInputs != null && focusedInputs.length > 0) { inputHasFocus = true; }

		this.draw.Debugger();
		this.draw.clearCanvas();
		this.draw.objects();
		this.draw.selectedBox();
		this.draw.selectionBox();

		if( this.action == 'transform' ) this.draw.actionPoints();

	},

	redraw : function(){
		this.render(); 
		this.draw.ui();
		this.draw.toolbar();
		this.draw.reOrderByUi( true );
		this.ui.toolbar.init();
		this.ui.toolbox.init();
	},

	draw : {

		clearCanvas : function()
		{
			this.parent.ctx.clearRect(0, 0, this.parent.canvas.width, this.parent.canvas.height);
		},

		Debugger : function()
		{
			if(!this.debug) return;
			$('#x').html( this.mouseX );
			$('#y').html( this.mouseY );

			$('#mouseDown').html( this.mouseDown );

			$('#drag').html( this.drag );

			$('#objects').empty();
			this.forEachObjects(function( obj ){
				$('#objects').append( obj.id + ' : ('+obj.startX+','+obj.startY+' - '+obj.endX+','+obj.endY+') <br/>');
			});

			$('#action').html(this.action);

			var selectedObjects = '';
			for(i in this.parent.selecteds) selectedObjects += this.parent.selecteds[i].id + ', ';
			selectedObjects = selectedObjects.substring(0, selectedObjects.length - 2);
			$('#selected').html(selectedObjects);

			$('#movedX').html( this.movedX );
			$('#movedY').html( this.movedY );

		},

		grid : function()
		{
			this.parent.gridCtx.clearRect(0, 0, this.parent.canvas.width, this.parent.canvas.height);

			if(this.parent.grid.visible)
			{

				var gridSteps = this.parent.canvas.width / this.parent.grid.size,
					size 	  = this.parent.grid.size;

				this.parent.gridCtx.beginPath();

				for(var i = 0; i <= gridSteps; i++ )
				{
					
					this.parent.gridCtx.moveTo( i * size, 0 );
					this.parent.gridCtx.lineTo( i * size, this.parent.canvas.height );
					this.parent.gridCtx.moveTo( 0, i * size );
					this.parent.gridCtx.lineTo( this.parent.canvas.width, i * size );
				}

				this.parent.gridCtx.lineWidth   = this.parent.grid.lineWidth;
				this.parent.gridCtx.strokeStyle = this.parent.grid.strokeStyle;
				this.parent.gridCtx.stroke();
			}	
		},

		objects : function()
		{
			this.parent.helpers.forEachObjects($.proxy(function( object )
			{
				this.drawObject( object );	
			},this));
		},

		drawObject : function( object, ctx ){

			if(object.visible == false) return;

			if(!ctx) ctx = this.parent.ctx;

			if( object.type == 'box' )
			{
				var x 			  = object.startX,
					y 			  = object.startY,
					width 		  = object.width,
					height 		  = object.height,
					radius    	  = object.radius,
					lineWidth     = object.lineWidth,
					strokeStyle   = object.strokeStyle,
					fill          = object.fill,
					rotate        = object.rotate;
					shadowBlur    = object.shadowBlur;
					shadowOffsetX = object.shadowOffsetX;
					shadowOffsetY = object.shadowOffsetY;
					shadowColor   = object.shadowColor;

				object.endX = x + width;
				object.endY = y + height;

				ctx.shadowBlur    = shadowBlur;
				ctx.shadowOffsetX = shadowOffsetX;
				ctx.shadowOffsetY = shadowOffsetY;
				ctx.shadowColor   = shadowColor;

				ctx.save();
				ctx.translate( x+(width/2),y+(height/2) );
				x = 0 - (width/2);
				y = 0 - (height/2);
				ctx.rotate(rotate*Math.PI/180);

				if( object.src ) 
				{
					image     = new Image();
					image.src = object.src;
					ctx.drawImage(image, x, y, width, height);
				}
				else this.rect( ctx, x, y, width, height, radius, rotate, lineWidth, strokeStyle, fill, true );

				ctx.restore();

			}
			if( object.type == 'text' )
			{
				var isItalic = '', 
					isBold   = '';

				if(object.isBold)   isBold   = 'bold';
				if(object.isItalic) isItalic = 'italic';

				ctx.lineWidth     = object.lineWidth;
				ctx.strokeStyle   = object.strokeStyle;
				ctx.fillStyle     = object.fillStyle;
				ctx.font          = isItalic + ' ' + isBold + ' ' + object.fontSize + 'px ' + object.font;
				ctx.shadowColor   = object.shadowColor;
				ctx.shadowBlur    = object.shadowBlur;
				ctx.shadowOffsetX = object.shadowOffsetX;
				ctx.shadowOffsetY = object.shadowOffsetY;
				ctx.textBaseline  = "top";

				var x 	   = object.startX,
					y 	   = object.startY,
					width  = ctx.measureText(object.text).width,
					height = Number(object.fontSize),
					rotate = object.rotate;

				ctx.save();
				ctx.translate( x+(width/2),y+(height/2) );
				x = 0 - (width/2);
				y = 0 - (height/2);
				ctx.rotate(rotate*Math.PI/180);

				if(!object.lineWidth) ctx.fillText(object.text, x, y);
				else
				{
					if(object.fillStyle) ctx.fillText(object.text, x, y);
					ctx.strokeText(object.text, x, y);
				}

				object.width  = ctx.measureText(object.text).width;
				object.height = Number(object.fontSize);
				object.endX   = object.startX + object.width;
				object.endY   = object.startY + Number(object.fontSize);

				ctx.restore();

				ctx.shadowColor   = 0;
				ctx.shadowBlur    = 0;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;

			}
		},

		rect : function( ctx, x, y, width, height, radius, rotate, lineWidth, strokeStyle, fill, stroke ) {

			if (typeof stroke == "undefined" ) stroke = true;
			if (typeof radius === "undefined") radius = 5;
			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + width - radius, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			ctx.lineTo(x + width, y + height - radius);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			ctx.lineTo(x + radius, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = strokeStyle;
			if (stroke && lineWidth) ctx.stroke();
			if (fill) { ctx.fillStyle = fill; ctx.fill(); }

		},

		selectedBox : function(){
			for(i in this.parent.selecteds)
			{
				if(this.parent.selecteds[i].id == this.tempObject) return;
				if(this.parent.selecteds[i].type != 'text') return;
				var o  = this.parent.selecteds[i],
					x  = o.startX - this.parent.defaults.text.feather,
					y  = o.endY   + this.parent.defaults.text.feather,
					w  = o.width  + this.parent.defaults.text.feather * 2,
					h  = 0.1,
					cx = o.width / 2,
					cy = o.height / 2,
					r  = o.rotate;
				this.parent.ctx.save();
				this.parent.ctx.translate( x + cx, y + cy );
				x = 0 - cx; y = 0 - cy;
				this.parent.ctx.rotate(r*Math.PI/180);
				this.parent.ctx.beginPath();
				this.parent.ctx.rect( x, y, w, h );
				this.parent.ctx.lineWidth   = this.selectedBox.lineWidth;
				this.parent.ctx.strokeStyle = this.selectedBox.strokeStyle;
				this.parent.ctx.stroke();
				this.parent.ctx.restore();
			}
		},

		selectionBox : function(){
			if(this.parent.selectionBox.endX != null)
			{
				this.parent.ctx.beginPath();
				var x1 = this.parent.selectionBox.startX,
					y1 = this.parent.selectionBox.startY,
					x2 = this.parent.selectionBox.endX,
					y2 = this.parent.selectionBox.endY;
				this.parent.ctx.rect( x1, y1, (x2 - x1), (y2 - y1) );
				this.parent.ctx.lineWidth   = this.parent.selectionBox.lineWidth;
				this.parent.ctx.strokeStyle = this.parent.selectionBox.strokeStyle;
				this.parent.ctx.stroke();	
			}
		},

		actionPoints : function(){
			for(i in this.parent.selecteds)
			{
				object       = this.getObject( this.parent.selecteds[i].id );
				actionPoints = this.getActionPoints( object );
				for(i in actionPoints){
					this.parent.ctx.beginPath();
					this.parent.ctx.arc(actionPoints[i].x, actionPoints[i].y, this.actionPointSize, 0, 2 * Math.PI, false);
					this.parent.ctx.fillStyle = 'deepskyblue';
					this.parent.ctx.fill();
					this.parent.ctx.lineWidth = 1;
					this.parent.ctx.strokeStyle = '#003300';
					this.parent.ctx.stroke();
				}
			}
		},

		point : function(x,y){
			if(this.debugPoint){
				x = this.debugPoint.x;
				y = this.debugPoint.y;
				this.parent.ctx.beginPath();
				this.parent.ctx.fillStyle="orange";
				this.parent.ctx.arc(x, y, this.actionPointSize, 0, 2 * Math.PI, false);
				this.parent.ctx.fill();
			}
		},

		transformClone : function(){
			tc = this.transformClone;
			this.parent.ctx.beginPath();
			this.parent.ctx.rect( tc.startX, tc.startY, tc.width, tc.height );
			this.parent.ctx.lineWidth   = 1;
			this.parent.ctx.strokeStyle = 'green';
			this.parent.ctx.stroke();
		},

		ui : function(){

			this.parent.getToolbox('objects').redraw();
			this.parent.getToolbox('resources').redraw();

		},

		reOrderByUi : function( renderAllThumbs ){

			var order       = [],
				selecteds   = [],
				tempObjects = [];

			this.parent.selecteds = [];

			$($('.toolbox.objects .body .objectsItem').get().reverse()).each(function(){
				objectId = Number($(this).attr('objectid'));
				order.push(objectId);
				if( $(this).hasClass('selected') ) selecteds.push( objectId )
			});

			for(i in order)     tempObjects.push( this.parent.functions.getObject( order[i] ) );
			for(s in selecteds) this.parent.functions.select( this.parent.functions.getObject( selecteds[s] ) );

			this.parent.objects = tempObjects;
			this.parent.render();
			this.toolbar();

		},


		toolbar : function(){

			$('.toolbar').hide();

			if(this.parent.selecteds.length && this.parent.action != 'move')
			{
				var flag = false;

				if(this.parent.helpers.selectedIsText()) { this.parent.functions.editText(); flag = true; }
				if(this.parent.helpers.selectedIsBox())  { this.parent.functions.editBox();  flag = true; }

				if(this.parent.selecteds.length     && 
				   this.parent.selecteds.length > 1 && 
				   this.parent.action == 'select'   &&
				   !flag) { $('.toolbar.selectMultiple').show(); flag = true; }

				if(!flag) $('.toolbar.'+this.parent.action).show();
			}
			else $('.toolbar.'+this.parent.action).show();	

		},

	}	
	
})