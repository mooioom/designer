
$.extend( true, designer, {

	render : function()
	{

		//this.helpers.timer('start','render');

		var focusedInputs = $("input:focus");
		var inputHasFocus = false;
		if (focusedInputs != null && focusedInputs.length > 0) { inputHasFocus = true; }

		this.draw.clearCanvas();
		this.draw.objects();
		this.draw.selectedBox();
		this.draw.selectionBox();
		if(this.events.editMode) this.draw.actionPoints();

		if( this.action == 'transform' ) this.draw.actionPoints();

		//this.helpers.timer('stop','render');

	},

	redraw : function(){
		this.render(); 
		this.draw.ui();
		this.draw.toolbar();
		this.ui.toolbar.init();
		this.ui.toolbox.init();
	},

	draw : {

		clearCanvas : function( ctx )
		{
			if(!ctx) ctx = this.parent.ctx;
			ctx.clearRect(0, 0, this.parent.canvas.width, this.parent.canvas.height);
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

			this.current = object;

			if(object.visible == false) return;

			if(!ctx) ctx = this.parent.ctx;

			ctx.globalAlpha = 1;

			o = object;

			if( o.type == 'box' )
			{
				var x 			  = o.startX,
					y 			  = o.startY,
					width 		  = o.width,
					height 		  = o.height,
					radius    	  = o.radius,
					lineWidth     = o.lineWidth,
					strokeStyle   = o.strokeStyle,
					fill          = o.fill,
					rotate        = o.rotate,
					shadowBlur    = o.shadowBlur,
					shadowOffsetX = o.shadowOffsetX,
					shadowOffsetY = o.shadowOffsetY,
					shadowColor   = o.shadowColor,
					opacity       = o.opacity;

				o.endX = x + width;
				o.endY = y + height;

				if(opacity) ctx.globalAlpha = opacity;

				ctx.shadowBlur    = shadowBlur;
				ctx.shadowOffsetX = shadowOffsetX;
				ctx.shadowOffsetY = shadowOffsetY;
				ctx.shadowColor   = shadowColor;

				ctx.save();
				ctx.translate( x+(width/2),y+(height/2) );
				ctx.rotate(rotate*Math.PI/180);
				ctx.translate( -(x+(width/2)),-(y+(height/2)) );

				if( o.src ) 
				{
					image     = new Image();
					image.src = o.src;
					ctx.drawImage(image, x, y, width, height);
				}
				else this.rect( ctx, x, y, width, height, radius, lineWidth, strokeStyle, fill, true, opacity );

				ctx.restore();

			}
			if( o.type == 'text' )
			{
				var isItalic = '', 
					isBold   = '';

				if(o.isBold)   isBold   = 'bold';
				if(o.isItalic) isItalic = 'italic';

				if(o.opacity) ctx.globalAlpha = o.opacity;

				ctx.lineWidth     = o.lineWidth;
				ctx.strokeStyle   = o.strokeStyle;
				ctx.fillStyle     = o.fillStyle;
				ctx.font          = isItalic + ' ' + isBold + ' ' + o.fontSize + 'px ' + o.font;
				ctx.shadowColor   = o.shadowColor;
				ctx.shadowBlur    = o.shadowBlur;
				ctx.shadowOffsetX = o.shadowOffsetX;
				ctx.shadowOffsetY = o.shadowOffsetY;

				ctx.textBaseline  = "top";

				var x 	   = o.startX,
					y 	   = o.startY,
					width  = ctx.measureText(o.text).width,
					height = Number(o.fontSize),
					rotate = o.rotate;

				ctx.save();
				// if(o.matrix) 
				// {
				// 	m = o.matrix.split(',');
				// 	ctx.transform(m[0],m[1],m[2],m[3],m[4],m[5]); // todo: compute width / height with matrix
				// }
				ctx.translate( x+(width/2),y+(height/2) );
				ctx.rotate(rotate*Math.PI/180);
				ctx.translate( -(x+(width/2)),-(y+(height/2)) );

				if(!o.lineWidth) ctx.fillText(o.text, x, y);
				else
				{
					if(o.fillStyle) ctx.fillText(o.text, x, y);
					ctx.strokeText(o.text, x, y);
				}

				o.width  = ctx.measureText(o.text).width;
				o.height = Number(o.fontSize);
				o.endX   = o.startX + o.width;
				o.endY   = o.startY + Number(o.fontSize);

				ctx.restore();

				ctx.shadowColor   = 0;
				ctx.shadowBlur    = 0;
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;

			}
			if( o.type == 'path' )
			{
				// translated from svg
				var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				$(path).attr('d',o.path);
				if(!o.startX)
				{
					init = true;
					pathInfo       = this.parent.helpers.getSvgPathInfo( path );
					o.startX       = path.pathSegList[0].x;
					o.startY       = path.pathSegList[0].y;
					o.topLeftX     = pathInfo.x;
					o.topLeftY     = pathInfo.y;
					o.bottomRightX = pathInfo.x + pathInfo.w;
					o.bottomRightY = pathInfo.y + pathInfo.h;
					o.width        = pathInfo.w;
					o.height       = pathInfo.h;
				}

				x = o.startX;
				y = o.startY;
				w = o.width;
				h = o.height;

				pathInfo = this.parent.helpers.getSvgPathInfo( path );
				o.topLeftX     = pathInfo.x;
				o.topLeftY     = pathInfo.y;
				o.bottomRightX = pathInfo.x + pathInfo.w;
				o.bottomRightY = pathInfo.y + pathInfo.h;
				o.width        = pathInfo.w;
				o.height       = pathInfo.h;

				if(o.opacity) ctx.globalAlpha = o.opacity;

				ctx.save();
				ctx.translate( o.topLeftX+(w/2),o.topLeftY+(h/2) );
				ctx.rotate(o.rotate*Math.PI/180);
				ctx.translate( -(o.topLeftX+(w/2)),-(o.topLeftY+(h/2)) );

				path.pathSegList.getItem(0).x = x;
				path.pathSegList.getItem(0).y = y;

				o.path = path.getAttribute('d');

				ctx.beginPath();
				ctx.lineWidth   = o.lineWidth;
				ctx.strokeStyle = o.strokeStyle;
				ctx.fillStyle   = o.fillStyle;
				
				this.path(ctx,path);

				if (o.fillStyle) { ctx.fillStyle = fill; ctx.fill(); }
				if (o.strokeStyle && o.lineWidth) ctx.stroke();

				ctx.restore();
			}
			if( o.type == 'ellipse' )
			{
				o = o;

				o.startX = o.cx - o.rx/2;
				o.endX   = o.cx + o.rx/2;
				o.startY = o.cy - o.ry/2;
				o.endY   = o.cy + o.ry/2;
				o.width  = o.endX - o.startX;
				o.height = o.endY - o.startY;

				ctx.save();
				ctx.translate( o.cx,o.cy );
				ctx.rotate(o.rotate*Math.PI/180);
				ctx.translate( -o.cx,-o.cy );

				this.drawEllipseByCenter(ctx, o.cx, o.cy, o.rx, o.ry, o.lineWidth, o.strokeStyle, o.fillStyle, o.stroke);	

				ctx.restore();
			}
			if( o.type == 'circle' )
			{
				o = o;
				o.cx = o.startX + o.r;
				o.cy = o.startY + o.r;
				ctx.beginPath();
				ctx.arc(o.cx, o.cy, o.r, 0, 2 * Math.PI, false);
				ctx.fillStyle = o.fill;
				ctx.fill();
				ctx.lineWidth   = o.lineWidth;
				ctx.strokeStyle = o.strokeStyle;
				if (o.fillStyle) { ctx.fillStyle = fill; ctx.fill(); }
				if (o.strokeStyle && o.lineWidth) ctx.stroke();
			}
			if( o.type == 'line' )
			{
				o = o;
				ctx.beginPath();
				ctx.moveTo(o.startX, o.startY);
				ctx.lineTo(o.endX, o.endY);
				ctx.lineWidth   = o.lineWidth;
				ctx.strokeStyle = o.strokeStyle;
				if (o.strokeStyle && o.lineWidth) ctx.stroke();
			}
		},

		rect : function( ctx, x, y, w, h, radius, lineWidth, strokeStyle, fill, stroke, opacity ) {

			if (typeof stroke == "undefined" ) stroke = true;
			if (typeof radius === "undefined") radius = 5;
			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + w - radius, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
			ctx.lineTo(x + w, y + h - radius);
			ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
			ctx.lineTo(x + radius, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
			ctx.globalAlpha = opacity;
			ctx.lineWidth = Number(lineWidth);
			ctx.strokeStyle = strokeStyle;
			if (stroke && lineWidth) ctx.stroke();
			if (fill) { ctx.fillStyle = fill; ctx.fill(); }

		},

		ellipse : function(ctx, x, y, w, h, lineWidth, strokeStyle, fill, stroke) {
			var kappa = .5522848,
				ox = (w / 2) * kappa, // control point offset horizontal
				oy = (h / 2) * kappa, // control point offset vertical
				xe = x + w,           // x-end
				ye = y + h,           // y-end
				xm = x + w / 2,       // x-middle
				ym = y + h / 2;       // y-middle

			ctx.beginPath();
			ctx.moveTo(x, ym);
			ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
			ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
			ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
			ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
			ctx.lineWidth = Number(lineWidth);
			ctx.strokeStyle = strokeStyle;
			ctx.closePath(); // not used correctly, see comments (use to close off open path)
			if (stroke && lineWidth) ctx.stroke();
			if (fill) { ctx.fillStyle = fill; ctx.fill(); }

		},

		drawEllipseByCenter : function(ctx, cx, cy, w, h, lineWidth, strokeStyle, fill, stroke) {
			this.ellipse(ctx, cx - w/2.0, cy - h/2.0, w, h, lineWidth, strokeStyle, fill, stroke);
		},

		arc : function(ctx, x1, y1, x2, y2, radius, clockwise) {
			var cBx = (x1 + x2) / 2;    //get point between xy1 and xy2
			var cBy = (y1 + y2) / 2;
			var aB = Math.atan2(y1 - y2, x1 - x2);  //get angle to bulge point in radians
			if (clockwise) { aB += (90 * (Math.PI / 180)); }
			else { aB -= (90 * (Math.PI / 180)); }
			var op_side = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) / 2;
			var adj_side = Math.sqrt(Math.pow(radius, 2) - Math.pow(op_side, 2));
			if (isNaN(adj_side))  adj_side = Math.sqrt(Math.pow(op_side, 2) - Math.pow(radius, 2));
			var Cx = cBx + (adj_side * Math.cos(aB));            
			var Cy = cBy + (adj_side * Math.sin(aB));
			var startA = Math.atan2(y1 - Cy, x1 - Cx);       //get start/end angles in radians
			var endA = Math.atan2(y2 - Cy, x2 - Cx);
			var mid = (startA + endA) / 2;
			var Mx = Cx + (radius * Math.cos(mid));
			var My = Cy + (radius * Math.sin(mid));
			ctx.arc(Cx, Cy, radius, startA, endA, clockwise);
		},

		path : function(ctx,path){

			cx = 0;
			cy = 0;

			for(i in path.pathSegList)
			{
				seg = path.pathSegList[i];

				nx = cx;
				ny = cy;

				if(seg.x) cx = cx + seg.x;
				if(seg.y) cy = cy + seg.y;

				switch(seg.pathSegTypeAsLetter)
				{
					case 'm' :
						ctx.moveTo(cx, cy);
						break;
					case 'l' :
						ctx.lineTo(cx, cy);
						break;
					case 'a' :
						x = nx + seg.x;
						y = ny + seg.y;
						this.arc(ctx,nx,ny,x,y,seg.r2);
						break;
					case 'c' :
						cx1 = nx + seg.x1;
						cx2 = nx + seg.x2;
						cy1 = ny + seg.y1;
						cy2 = ny + seg.y2;
						ctx.bezierCurveTo(cx1,cy1,cx2,cy2,cx,cy);
						break;
					case 'q' :
						cx1 = nx + seg.x1;
						cy1 = ny + seg.y1;
						ctx.quadraticCurveTo(cx1,cy1,cx,cy);
						break;
					case 'Z' :
						ctx.closePath();
						break;
					case 'z' :
						ctx.closePath();
						break;
				}
				
			}

		},

		selectedBox : function(){
			for(i in this.parent.selecteds)
			{
				if(this.parent.selecteds[i].id == this.tempObject) return;
				if(this.parent.selecteds[i].type != 'text') return;
				var o  = this.parent.selecteds[i],
					x  = o.startX,
					y  = o.endY,
					w  = o.width,
					h  = o.height,
					cx = o.width / 2,
					cy = o.height / 2,
					r  = o.rotate;
				this.parent.ctx.save();
				this.parent.ctx.translate( x + cx, y - cy );
				this.parent.ctx.rotate(r*Math.PI/180);
				this.parent.ctx.translate( -(x + cx), -(y + cy) );
				this.parent.ctx.beginPath();
				this.parent.ctx.rect( x, y, w, h );
				this.parent.ctx.lineWidth   = 2;
				this.parent.ctx.strokeStyle = '#ccc';
				this.parent.ctx.stroke();
				this.parent.ctx.restore();
			}
		},

		selectionBox : function(){
			if(this.parent.selectionBox.endX != null)
			{
				var x1 = this.parent.selectionBox.startX,
					y1 = this.parent.selectionBox.startY,
					x2 = this.parent.selectionBox.endX,
					y2 = this.parent.selectionBox.endY;
				this.parent.ctx.beginPath();
				this.parent.ctx.setLineDash([6]);
				this.parent.ctx.lineWidth   = this.parent.selectionBox.lineWidth;
				this.parent.ctx.strokeStyle = this.parent.selectionBox.strokeStyle;
				this.parent.ctx.rect( x1, y1, (x2 - x1), (y2 - y1) );
				this.parent.ctx.stroke();
				this.parent.ctx.setLineDash([0]);	
			}
		},

		actionPoints : function()
		{
			for(i in this.parent.selecteds)
			{
				object       = this.parent.functions.getObject( this.parent.selecteds[i].id );
				actionPoints = this.parent.helpers.getActionPoints( object );
				for(i in actionPoints)
				{
					p = actionPoints[i];
					this.parent.ctx.beginPath();
					this.parent.ctx.arc(p.x, p.y, this.parent.defaults.actionPoint.size, 0, 2 * Math.PI, false);
					this.parent.ctx.lineWidth   = this.parent.defaults.actionPoint.lineWidth;
					this.parent.ctx.strokeStyle = this.parent.defaults.actionPoint.strokeStyle;
					this.parent.ctx.stroke();
				}
				if(this.parent.events.actionPointPress || this.parent.helpers.isOverActionPoint()){
					//actionPoint hover
					$('.stage').addClass('pointer')
					/*p = this.parent.events.activeActionPoint.target;
					this.point(p.x,p.y,{
						fillStyle : this.parent.defaults.actionPoint.hoverColor,
						size      : this.parent.defaults.actionPoint.size
					})*/
				}else $('.stage').removeClass('pointer');

				if(this.parent.events.selectedActionPoint)
				{
					var p = this.parent.events.selectedActionPoint;
					this.quickPoint(p.target.x,p.target.y)
				}
			}
		},

		point : function(x,y,data){
			this.parent.ctx.beginPath();
			this.parent.ctx.fillStyle = data.fillStyle;
			this.parent.ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
			this.parent.ctx.fill();
		},

		quickPoint : function(x,y){
			this.parent.ctx.beginPath();
			this.parent.ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
			this.parent.ctx.lineWidth = 3;
			this.parent.ctx.strokeStyle = 'orange';
			this.parent.ctx.stroke();
		},

		box : function(x1,y1,x2,y2){
			w = x2-x1;
			h = y2-y1;
			this.parent.ctx.beginPath();
			this.parent.ctx.rect(x1, y1, w, h);
			this.parent.ctx.lineWidth = 3;
			this.parent.ctx.strokeStyle = 'black';
			this.parent.ctx.stroke();
		},

		boxWH : function(x,y,w,h){
			this.parent.ctx.beginPath();
			this.parent.ctx.rect(x, y, w, h);
			this.parent.ctx.lineWidth = 1;
			this.parent.ctx.strokeStyle = 'black';
			this.parent.ctx.stroke();
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

			//this.parent.helpers.timer('start','ui');

			this.parent.getToolbox('objects').redraw();
			this.parent.getToolbox('resources').redraw();

			//this.parent.helpers.timer('stop','ui');

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

				if(this.parent.helpers.selectedIs('text'))     { this.parent.functions.edit('text');    flag = true; }
				if(this.parent.helpers.selectedIs('box'))      { this.parent.functions.edit('box');     flag = true; }
				if(this.parent.helpers.selectedIs('line'))     { this.parent.functions.edit('line');    flag = true; }
				if(this.parent.helpers.selectedIs('ellipse'))  { this.parent.functions.edit('ellipse'); flag = true; }
				if(this.parent.helpers.selectedIs('path'))     { this.parent.functions.edit('path');    flag = true; }

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