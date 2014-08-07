
$.extend( true, editor, {
	
	render : function()
	{
		var focusedInputs = $("input:focus");
		var inputHasFocus = false;
		if (focusedInputs != null && focusedInputs.length > 0) { inputHasFocus = true; }

		this.drawDebugger();
		this.clearCanvas();
		this.draw();
		this.drawSelectedBox();
		this.drawSelectionBox();
		//this.drawPoint();
		//this.drawTransformClone();
		if( this.action == 'transform' ) this.drawActionPoints();

		//if (!inputHasFocus) this.drawSubMenu();

	},

	drawDebugger : function()
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
		for(i in this.selectedObjects) selectedObjects += this.selectedObjects[i].id + ', ';
		selectedObjects = selectedObjects.substring(0, selectedObjects.length - 2);
		$('#selected').html(selectedObjects);

		$('#movedX').html( this.movedX );
		$('#movedY').html( this.movedY );

	},

	drawGrid : function()
	{
		this.gridCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if(this.grid.visible)
		{

			var gridSteps = this.canvas.width / this.grid.size,
				size 	  = this.grid.size;

			this.gridCtx.beginPath();

			for(var i = 0; i <= gridSteps; i++ )
			{
				
				this.gridCtx.moveTo( i * size, 0 );
				this.gridCtx.lineTo( i * size, this.canvas.height );
				this.gridCtx.moveTo( 0, i * size );
				this.gridCtx.lineTo( this.canvas.width, i * size );
			}

			this.gridCtx.lineWidth   = this.grid.lineWidth;
			this.gridCtx.strokeStyle = this.grid.strokeStyle;
			this.gridCtx.stroke();
		}	
	},

	draw : function()
	{
		this.forEachObjects($.proxy(function( object )
		{
			this.drawObject( object );	
		},this));
	},

	drawObject : function( object, ctx ){

		if(object.visible == false) return;

		if(!ctx) ctx = this.ctx;

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

	drawSelectedBox : function(){
		for(i in this.selectedObjects)
		{
			if(this.selectedObjects[i].id == this.tempObject) return;
			if(this.selectedObjects[i].type != 'text') return;
			var o  = this.selectedObjects[i],
				x  = o.startX - this.defaultText.selectFeather,
				y  = o.endY + this.defaultText.selectFeather,
				w  = o.width + (this.defaultText.selectFeather * 2),
				h  = 0.1,
				cx = o.width / 2,
				cy = o.height / 2,
				r  = o.rotate;
			this.ctx.save();
			this.ctx.translate( x + cx, y + cy );
			x = 0 - cx; y = 0 - cy;
			this.ctx.rotate(r*Math.PI/180);
			this.ctx.beginPath();
			this.ctx.rect( x, y, w, h );
			this.ctx.lineWidth   = this.selectedBox.lineWidth;
			this.ctx.strokeStyle = this.selectedBox.strokeStyle;
			this.ctx.stroke();
			this.ctx.restore();
		}
	},

	drawSelectionBox : function(){
		if(this.selectionBox.endX != null)
		{
			this.ctx.beginPath();
			var x1 = this.selectionBox.startX,
				y1 = this.selectionBox.startY,
				x2 = this.selectionBox.endX,
				y2 = this.selectionBox.endY;
			this.ctx.rect( x1, y1, (x2 - x1), (y2 - y1) );
			this.ctx.lineWidth   = this.selectionBox.lineWidth;
			this.ctx.strokeStyle = this.selectionBox.strokeStyle;
			this.ctx.stroke();	
		}
	},

	drawActionPoints : function(){
		for(i in this.selectedObjects)
		{
			object       = this.getObject( this.selectedObjects[i].id );
			actionPoints = this.getActionPoints( object );
			for(i in actionPoints){
				this.ctx.beginPath();
				this.ctx.arc(actionPoints[i].x, actionPoints[i].y, this.actionPointSize, 0, 2 * Math.PI, false);
				this.ctx.fillStyle = 'deepskyblue';
				this.ctx.fill();
				this.ctx.lineWidth = 1;
				this.ctx.strokeStyle = '#003300';
				this.ctx.stroke();
			}
		}
	},

	drawPoint : function(x,y){
		if(this.debugPoint){
			x = this.debugPoint.x;
			y = this.debugPoint.y;
			this.ctx.beginPath();
			this.ctx.fillStyle="orange";
			this.ctx.arc(x, y, this.actionPointSize, 0, 2 * Math.PI, false);
			this.ctx.fill();
		}
	},

	drawTransformClone : function(){
		tc = this.transformClone;
		this.ctx.beginPath();
		this.ctx.rect( tc.startX, tc.startY, tc.width, tc.height );
		this.ctx.lineWidth   = 1;
		this.ctx.strokeStyle = 'green';
		this.ctx.stroke();
	}
})