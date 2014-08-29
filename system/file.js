
$.extend( true, editor, {

	file : {

		init : function(){

			this.events();

		},

		events : function(){

			$('#files').change($.proxy(function(){
				var file = document.getElementById("files").files[0];
				if (file) {
				    var reader = new FileReader();
				    reader.readAsText(file, "UTF-8");
				    reader.onload = $.proxy(function (evt)
				    {
				        loadObj = JSON.parse(evt.target.result);	        
				        this.parent.reset();
				        this.parent.objects   = loadObj.objects;
				        this.parent.resources = loadObj.resources;
				        this.parent.current   = this.parent.helpers.getLastId() + 1;
				        this.parent.render();
				        this.parent.draw.ui();
						this.parent.draw.toolbar();
						this.parent.draw.reOrderByUi( true );
						this.parent.getToolbox('resources').redraw();
				    },this)
				}
			},this));

		},

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
				action : $.proxy(function( ret ){
					var w,h;
					a = ret['canvasSize'];
					editor.name = ret['projectName'];
					this.parent.reset();
					if(a == 'full') { w = $('.stage').width(); h = $('.stage').height(); }
					else{ b=a.split('h');c=b[0];d=c.split('w');h=Number(b[1]);w=Number(d[1]); }
					editor.init({
						width  : w,
						height : h,
						name   : ret['projectName']
					})
					newCanvas.close();
				},this)
			});
		},

		destroy : function(){

			this.parent.canvas.removeEventListener('mousemove');
			this.parent.canvas.removeEventListener('mousedown');
			this.parent.canvas.removeEventListener('mouseup');

		},

		getData : function(){

			var saveObj = {
				objects   : this.parent.objects,
				resources : this.parent.resources
			}

			return JSON.stringify( saveObj );

		},

		save : function()
		{
			var blob = new Blob([this.getData()], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "untitled.eld");
		},

		load : function(){ $("#files").click(); },

		savePng : function(){
			canvas.toBlob(function(blob) { saveAs(blob, "image.png"); }, "image/png");
		},

		getHtml : function( data )
		{
			headStr = '';
			if(data.utf8) headStr = '<head><meta charset="UTF-8"></head>';

			html = headStr + '<div style="width:'+this.parent.width+'px; height:'+this.parent.height+'px; position:relative; overflow:hidden">';

			left = 'left';
			if(data.mirror) left = 'right';

			for(x in data.objects)
			{

				o = data.objects[x];

				var absCoords = this.parent.helpers.getAbsCoords(o.startX,o.startY,o.width,o.height),
					x = absCoords.x,y = absCoords.y,w = absCoords.w,h = absCoords.h,cx = x + (w/2),cy = y + (h/2),
					sx = o.shadowOffsetX, sy = o.shadowOffsetY, sb = o.shadowBlur, sc = o.shadowColor;

				if(!sx) sx = '0'; if(!sy) sy = '0'; if(!sb) sb = '0'; if(!sc) sc = 'rgba(0,0,0,1)';

				color       = $.parseColor(sc);
				colorString = "rgb("+color[0]+","+color[1]+","+color[2]+")";
				opacity     = color[3];

				if(o.type == 'box')
				{
					if(o.src)
					{
						var str = '<img style="';
							str+= ' position:absolute;';
							str+= ' '+left+':'	  + x + 'px;';
							str+= ' top:'		  + y + 'px;';
							str+= ' width:'	  	  + w + 'px;';
							str+= ' height:'  	  + h + 'px;';
							str+= ' box-shadow: '+o.shadowOffsetX+'px '+o.shadowOffsetY+'px '+o.shadowBlur+'px '+o.shadowColor+';';
							str+= ' -ms-transform: rotate('+o.rotate+'deg); -webkit-transform: rotate('+o.rotate+'deg); transform: rotate('+o.rotate+'deg);'; 
							str+= '" src="' + o.src + '"';
							str+= ' />';
					}else
					{
						if(!o.fill) fill = "rgba(0,0,0,0)"; else fill = o.fill;
						var str = '<div style="';
							str+= ' position:absolute;';
							str+= ' '+left+':'		+ x + 'px;';
							str+= ' top:'		    + y + 'px;';
							str+= ' width:'	        + w + 'px;';
							str+= ' height:'	    + h + 'px;';
							str+= ' box-shadow: '+o.shadowOffsetX+'px '+o.shadowOffsetY+'px '+o.shadowBlur+'px '+o.shadowColor+';';
							str+= ' -ms-transform: rotate('+o.rotate+'deg); -webkit-transform: rotate('+o.rotate+'deg); transform: rotate('+o.rotate+'deg);'; 
							if(o.lineWidth) str+= ' border-style:solid; box-sizing:border-box;';
							str+= ' border-radius:'	+ o.radius + 'px;';
							str+= ' border-color:'	+ o.strokeStyle + ';';
							str+= ' border-width:'  + Number((o.lineWidth / 2) + 1) + 'px;';
							str+= ' background-color:' + fill + ';"';
							str+= '></div>';
					}
					html+=str;
				}
				if(o.type == 'text')
				{
					if(!o.fill) fill = "#000"; else fill = o.fill;
					var str = '<div style="';
						str+= ' position:absolute;';
						str+= ' '+left+':'		+ x + 'px;';
						str+= ' top:'		    + y + 'px;';
						str+= ' color:'		    + o.fillStyle + ';';
						str+= ' font-size:'	    + o.fontSize + 'px;';
						str+= ' font-family:'	+ o.font + ';';
						str+= ' text-shadow: '+o.shadowOffsetX+'px '+o.shadowOffsetY+'px '+o.shadowBlur+'px '+o.shadowColor+';';
						str+= ' -ms-transform: rotate('+o.rotate+'deg); -webkit-transform: rotate('+o.rotate+'deg); transform: rotate('+o.rotate+'deg);'; 
						if(o.isBold)   str+= ' font-weight:bold;';
						if(o.isItalic) str+= ' font-style:italic;';
						str+= ' alignment-baseline:before-edge';
						str+= '" >'+o.text+'</div>';
					html+=str;
				}

			}

			html += '</div>';

			return html;
		},

		html : function(){
			var blob = new Blob(
				[
					this.getHtml( { 
						objects : this.parent.objects, 
						utf8    : true 
					} )
				], {
					type: "text/html; charset=UTF-8"
				}
			);
			saveAs(blob, "untitled.html");
		},

		svg : function()
		{
			svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+this.parent.width+'px" height="'+this.parent.height+'px">';

			var counter = 0;
			
			this.parent.helpers.forEachObjects( $.proxy(function( o )
			{
				var absCoords = this.parent.helpers.getAbsCoords(o.startX,o.startY,o.width,o.height),
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

			var blob = new Blob([svg], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "untitled.svg");
		}

	}

	
})