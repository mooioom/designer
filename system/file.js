
$.extend( true, designer, {

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
				        this.parent.objects   = loadObj.objects   || [];
				        this.parent.groups    = loadObj.groups    || [];
				        this.parent.resources = loadObj.resources || [];
				        this.parent.current   = this.parent.helpers.getLastId() + 1;
				        for(i in this.parent.objects)
				        {
				        	var o = this.parent.objects[i];
				        	if(o.type=='path') this.parent.create.attachPathFunctions( o );
				        }
				        this.parent.render();
				        this.parent.draw.ui();
						this.parent.draw.toolbar();
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
						value      : designer.name,
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
					designer.name = ret['projectName'];
					this.parent.reset();
					if(a == 'full') { w = $('.stage').width(); h = $('.stage').height(); }
					else{ b=a.split('h');c=b[0];d=c.split('w');h=Number(b[1]);w=Number(d[1]); }
					designer.init({
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
			// todo : width,height of canvas
			var saveObj = {
				objects   : this.parent.objects,
				groups    : this.parent.groups,
				resources : this.parent.resources
			}

			return JSON.stringify( saveObj );

		},

		save : function()
		{
			popup = new Popup({
				header    : getString('saveAs'),
				closeText : getString('Cancel'),
				inputs    : [{
					label    : getString('FileName')+' :',
					type     : 'text',
					longText : true,
					varName  : 'filename'
				}],
				action : $.proxy(function( d ){
					filename = $('input[v=filename]').val();
					var blob = new Blob([this.getData()], {type: "text/plain;charset=utf-8"});
					saveAs(blob, filename+".eld");
					popup.close();
				},this)
			});
		},

		load : function(){ $("#files").click(); },

		savePng : function(){
			popup = new Popup({
				header    : getString('saveAs'),
				closeText : getString('Cancel'),
				inputs    : [{
					label    : getString('FileName')+' :',
					type     : 'text',
					longText : true,
					varName  : 'filename'
				}],
				action : $.proxy(function( d ){
					filename = $('input[v=filename]').val();
					canvas.toBlob(function(blob) { saveAs(blob, filename+".png"); }, "image/png");
					popup.close();
				},this)
			});
		},

		saveJpg : function(){
			popup = new Popup({
				header    : getString('saveAs'),
				closeText : getString('Cancel'),
				inputs    : [{
					label    : getString('FileName')+' :',
					type     : 'text',
					longText : true,
					varName  : 'filename'
				}],
				action : $.proxy(function( d ){
					filename = $('input[v=filename]').val();
					o = this.parent.create.object( 'box', 0, 0, this.parent.width, this.parent.height, {color1:'',color2:'#fff'});
					this.parent.objects.unshift(o);
					this.parent.render();
					canvas.toBlob(function(blob) { saveAs(blob, filename+".jpg"); }, "image/jpeg");
					this.parent.objects.splice(0,1);
					this.parent.render();
					popup.close();
				},this)
			});
			
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

				if(!o.shadowOffsetX) o.shadowOffsetX = 0;
				if(!o.shadowOffsetY) o.shadowOffsetY = 0;
				if(!o.shadowBlur)    o.shadowBlur    = 0;

				if(o.onExport) { str = o.onExport; html += str; continue; }

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
							if(o.addToExportStyle) str += o.addToExportStyle + ';';
							if(o.shadowOffsetX || o.shadowOffsetY || o.shadowBlur || o.shadowColor) str+= ' box-shadow: '+o.shadowOffsetX+'px '+o.shadowOffsetY+'px '+o.shadowBlur+'px '+o.shadowColor+';';
							if(o.rotate) str+= ' -ms-transform: rotate('+o.rotate+'deg); -webkit-transform: rotate('+o.rotate+'deg); transform: rotate('+o.rotate+'deg);'; 
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
							if(o.addToExportStyle) str += o.addToExportStyle + ';';
							if(o.shadowOffsetX || o.shadowOffsetY || o.shadowBlur || o.shadowColor) str+= ' box-shadow: '+o.shadowOffsetX+'px '+o.shadowOffsetY+'px '+o.shadowBlur+'px '+o.shadowColor+';';
							if(o.rotate)      str+= ' -ms-transform: rotate('+o.rotate+'deg); -webkit-transform: rotate('+o.rotate+'deg); transform: rotate('+o.rotate+'deg);'; 
							if(o.lineWidth)   str+= ' border-style:solid; box-sizing:border-box;';
							if(o.radius)      str+= ' border-radius:'	+ o.radius + 'px;';
							if(o.strokeStyle) str+= ' border-color:'	+ o.strokeStyle + ';';
							if(o.lineWidth)   str+= ' border-width:'  + Number((o.lineWidth / 2) + 1) + 'px;';
							str+= ' background-color:' + fill + ';';
							str+= '"></div>';
					}
					html+=str;
				}
				if(o.type == 'text')
				{
					if(!o.textBefore) o.textBefore    = "";
					if(!o.textAfter)  o.textAfter     = "";
					if(!o.fill) fill = "#000"; else fill = o.fill;
					var str = '<div style="';
						str+= ' position:absolute;';
						str+= ' '+left+':'		+ x + 'px;';
						str+= ' top:'		    + y + 'px;';
						str+= ' color:'		    + o.fillStyle + ';';
						str+= ' font-size:'	    + o.fontSize + 'px;';
						str+= ' font-family:'	+ o.font + ';';
						if(o.addToExportStyle) str += o.addToExportStyle + ';';
						if(o.shadowOffsetX || o.shadowOffsetY || o.shadowBlur || o.shadowColor) str+= ' text-shadow: '+o.shadowOffsetX+'px '+o.shadowOffsetY+'px '+o.shadowBlur+'px '+o.shadowColor+';';
						if(o.rotate)   str+= ' -ms-transform: rotate('+o.rotate+'deg); -webkit-transform: rotate('+o.rotate+'deg); transform: rotate('+o.rotate+'deg);'; 
						if(o.isBold)   str+= ' font-weight:bold;';
						if(o.isItalic) str+= ' font-style:italic;';
						str+= ' alignment-baseline:before-edge';
						str+= '" >'+o.textBefore+o.text+o.textAfter+'</div>';
					html+=str;
				}

			}

			html += '</div>';

			return html;
		},

		getSvg : function( data )
		{
			svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+this.parent.width+'px" height="'+this.parent.height+'px">';

			var counter = 0;
			
			for(x in data.objects)
			{

				o = data.objects[x];

				var absCoords = this.parent.helpers.getAbsCoords(o.startX,o.startY,o.width,o.height),
					x = absCoords.x,y = absCoords.y,w = absCoords.w,h = absCoords.h,cx = x + (w/2),cy = y + (h/2),
					sx = o.shadowOffsetX, sy = o.shadowOffsetY, sb = o.shadowBlur, sc = o.shadowColor, addShadow = false;

				counter ++ ;

				if(!sc) sc = 'rgba(0,0,0,1)';

				color       = $.parseColor(sc);
				colorString = "rgb("+color[0]+","+color[1]+","+color[2]+")";
				opacity     = color[3];

				if(!sx) sx = '0'; if(!sy) sy = '0'; if(!sb) sb = '0';

				if(sx != "0" || sy != "0" || sb != "0")
				{

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

					addShadow = true;

				}

				if(w == 0) w = '0.1';
				if(h == 0) h = '0.1';

				if(!o.dynamicData) o.dynamicData = '';

				if(o.type == 'box')
				{
					if(o.src)
					{
						var str = '<image ';
						str+= ' id="'		  + o.dynamicData + '"';
						if(data.excludeDesignerData != true){
							if(o.locked) str+= ' locked="1"';
							if(o.title)  str+= ' otitle="'+o.title+'"';
							if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						}
						str+= ' x="'		  + x + '"';
						str+= ' y="'		  + y + '"';
						str+= ' width="'	  + w + '"';
						str+= ' height="'	  + h + '"';
						if(o.rotate)  str+= ' transform="rotate('+o.rotate+' '+cx+' '+cy+')"';
						if(addShadow) str+= ' style="filter:url(#f'+counter+')"';
						if(o.opacity) str+= ' opacity = "'+o.opacity+'"';
						str+= ' xlink:href="' + o.src + '"';
						str+= ' />';
					}else
					{
						if(!o.fill) fill = "rgba(0,0,0,0)"; else fill = o.fill;
						var str = '<rect ';
						str+= ' id="'		    + o.dynamicData + '"';
						if(data.excludeDesignerData != true){
							if(o.locked) str+= ' locked="1"';
							if(o.title)  str+= ' otitle="'+o.title+'"';
							if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						}
						str+= ' x="'		    + x + '"';
						str+= ' y="'		    + y + '"';
						str+= ' width="'	    + w + '"';
						str+= ' height="'	    + h + '"';
						if(o.radius) str+= ' rx="' + o.radius + '"';
						if(o.radius) str+= ' ry="' + o.radius + '"';
						str+= ' stroke="'	    + o.strokeStyle + '"';
						str+= ' stroke-width="' + o.lineWidth / 2 + '"';
						if(o.rotate)  str+= ' transform="rotate('+o.rotate+' '+cx+' '+cy+')"';
						if(addShadow) str+= ' style="filter:url(#f'+counter+')"';
						if(o.opacity) str+= ' opacity = "'+o.opacity+'"';
						str+= ' fill="' + fill + '"';
						str+= ' />';
					}
					svg+=str;
				}
				if(o.type == 'text')
				{
					if(!o.fillStyle) fill = "#000"; else fill = o.fillStyle;
					//todo fontsize compensation
					fontComp = o.fontSize/10; // arial type
					var str = '<text ';
						str+= ' id="'		    + o.dynamicData + '"';
						if(data.excludeDesignerData != true){
							if(o.locked) str+= ' locked="1"';
							if(o.title)  str+= ' otitle="'+o.title+'"';
							if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						}
						str+= ' xml:space="preserve"';
						str+= ' text-anchor="start"';
						str+= ' x="'		    + x + '"';
						str+= ' y="'		    + (y + (o.fontSize - fontComp)) + '"';
						str+= ' font-size="'	+ o.fontSize + '"';
						str+= ' font-family="'	+ o.font + '"';
						str+= ' fill="'	        + fill + '"';
						str+= ' stroke="'	    + o.strokeStyle + '"';
						str+= ' stroke-width="'	+ o.lineWidth + '"';
						if(o.isBold)   str+= ' font-weight="bold"';
						if(o.isItalic) str+= ' font-style="italic"';
						str+= ' style="';
						if(addShadow) str+= 'filter:url(#f'+counter+'); ';
						str+= '"';
						//str+= ' alignment-baseline="before-edge"'; // equiv to Top
						if(o.rotate) str+= ' transform="rotate('+o.rotate+' '+cx+' '+cy+')"';
						if(o.opacity) str+= ' opacity = "'+o.opacity+'"';
						str+= ' >'+o.text+'</text>';

					svg+=str;
				}
				if(o.type == 'path')
				{
					if(!o.fillStyle) fill = "none"; else fill = o.fillStyle;
					var str = '<path ';
						str+= ' id="'		  + o.dynamicData + '"';
						if(data.excludeDesignerData != true){
							if(o.locked) str+= ' locked="1"';
							if(o.title)  str+= ' otitle="'+o.title+'"';
							if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						}
						str+= ' d="'+o.path+'"';
						str+= ' stroke-width="'+o.lineWidth+'"';
						str+= ' stroke="'+o.strokeStyle+'"';
						str+= ' fill="'+fill+'"';
						if(o.rotate) str+= ' transform="rotate('+o.rotate+' '+(o.topLeftX + (o.width/2))+' '+(o.topLeftY + (o.height/2))+')"';
						str+= '></path>';
						svg+=str;
				}
				if(o.type == 'ellipse')
				{
					if(!o.fillStyle) fill = "none"; else fill = o.fillStyle;
					var str = '<ellipse ';
						str+= ' id="'		  + o.dynamicData + '"';
						if(data.excludeDesignerData != true){
							if(o.locked) str+= ' locked="1"';
							if(o.title)  str+= ' otitle="'+o.title+'"';
							if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						}
						str+= ' rx="'+(o.rx/2)+'"';
						str+= ' ry="'+(o.ry/2)+'"';
						str+= ' cx="'+o.cx+'"';
						str+= ' cy="'+o.cy+'"';
						str+= ' stroke-width="'+o.lineWidth+'"';
						str+= ' stroke="'+o.strokeStyle+'"';
						str+= ' fill="'+fill+'"';
						if(o.rotate) str+= ' transform="rotate('+o.rotate+' '+(o.startX + (o.width/2))+' '+(o.startY + (o.height/2))+')"';
						str+= '></ellipse>';
						svg+=str;
				}
				if(o.type == 'line')
				{
					fill = "none";
					var str = '<line ';
						str+= ' id="'+ o.dynamicData + '"';
						if(data.excludeDesignerData != true){
							if(o.locked) str+= ' locked="1"';
							if(o.title)  str+= ' otitle="'+o.title+'"';
							if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						};
						str+= ' x1="'+o.startX+'"';
						str+= ' y1="'+o.startY+'"';
						str+= ' x2="'+o.endX+'"';
						str+= ' y2="'+o.endY+'"';
						str+= ' stroke-width="'+o.lineWidth+'"';
						str+= ' stroke="'+o.strokeStyle+'"';
						str+= ' fill="'+fill+'"';
						if(o.rotate) str+= ' transform="rotate('+o.rotate+' '+(o.startX + (o.width/2))+' '+(o.startY + (o.height/2))+')"';
						str+= '></line>';
						svg+=str;
				}
				if(o.type == 'circle')
				{
					if(!o.fill) fill = "none"; else fill = o.fill;
					var str = '<circle ';
						str+= ' id="' + o.dynamicData + '"';
						if(data.excludeDesignerData != true){
							if(o.locked) str+= ' locked="1"';
							if(o.title)  str+= ' otitle="'+o.title+'"';
							if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						}
						str+= ' r="'+(o.r)+'"';
						str+= ' cx="'+o.cx+'"';
						str+= ' cy="'+o.cy+'"';
						str+= ' stroke-width="'+o.lineWidth+'"';
						str+= ' stroke="'+o.strokeStyle+'"';
						str+= ' fill="'+fill+'"';
						str+= '></circle>';
						svg+=str;
				}

			}

			//css = '<style type="text/css">';
			//css += 'rect{transition:all 0.3s ease-in; fill : #fff;}rect:hover{fill:#000}';
			//css += '</style>';

			//script = '<script type="text/javascript">';
			//script+= '$("rect").mouseover(function(){ $(this).velocity({fill:"#000"},250).stop() });';
			//script+= '$("rect").mouseout( function(){ $(this).velocity({fill:"#fff"},250).stop() });';
			//script+= '</script>';

			svg+='</svg>';//+css+script;

			return svg;
		},

		html : function( filename ){
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

		svg : function( filename )
		{
			var blob = new Blob(
				[
					this.getSvg({
						objects             : this.parent.objects
					})
				], {
					type: "text/plain;charset=utf-8"
				}
			);
			saveAs(blob, "untitled.svg");
		}

	}

	
})