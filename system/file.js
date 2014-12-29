
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
				    	var data = this.loadHtml ? 
				    		this.parseHtml( $(evt.target.result)[1] ) : 
				    		JSON.parse(evt.target.result);

				        this.parent.reset();
				        this.parent.objects   = data.objects   || [];
				        this.parent.groups    = data.groups    || [];
				        this.parent.resources = data.resources || [];
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

		load : function( isHtml ){ this.loadHtml = isHtml; $("#files").click(); },

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

			html = headStr + '<body style="margin:0px;"><div style="width:'+this.parent.width+'px; height:'+this.parent.height+'px; position:relative; overflow:hidden">';

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
						var str = '<img';
							if(o.dynamicData) str+= ' dynamic-data="' + o.dynamicData + '"';
							str+= ' style="';
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
						var str = '<div';
							if(o.dynamicData) str+= ' dynamic-data="' + o.dynamicData + '"';
							str+= ' style="';
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
							if(o.lineWidth)   str+= ' border-width:'  + Math.round(o.lineWidth/2) + 'px;';
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
					var str = '<div'; 
						if(o.dynamicData) str+= ' dynamic-data="' + o.dynamicData + '"';
						str+= ' style="';
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
				if(o.type == 'path')
				{
					if(!o.textBefore) o.textBefore    = "";
					if(!o.textAfter)  o.textAfter     = "";
					if(!o.fill) fill = "#000"; else fill = o.fill;
					if(!o.fillStyle) fill = "none"; else fill = o.fillStyle;

					var str = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" ';
						str+= ' dynamic-data="' + o.dynamicData + '"';
						str+= ' viewbox="'+(o.topLeftX-(o.lineWidth/2))+' '+(o.topLeftY)+' '+(o.width+(o.lineWidth*2))+' '+(o.height-(o.lineWidth))+'" ';
						str+= ' style="position:absolute; ';
						str+= ' '+left+':'		+ (o.topLeftX - o.lineWidth/2) + 'px;';
						str+= ' top:'		    + (o.topLeftY - o.lineWidth/2) + 'px;';
						str+= ' width:'		    + o.width    + 'px;';
						str+= ' height:'		+ o.height   + 'px;';
						if(o.rotate)   str+= ' -ms-transform: rotate('+o.rotate+'deg); -webkit-transform: rotate('+o.rotate+'deg); transform: rotate('+o.rotate+'deg);'; 
						str+= ' ">';
						str+= '<path ';
						if(data.excludeDesignerData != true){
							str+= ' oid="'+o.id+'"';
							if(o.locked) str+= ' locked="1"';
							if(o.title)  str+= ' otitle="'+o.title+'"';
							if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
							if(o.groupId)str+= ' ogid="'+o.groupId+'"';
						}
						str+= ' d="'+o.path+'"';
						str+= ' stroke-width="'+o.lineWidth+'"';
						str+= ' stroke="'+o.strokeStyle+'"';
						str+= ' fill="'+fill+'"';
						str+= '></path></svg>';
						html+=str;
				}
				if(o.type == 'ellipse')
				{
					if(!o.textBefore) o.textBefore    = "";
					if(!o.textAfter)  o.textAfter     = "";
					if(!o.fill) fill = "#000"; else fill = o.fill;
					if(!o.fillStyle) fill = "none"; else fill = o.fillStyle;

					var str = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" ';
						str+= ' dynamic-data="' + o.dynamicData + '"';
						str+= ' viewbox="'+(o.startX-(o.lineWidth/2))+' '+(o.startY)+' '+(o.width+(o.lineWidth*2))+' '+(o.height-(o.lineWidth))+'" ';
						str+= ' style="position:absolute; ';
						str+= ' '+left+':'		+ (o.startX - o.lineWidth/2) + 'px;';
						str+= ' top:'		    + (o.startY - o.lineWidth/2) + 'px;';
						str+= ' width:'		    + o.width    + 'px;';
						str+= ' height:'		+ o.height   + 'px;';
						if(o.rotate)   str+= ' -ms-transform: rotate('+o.rotate+'deg); -webkit-transform: rotate('+o.rotate+'deg); transform: rotate('+o.rotate+'deg);'; 
						str+= ' ">';
						str+= '<ellipse ';
						if(data.excludeDesignerData != true){
							str+= ' oid="'+o.id+'"';
							if(o.locked) str+= ' locked="1"';
							if(o.title)  str+= ' otitle="'+o.title+'"';
							if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
							if(o.groupId)str+= ' ogid="'+o.groupId+'"';
						}
						str+= ' rx="'+(o.rx/2)+'"';
						str+= ' ry="'+(o.ry/2)+'"';
						str+= ' cx="'+o.cx+'"';
						str+= ' cy="'+o.cy+'"';
						str+= ' stroke-width="'+(o.lineWidth/2)+'"';
						str+= ' stroke="'+o.strokeStyle+'"';
						str+= ' fill="'+fill+'"';
						str+= '></ellipse></svg>';
						html+=str;
				}
				if(o.type == 'line')
				{
					if(!o.textBefore) o.textBefore    = "";
					if(!o.textAfter)  o.textAfter     = "";
					if(!o.fill) fill = "#000"; else fill = o.fill;
					if(!o.fillStyle) fill = "none"; else fill = o.fillStyle;

					var str = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" ';
						str+= ' dynamic-data="'+ o.dynamicData + '"';
						str+= ' viewbox="'+(o.startX-(o.lineWidth/2))+' '+(o.startY)+' '+(o.width+(o.lineWidth*2))+' '+(o.height-(o.lineWidth))+'" ';
						str+= ' style="position:absolute; ';
						str+= ' '+left+':'		+ (o.startX - o.lineWidth/2) + 'px;';
						str+= ' top:'		    + (o.startY - o.lineWidth/2) + 'px;';
						str+= ' width:'		    + o.width    + 'px;';
						str+= ' height:'		+ o.height   + 'px;';
						if(o.rotate)   str+= ' -ms-transform: rotate('+o.rotate+'deg); -webkit-transform: rotate('+o.rotate+'deg); transform: rotate('+o.rotate+'deg);'; 
						str+= ' ">';
						str+= '<line ';
						if(data.excludeDesignerData != true){
							str+= ' oid="'+o.id+'"';
							if(o.locked) str+= ' locked="1"';
							if(o.title)  str+= ' otitle="'+o.title+'"';
							if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
							if(o.groupId)str+= ' ogid="'+o.groupId+'"';
						};
						str+= ' x1="'+o.startX+'"';
						str+= ' y1="'+o.startY+'"';
						str+= ' x2="'+o.endX+'"';
						str+= ' y2="'+o.endY+'"';
						str+= ' stroke-width="'+o.lineWidth+'"';
						str+= ' stroke="'+o.strokeStyle+'"';
						str+= ' fill="'+fill+'"';
						str+= '></line></svg>';
						html+=str;
				}

			}

			html += '</div>';
			html += this.drawCustomTags();
			html += '</body>';

			return html;
		},

		counter : 0,

		getSvgElement : function( o, data ){
			//switch
			var absCoords = this.parent.helpers.getAbsCoords(o.startX,o.startY,o.width,o.height),
				x = absCoords.x,y = absCoords.y,w = absCoords.w,h = absCoords.h,cx = x + (w/2),cy = y + (h/2),
				sx = o.shadowOffsetX, sy = o.shadowOffsetY, sb = o.shadowBlur, sc = o.shadowColor, addShadow = false;

			this.counter ++ ;

			if(!sc) sc = 'rgba(0,0,0,1)';

			color       = $.parseColor(sc);
			colorString = "rgb("+color[0]+","+color[1]+","+color[2]+")";
			opacity     = color[3];

			if(!sx) sx = '0'; if(!sy) sy = '0'; if(!sb) sb = '0';

			if(sx != "0" || sy != "0" || sb != "0")
			{

				str+= '<filter id="f'+this.counter+'" height="150%" width="150%">';
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

			x=x+0.5; y=y+0.5;

			if(o.type == 'box')
			{
				if(o.src)
				{
					var str = '<image ';
					str+= ' id="'		  + o.dynamicData + '"';
					if(data.excludeDesignerData != true){
						str+= ' oid="'+o.id+'"';
						if(o.locked) str+= ' locked="1"';
						if(o.title)  str+= ' otitle="'+o.title+'"';
						if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						if(o.groupId)str+= ' ogid="'+o.groupId+'"';
					}
					str+= ' x="'		  + x + '"';
					str+= ' y="'		  + y + '"';
					str+= ' width="'	  + w + '"';
					str+= ' height="'	  + h + '"';
					if(o.rotate)  str+= ' transform="rotate('+o.rotate+' '+cx+' '+cy+')"';
					if(addShadow) str+= ' style="filter:url(#f'+this.counter+')"';
					if(o.opacity) str+= ' opacity = "'+o.opacity+'"';
					str+= ' xlink:href="' + o.src + '"';
					str+= ' />';
				}else
				{
					if(!o.fill) fill = "rgba(0,0,0,0)"; else fill = o.fill;
					var str = '<rect ';
					str+= ' id="'		    + o.dynamicData + '"';
					if(data.excludeDesignerData != true){
						str+= ' oid="'+o.id+'"';
						if(o.locked) str+= ' locked="1"';
						if(o.title)  str+= ' otitle="'+o.title+'"';
						if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						if(o.groupId)str+= ' ogid="'+o.groupId+'"';
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
					if(addShadow) str+= ' style="filter:url(#f'+this.counter+')"';
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
						str+= ' oid="'+o.id+'"';
						if(o.locked) str+= ' locked="1"';
						if(o.title)  str+= ' otitle="'+o.title+'"';
						if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						if(o.groupId)str+= ' ogid="'+o.groupId+'"';
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
					if(addShadow) str+= 'filter:url(#f'+this.counter+'); ';
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
						str+= ' oid="'+o.id+'"';
						if(o.locked) str+= ' locked="1"';
						if(o.title)  str+= ' otitle="'+o.title+'"';
						if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						if(o.groupId)str+= ' ogid="'+o.groupId+'"';
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
						str+= ' oid="'+o.id+'"';
						if(o.locked) str+= ' locked="1"';
						if(o.title)  str+= ' otitle="'+o.title+'"';
						if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						if(o.groupId)str+= ' ogid="'+o.groupId+'"';
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
						str+= ' oid="'+o.id+'"';
						if(o.locked) str+= ' locked="1"';
						if(o.title)  str+= ' otitle="'+o.title+'"';
						if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						if(o.groupId)str+= ' ogid="'+o.groupId+'"';
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
						str+= ' oid="'+o.id+'"';
						if(o.locked) str+= ' locked="1"';
						if(o.title)  str+= ' otitle="'+o.title+'"';
						if(o.url)    str+= ' onclick="window.open(\''+o.url+'\',\'_blank\')" dataurl="'+o.url+'"';
						if(o.groupId)str+= ' ogid="'+o.groupId+'"';
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
			return str;
		},

		drawGroup : function( objects, data ){
			var svgStr = '';
			for(i in objects){
				var o = objects[i];
				if(o.oType=='object') svgStr += this.getSvgElement( o, data );
				if(o.oType=='group')
				{
					if(!data.excludeDesignerData)
					{
						var title 	  = o.title,
							gid       = o.gid,
							groupId   = o.groupId,
							visible   = o.visible,
							locked    = o.locked,
							collapsed = o.collapsed;
						svgStr += '<g gtitle="'+title+'" gid="'+gid+'" groupid="'+groupId+'" gvisible="'+visible+'" glocked="'+locked+'" gcollapsed="'+collapsed+'">';
					}else svgStr += '<g title="'+o.title+'">';
					
					svgStr += this.drawGroup(o.objects, data );
					svgStr += '</g>';
				}
			}
			return svgStr;
		},

		drawCustomTags : function(){
			var str = '';
			if( !this.parent.customTags.length ) return '';
			str += '<customTags>';
			for(i in this.parent.customTags)
			{
				var tag = this.parent.customTags[i];
				str += '<'+tag.name+' ';
				str += 'data="'+escape(JSON.stringify(tag))+'"';
				str += ' />';
			}
			str += '</customTags>';
			return str;
		},

		getSvg : function( data )
		{
			this.counter = 0;
			svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+this.parent.width+'px" height="'+this.parent.height+'px">';
			var nested = this.parent.helpers.getNested( 'getFullVersion', 'keepOriginalOrder' );
			svg += this.drawGroup( nested, data );
			svg += this.drawCustomTags();
			svg += '</svg>';
			return svg;
		},

		parse : function( el ){

			if( $(el).prop('tagName') == 'svg' ) return this.parseSvg( el );
			else if( $(el).prop('tagName').toLowerCase() == 'div' ) return this.parseHtml( el );

		},

		parseHtml : function( html ){

			var data              = { objects : [], groups : [], resources : [], customTags : [] },
				current           = 0;

			$('*',html).each(function(){

				var found     = false,
					newObject = {};

				// todo rotate, lock, visible, url, title
				
				switch($(this).prop("tagName").toLowerCase())
				{
					case 'image' :
					case 'div' :

						var item = $(this);

						var x 			  = Number(item.css('left').replace('px','')),
							y 			  = Number(item.css('top').replace('px','')),
							w 			  = Number(item.css('width').replace('px','')),
							h 			  = Number(item.css('height').replace('px','')),
							bgColor 	  = item.css('background-color'),
							color 		  = item.css('color'),
							borderWidth   = item.css('border-width').replace('px',''),
							borderColor   = item.css('border-color'),
							borderRadius  = Number(item.css('border-radius').replace('px','')),
							text 		  = item.html(),
							fontSize 	  = Number(item.css('font-size').replace('px','')),
							fontFamily 	  = item.css('font-family'),
							fontWeight 	  = item.css('font-weight'),
							dynamicData   = item.attr('dynamic-data'),
							src 		  = item.attr('src'),
							shadowOffsetX = 0,
							shadowOffsetY = 0,
							shadowBlur    = 0,
							shadowColor   = '';

						found = true;

						matrix = '';
						var rotate = 0;
						if( item.css('transform') && 
							item.css('transform').search('rotate') != -1 )
							rotate = Number(item.css('transform').replace('rotate(','').replace('deg)',''));

						if( item.css('box-shadow') || item.css('text-shadow') ){
							var shadow = item.css('box-shadow') ? 
								item.css('box-shadow') : 
								item.css('text-shadow');

							shadowColor = shadow.match(/(rgb|rgba)\((.+?)\)/)[0];
							shadow = shadow.replace(shadowColor,'').split(' ').filter(function(n){ return n });

							shadowOffsetX = Number(shadow[0].replace('px',''));
							shadowOffsetY = Number(shadow[1].replace('px',''));
							shadowBlur    = Number(shadow[2].replace('px',''));
						}

						newObject = {
							id     		  : current,
							groupId       : '',
							dynamicData   : dynamicData || '',
							title         : item.attr('otitle') || '',
							url           : item.attr('dataurl') || '',
							layer  		  : 0,
							type          : '',
							startX 		  : x,
							startY 		  : y,
							endX   		  : x + w,
							endY   		  : y + h,
							width         : w,
							height        : h,
							rotate        : rotate,
							shadowColor   : shadowColor,
							shadowBlur    : shadowBlur,
							shadowOffsetX : shadowOffsetX,
							shadowOffsetY : shadowOffsetY,
							visible       : true,
							locked        : item.attr('locked') ? true : false,
							stroke 	  	  : '',
							lineWidth     : borderWidth*2 || 0,
							strokeStyle   : borderColor,
							fill 	      : bgColor,
							fillStyle     : '',
							radius        : borderRadius || 0,
							opacity       : 1,
							matrix        : matrix
						};

						if(!fontSize && !src){
							newObject.type = 'box';
						}
						else if(!fontSize){
							newObject.type = 'box';
							newObject.src = src;
						}
						else{
							newObject.type = 'text';
							newObject.text = text;
							newObject.endX = 0;
							newObject.endY = 0;
							newObject.width = 0;
							newObject.height = 0;
							newObject.lineWidth = borderWidth || 0;
							newObject.fill = '';
							newObject.fillStyle = color;
							newObject.font = fontFamily
							newObject.fontSize = fontSize,
							newObject.lineHeight = '';
							newObject.isItalic = '';
							newObject.isBold = fontWeight;
						}

					break;
					case 'svg' :
						// path ellipse line circle
						var a = $(this).children();

						var x = Number($(this).css('top').replace('px',''));
						var y = Number($(this).css('left').replace('px',''));
						var dynamicData = $(this).attr('dynamic-data');
						var title = a.attr('otitle');
						var rx = Number(a.attr('rx'));
						var ry = Number(a.attr('ry'));
						var cx = Number(a.attr('cx'));
						var cy = Number(a.attr('cy'));
						var strokeWidth = Number(a.attr('stroke-width'));
						var stroke = a.attr('stroke');
						var fill = a.attr('fill');

						var rotate = 0;
						if( $(this).css('transform') && 
							$(this).css('transform').search('rotate') != -1 )
							rotate = Number($(this).css('transform').replace('rotate(','').replace('deg)',''));
						
						var d = a.attr('d');

						found = true;

						switch( a.prop('tagName') )
						{
							case 'ellipse' :
								found = true;
								newObject = 
								{
									id     		  : current,
									groupId       : Number( $(this).attr('ogid') ) || '',
									dynamicData   : dynamicData || '',
									title         : title || '',
									url           : $(this).attr('dataurl') || '',
									type          : 'ellipse',
									opacity       : 1,
									matrix        : matrix,
									rotate        : rotate,
									visible       : true,
									locked        : $(this).attr('locked') ? true : false,
									drawByCenter  : true,
									ry            : ry * 2,
									rx			  : rx * 2,
									cy			  : cy,
									cx			  : cx,
									strokeStyle   : stroke,
									fillStyle     : fill,
									lineWidth     : strokeWidth * 2 || 0,
									stroke        : '#000'
								}
							break;
							case 'path' :
								found = true;
								if(stroke && !$(a).attr('stroke-width')) lineWidth = 1;
								else if(stroke && $(a).attr('stroke-width')) lineWidth = Number($(a).attr('stroke-width'));
								if(!$(a).attr('d')) found = false;
								newObject = 
								{
									id     		  : current,
									groupId       : Number( $(a).attr('ogid') ) || '',
									dynamicData   : dynamicData || '',
									title         : title || '',
									url           : $(a).attr('dataurl') || '',
									type          : 'path',
									opacity       : 1,
									matrix        : '',
									path          : d,
									strokeStyle   : strokeWidth,
									fillStyle     : fill,
									lineWidth     : strokeWidth ? Number($(a).attr('stroke-width')) : 2,
									rotate        : rotate,
									visible       : true,
									locked        : $(a).attr('locked') ? true : false,
									getPathSegs   : function(){
										var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
										$(p).attr('d',this.path);
										return p.pathSegList;
									},
									getPath       : function(){
										var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
										$(p).attr('d',this.path);
										return p;
									}
								}
							break;
							case 'line' :
								newObject = 
								{
									id     		  : current,
									groupId       : Number( $(a).attr('ogid') ) || '',
									dynamicData   : $(a).attr('id'),
									title         : $(a).attr('otitle') || '',
									type          : 'line',
									opacity       : Number($(a).attr('opacity')) || 0,
									matrix        : matrix,
									rotate        : rotate,
									visible       : true,
									locked        : $(a).attr('locked') ? true : false,
									startX        : Number($(a).attr('x1')),
									startY		  : Number($(a).attr('y1')),
									endX		  : Number($(a).attr('x2')),
									endY		  : Number($(a).attr('y2')),
									strokeStyle   : stroke,
									fill          : fill,
									lineWidth     : Number($(a).attr('stroke-width')) || 2,
									stroke        : '#000'
								}
							break;
						}
					break;
				}
				if(found) {data.objects.push(newObject);current++;}
			});

			return data;

		},

		parseSvg : function( svg )
		{
			var data              = { objects : [], groups : [], resources : [], customTags : [] },
				current           = 0,
				PreviousMapWizard = false;

			//if($('g',svg).length) PreviousMapWizard = true;

			$('*',svg).each(function()
			{
				var found     = false,
					newObject = {},
					matrix    = '',
					rotate    = 0;

				if($(this).attr('transform')){
					transform = $(this).attr('transform');
					if(transform.search('matrix')==0) matrix = transform.replace('matrix(','').replace(')','').split(' ').join(',');
					if(transform.search('rotate')==0) rotate = Number(transform.replace('rotate(','').replace(')','').split(' ')[0]);
				}

				fill = '';
				if($(this).attr('fill-opacity') && $(this).attr('fill')) {
					c = $.parseColor($(this).attr('fill')); 
					fill = 'rgba('+c[0]+','+c[1]+','+c[2]+','+$(this).attr('fill-opacity')+')';
				}else fill = $(this).attr('fill');
				if(fill=="none") fill = "";

				if($(this).attr('stroke-opacity') && $(this).attr('stroke')) {
					c = $.parseColor($(this).attr('stroke')); 
					stroke = 'rgba('+c[0]+','+c[1]+','+c[2]+','+$(this).attr('stroke-opacity')+')';
				}else stroke = $(this).attr('stroke');

				var x = Number($(this).attr('x')),
					y = Number($(this).attr('y'));

				x=x-0.5;
				y=y-0.5;

				switch($(this).prop("tagName"))
				{
					case 'rect' :
						found = true;
						if(typeof $(this).attr('opacity') == 'undefined') $(this).attr('opacity','1');
						newObject = 
						{
							id     		  : current,
							groupId       : Number( $(this).attr('ogid') ) || '',
							dynamicData   : $(this).attr('id'),
							title         : $(this).attr('otitle') || '',
							url           : $(this).attr('dataurl') || '',
							layer  		  : 0,
							type          : 'box',
							startX 		  : x,
							startY 		  : y,
							endX   		  : x + Number($(this).attr('width')),
							endY   		  : y + Number($(this).attr('height')),
							width         : Number($(this).attr('width')),
							height        : Number($(this).attr('height')),
							rotate        : rotate,
							shadowColor   : '',
							shadowBlur    : '',
							shadowOffsetX : '',
							shadowOffsetY : '',
							visible       : true,
							locked        : $(this).attr('locked') ? true : false,
							stroke 	  	  : '',
							lineWidth     : (Number($(this).attr('stroke-width')) * 2) || 0,
							strokeStyle   : stroke,
							fill 	      : fill,
							fillStyle     : '',
							radius        : Number($(this).attr('rx')) || 0,
							opacity       : Number($(this).attr('opacity')) || 0,
							matrix        : matrix
						};
						break;
					case 'image' :
						found = true;
						newObject = 
						{
							id     		  : current,
							groupId       : Number( $(this).attr('ogid') ) || '',
							dynamicData   : $(this).attr('id'),
							title         : $(this).attr('otitle')  || '',
							url           : $(this).attr('dataurl') || '',
							layer  		  : 0,
							type          : 'box',
							src           : $(this).attr('xlink:href'),
							startX 		  : x || 0,
							startY 		  : y || 0,
							endX   		  : x + Number($(this).attr('width')),
							endY   		  : y + Number($(this).attr('height')),
							width         : Number($(this).attr('width')),
							height        : Number($(this).attr('height')),
							rotate        : rotate,
							shadowColor   : '',
							shadowBlur    : '',
							shadowOffsetX : '',
							shadowOffsetY : '',
							visible       : true,
							locked        : $(this).attr('locked') ? true : false,
							stroke 	  	  : '',
							lineWidth     : $(this).attr('stroke-width'),
							strokeStyle   : stroke,
							fill 	      : fill,
							fillStyle     : '',
							radius        : '',
							opacity       : Number($(this).attr('opacity')) || 0,
							matrix        : matrix
						};
						break;
					case 'text' :
						if($(this).attr('font-weight') && $(this).attr('font-weight') == 'bold') bold = true; else bold = false;
						if(!fill) fill = '#000';
						if(!stroke) stroke = 'rgba(0,0,0,0)';
						fontSize = Number($(this).attr('font-size'));
						if(PreviousMapWizard)
						{
							x = x - (Number($(this).attr('font-size')) * 1.5);
							y = y - Number($(this).attr('font-size'));
						}else{
							x = x;
							y = y - (fontSize - (fontSize / 10)); // comp from system/file.js
						}
						found = true;
						newObject = 
						{
							id     		  : current,
							groupId       : Number( $(this).attr('ogid') ) || '',
							dynamicData   : $(this).attr('id'),
							title         : $(this).attr('otitle')  || '',
							url           : $(this).attr('dataurl') || '',
							layer  		  : 0,
							type          : 'text',
							startX 		  : x,
							startY 		  : y,
							endX   		  : 0,
							endY   		  : 0,
							width         : 0,
							height        : 0,
							rotate        : rotate,
							shadowColor   : '',
							shadowBlur    : '',
							shadowOffsetX : '',
							shadowOffsetY : '',
							visible       : true,
							locked        : $(this).attr('locked') ? true : false,
							lineWidth     : Number($(this).attr('stroke-width')) || 0,
							strokeStyle   : stroke,
							fillStyle     : fill,
							radius        : '',
							text 		  : $(this).text(),
							font          : $(this).attr('font-family'),
							fontSize      : fontSize,
							lineHeight    : '',
							isItalic      : '',
							isBold        : bold,
							stroke        : '',
							opacity       : Number($(this).attr('opacity')) || 0,
							matrix        : matrix
						};
						break;
					case 'path' :
						found = true;
						if(stroke && !$(this).attr('stroke-width')) lineWidth = 1;
						else if(stroke && $(this).attr('stroke-width')) lineWidth = Number($(this).attr('stroke-width'));
						if(!$(this).attr('d')) found = false;
						newObject = 
						{
							id     		  : current,
							groupId       : Number( $(this).attr('ogid') ) || '',
							dynamicData   : $(this).attr('id'),
							title         : $(this).attr('otitle')  || '',
							url           : $(this).attr('dataurl') || '',
							type          : 'path',
							opacity       : Number($(this).attr('opacity')) || 0,
							matrix        : matrix,
							path          : $(this).attr('d'),
							strokeStyle   : stroke,
							fillStyle     : fill,
							lineWidth     : $(this).attr('stroke-width') ? Number($(this).attr('stroke-width')) : 2,
							rotate        : rotate,
							visible       : true,
							locked        : $(this).attr('locked') ? true : false,
							getPathSegs   : function(){
								var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
								$(p).attr('d',this.path);
								return p.pathSegList;
							},
							getPath       : function(){
								var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
								$(p).attr('d',this.path);
								return p;
							}
						}
						break;
					case 'ellipse' :
						found = true;
						newObject = 
						{
							id     		  : current,
							groupId       : Number( $(this).attr('ogid') ) || '',
							dynamicData   : $(this).attr('id'),
							title         : $(this).attr('otitle')  || '',
							url           : $(this).attr('dataurl') || '',
							type          : 'ellipse',
							opacity       : Number($(this).attr('opacity')) || 0,
							matrix        : matrix,
							rotate        : rotate,
							visible       : true,
							locked        : $(this).attr('locked') ? true : false,
							drawByCenter  : true,
							ry            : Number($(this).attr('ry')) * 2,
							rx			  : Number($(this).attr('rx')) * 2,
							cy			  : Number($(this).attr('cy')),
							cx			  : Number($(this).attr('cx')),
							strokeStyle   : stroke,
							fillStyle     : fill,
							lineWidth     : Number($(this).attr('stroke-width')),
							stroke        : '#000'
						}
						break;
					case 'line' :
						found = true;
						newObject = 
						{
							id     		  : current,
							groupId       : Number( $(this).attr('ogid') ) || '',
							dynamicData   : $(this).attr('id'),
							title         : $(this).attr('otitle') || '',
							type          : 'line',
							opacity       : Number($(this).attr('opacity')) || 0,
							matrix        : matrix,
							rotate        : rotate,
							visible       : true,
							locked        : $(this).attr('locked') ? true : false,
							startX        : Number($(this).attr('x1')),
							startY		  : Number($(this).attr('y1')),
							endX		  : Number($(this).attr('x2')),
							endY		  : Number($(this).attr('y2')),
							strokeStyle   : stroke,
							fill          : fill,
							lineWidth     : Number($(this).attr('stroke-width')) || 2,
							stroke        : '#000'
						}
						break;
					case 'circle' :
						found = true;
						newObject = 
						{
							id     		  : current,
							groupId       : Number( $(this).attr('ogid') ) || '',
							dynamicData   : $(this).attr('id'),
							title         : $(this).attr('otitle')  || '',
							url           : $(this).attr('dataurl') || '',
							type          : 'circle',
							opacity       : Number($(this).attr('opacity')) || 0,
							matrix        : matrix,
							rotate        : rotate,
							visible       : true,
							locked        : $(this).attr('locked') ? true : false,
							drawByCenter  : true,
							r             : Number($(this).attr('r')),
							cy			  : Number($(this).attr('cy')),
							cx			  : Number($(this).attr('cx')),
							startX        : Number($(this).attr('cx')) - Number($(this).attr('r')),
							startY        : Number($(this).attr('cy')) - Number($(this).attr('r')),
							endX          : Number($(this).attr('cx')) + Number($(this).attr('r')),
							endY          : Number($(this).attr('cy')) + Number($(this).attr('r')),
							width         : Number($(this).attr('r')) * 2,
							height        : Number($(this).attr('r')) * 2,
							strokeStyle   : stroke,
							fill          : fill,
							lineWidth     : Number($(this).attr('stroke-width')),
							stroke        : '#000'
						}
						break;
				}
				if(found) {data.objects.push(newObject);current++;}
			});

			$('g',svg).each(function(){
				data.groups.push({
					id 		  : Number($(this).attr('gid')),
					collapsed : $(this).attr('gcollapsed') == 'true' ? true : false,
					locked 	  : $(this).attr('glocked')    == 'true' ? true : false,
					title     : $(this).attr('gtitle'),
					visible   : $(this).attr('gvisible')   == 'true' ? true : false,
					groupId   : $(this).attr('groupid')    == 'undefined' ? undefined : Number($(this).attr('groupid'))
				})
			});

			$('customtags *').each(function(){ data.customTags.push(JSON.parse(unescape($(this).attr('data')))) });

			return data;
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