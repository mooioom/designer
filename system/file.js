
$.extend( true, editor, {

	create : function( attributes ){
		newCanvas = new Popup({
			header     : getString("NewProject"),
			actionText : getString("Create"),
			closeText  : getString("Cancel"),
			inputs     : [
				{
					label      : getString("ProjectName"),
					varName    : "projectName",
					type       : "text",
					value      : editor.name,
					longText   : true,
				},
				{
					label     : getString("CanvasSize"),
					varName   : "canvasSize",
					type      : "select",
					longText  : true,
					options   : [
						{
							label : getString("FullScreen"),
							value : "full"
						},
						{ label : "800 x 600",  value : "w800h600" },
						{ label : "1024 x 768", value : "w1024h768" }
					]
				}
			],
			action     : function( ret ){

				a = ret['canvasSize'];
				editor.name = ret['projectName'];
				if(a == 'full'){
					resizeCanvas($('.stage').width(),$('.stage').height());
				}else{ b=a.split('h');c=b[0];d=c.split('w');h=Number(b[1]);w=Number(d[1]); resizeCanvas(w,h); }

				newCanvas.close();
			}
		});
		editor.reset(); 
	},

	destroy : function(){

		this.canvas.removeEventListener('mousemove');
		this.canvas.removeEventListener('mousedown');
		this.canvas.removeEventListener('mouseup');

	},
	
	reset : function(){
		this.objects         = [];
		this.selectedObjects = [];
		currentObject        = 0;
		this.render();
		this.drawExternalUi();
		this.drawtoolbar();
	},

	save : function()
	{
		var saveObj = {
			objects   : this.objects,
			resources : this.resources
		}
		var blob = new Blob([JSON.stringify( saveObj )], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "untitled.eld");
	},

	load : function(){
		$("#files").click();
	},

	saveImg : function(){
		// var dataURL = this.canvas.toDataURL();
		// var blob = new Blob([ dataURL ], {type: ""});
		// saveAs(blob, "image.png");
		canvas.toBlob(function(blob) { saveAs(blob, "image.png"); }, "image/png");
	},

	svg : function()
	{
		svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';

		var counter = 0;
		
		this.forEachObjects( $.proxy(function( o )
		{
			var absCoords = this.getAbsCoords(o.startX,o.startY,o.width,o.height),
				x = absCoords.x,y = absCoords.y,w = absCoords.w,h = absCoords.h,cx = x + (w/2),cy = y + (h/2),
				sx = o.shadowOffsetX, sy = o.shadowOffsetY, sb = o.shadowBlur, sc = o.shadowColor;

			counter ++ ;

			if(!sx) sx = '0'; if(!sy) sy = '0'; if(!sb) sb = '0'; if(!sc) sc = 'rgba(0,0,0,1)';

			color       = $.parseColor(sc);
			colorString = "rgb("+color[0]+","+color[1]+","+color[2]+")";
			opacity     = color[3];

			str+= '<filter id="f'+counter+'" height="150%" width="150%">';
			str+= '<feGaussianBlur in="SourceAlpha" stdDeviation="'+(sb/3)+'"/>';
			str+= '<feOffset dx="'+(sx/1.5)+'" dy="'+(sy/1.5)+'" result="offsetblur"/>';
			str+= '<feFlood flood-opacity="'+opacity+'" flood-color="'+colorString+'"/>';
			str+= '<feComposite in2="offsetblur" operator="in"/>';
			str+= '<feMerge>';
			str+= '<feMergeNode/>';
			str+= '<feMergeNode in="SourceGraphic"/>';
			str+= '</feMerge>';
			str+= '</filter>';

			svg+=str;

			if(w == 0) w = '0.1';

			if(o.type == 'box')
			{
				if(o.src)
				{
					var str = '<image ';
					str+= ' x="'		  + x + '"';
					str+= ' y="'		  + y + '"';
					str+= ' width="'	  + w + '"';
					str+= ' height="'	  + h + '"';
					str+= ' transform="rotate('+o.rotate+','+cx+','+cy+')"';
					if(o.shadowColor) str+= ' style="filter:url(#f'+counter+')"';
					str+= ' xlink:href="' + o.src + '"';
					str+= ' />';
				}else
				{
					if(!o.fill) fill = "rgba(0,0,0,0)"; else fill = o.fill;
					var str = '<rect ';
					str+= ' x="'		    + x + '"';
					str+= ' y="'		    + y + '"';
					str+= ' width="'	    + w + '"';
					str+= ' height="'	    + h + '"';
					str+= ' rx="'		    + o.radius + '"';
					str+= ' ry="'		    + o.radius + '"';
					str+= ' stroke="'	    + o.strokeStyle + '"';
					str+= ' stroke-width="' + (o.lineWidth / 2) + '"';
					str+= ' transform="rotate('+o.rotate+','+cx+','+cy+')"';
					if(o.shadowColor) str+= ' style="filter:url(#f'+counter+')"';
					str+= ' fill="'		    + fill + '"';
					str+= ' />';
				}
				svg+=str;
			}
			if(o.type == 'text')
			{
				if(!o.fill) fill = "#000"; else fill = o.fill;
				var str = '<text ';
					str+= ' x="'		    + x + '"';
					str+= ' y="'		    + y + '"';
					str+= ' font-size="'	+ o.fontSize + '"';
					str+= ' font-family="'	+ o.font + '"';
					if(o.isBold)   str+= ' font-weight="bold"';
					if(o.isItalic) str+= ' font-style="italic"';
					str+= ' style="';
					if(o.shadowColor) str+= 'filter:url(#f'+counter+'); ';
					str+= ' fill: ' + o.fillStyle + '; stroke: ' + o.strokeStyle + '; stroke-width: ' + o.lineWidth + '"';
					str+= ' alignment-baseline="before-edge"'; // equiv to Top
					str+= ' transform="rotate('+o.rotate+','+cx+','+cy+')"';
					str+= ' >'+o.text+'</text>';

				svg+=str;
			}
		},this));

		svg+='</svg>'
		//console.log('svg',svg);
		var blob = new Blob([svg], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "untitled.svg");
	}
})