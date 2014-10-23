//@ sourceURL=mapWizard.js

// use mapWizard.setupDesigner to modify designer code

console.log('mapWizard');

mapWizard = {

	maps : null,

	init : function(){

		document.title = getString('MapWizard');

		this.setupUi();
		this.setupDesigner();

		this.load();
		this.firstMenu();

		$('#new,#save,#load').hide();

	},

	load : function(){},
	save : function(){

		designer.ui.indicator.show( getString('Saving')+'...' );
		objects = $.extend(true,{},designer.objects);

		//designer.file.getSvg({objects:designer.objects});

		if(!this.mapId){

			this.api('saveMap',function( d ){

				designer.ui.indicator.hide();

				if(d.d != "-1" || d.d != "-2"){
					mapWizard.mapId = Number(d.d);
					designer.ui.indicator.show( getString('SuccessfullySaved')+'!' );
					designer.ui.indicator.hide();
				}
				else if(d.d == "-1") console.log('name exists');
				else if(d.d == "-2") console.log('save error');

			},{
				mapTitle : this.title,
				svg      : designer.file.getSvg({objects:objects}),
				elements : "[]",
				links    : "[]"
			});

		}else{

			this.api('UpdateMap',function( d ){

				if(d.d)
				{
					designer.ui.indicator.hide();
					designer.ui.indicator.show( getString('SuccessfullySaved')+'!' );
					designer.ui.indicator.hide();
				}else console.log('save error');			

			},{
				mapId    : this.mapId,
				mapTitle : this.title,
				svg      : designer.file.getSvg({objects:objects}),
				elements : "[]",
				links    : "[]"
			});

		}
		
		

	},

	firstMenu : function(){

		$('.mapWizardMenu,.mapWizardDummy').remove();
		$('.stage').append('<div class="mapWizardMenu"></div>');
		$('.mapWizardMenu').append('<div class="mapWizardMenuTitle">'+getString('MapWizard')+'</div>');
		$('.mapWizardMenu').append('<div class="mapWizardMenuItem createMap clickable">'+getString('CreateNewMap')+'</div>');
		$('.mapWizardMenu').append('<div class="mapWizardMenuItem loadMap clickable">'+getString('LoadMap')+'</div>');

		//create
		$('.createMap').click($.proxy(function(){

			$('.stage').append('<div class="mapWizardDummy"></div>');

			$('.mapWizardMenuTitle').html(getString('CreateNewMap'));
			$('.mapWizardMenuItem').remove();

			$('.mapWizardMenu').append('<div class="mapWizardMenuItem">'+getString('Title')+'</div>');
			$('.mapWizardMenu').append('<div class="mapWizardMenuItem marginBottom"><div><input type="text" id="title" autocomplete="off"/></div><div><div class="validation invalid">'+getString('EnterTitle')+'</div><div class="clear"></div></div></div>');
			$('.mapWizardMenu').append('<div class="mapWizardMenuItem">'+getString('size')+'</div>');
			$('.mapWizardMenu').append('<div class="mapWizardMenuItem"><select id="mapSizes" class="marginBottom"></select></div>');
			$('.mapWizardMenu').append('<div class="mapWizardMenuItem customSize marginBottom hidden"><div class="mapWizFloat" style="float:right;"><div>'+getString('Height')+'</div><div><input type="text" id="mapHeight" /></div></div><div class="mapWizFloat" style="float:left;"><div>'+getString('Width')+'</div><div><input type="text" id="mapWidth" /></div></div><div class="clear"></div></div>');
			$('.mapWizardMenu').append('<div class="mapWizardMenuItem"><div class="mapWizardButton createMapAction disabled">'+getString('Start')+'</div><div class="mapWizardButton goBack">'+getString('Back')+'</div><div class="clear"></div></div>');

			$('#title').focus();
			$('#title').keyup(function()
			{
				valid = false;
				$('.createMapAction').addClass('disabled');
				v = $(this).val().replace(/[^\w\s]/gi, '');
				$(this).val(v);
				if(!v) {$('.validation').show();$('.validation').addClass('invalid').html(getString('EnterTitle'));}
				else if(v.length > 0 && v.length < 3) {$('.validation').show();$('.validation').addClass('invalid').html(getString('TitleTooShort'));}
				else {$('.createMapAction').removeClass('disabled');$('.validation').removeClass('invalid').hide();}
			});

			$('#mapSizes').append('<option value="640x480">640x480</option>');
			$('#mapSizes').append('<option value="800x600">800x600</option>');
			$('#mapSizes').append('<option value="1024x768" selected>1024x768</option>');
			$('#mapSizes').append('<option value="1280x800">1280x800</option>');
			$('#mapSizes').append('<option value="fullscreen">'+getString('FullScreen')+'</option>');
			$('#mapSizes').append('<option value="customize">'+getString('Customize')+'</option>');

			$('#mapWidth').val(1024);
			$('#mapHeight').val(768);

			getSize = function(){
				w = $('.mapWizardDummy').css('width').replace('px','');
				h = $('.mapWizardDummy').css('height').replace('px','');
				$('#mapWidth').val(w);
				$('#mapHeight').val(h);
			}

			$('#mapSizes').change(function(){
				var v  = $(this).val(),
					sw = $('.stage').width(),
					sh = $('.stage').height();
				$('.customSize').hide();
				$('.mapWizardDummy').show();
				if(v != "fullscreen" || v != "customize") 
				{
					var s = v.split('x'),
						w = s[0],
						h = s[1];
					$('.mapWizardDummy').css('width',w+'px').css('height',h+'px').css('margin-left',String(-Number(w/2))+'px');

				}
				if(v == "fullscreen") {
					$('.mapWizardDummy').hide()
										.css('width',sw+'px')
										.css('height',$('.stage').height()+'px').css('margin-left',String(-sw/2)+'px');
					$('#mapWidth').val($('.stage').width());
					$('#mapHeight').val($('.stage').height());
				}
				if(v == "customize"){ $('.customSize').show(); getSize(); }
			});

			$('#mapWidth').keyup(function(){
				$('.mapWizardDummy').css('width',$('#mapWidth').val()+'px');
				$('.mapWizardDummy').css('margin-left',String(-Number($('#mapWidth').val()/2))+'px');
			});

			$('#mapHeight').keyup(function(){
				$('.mapWizardDummy').css('height',$('#mapHeight').val()+'px');
			});

			$('.goBack').click($.proxy(function(){ this.firstMenu(); },this));

			$('.createMapAction').click($.proxy(function()
			{
				getSize();

				this.api('checkMapName',$.proxy(function(d){

					d = JSON.parse(d.d);

					if(!d.invalid){

						var title = $('#title').val(),
						w         = $('#mapWidth').val(),
						h         = $('#mapHeight').val();

						if($('.validation').hasClass('invalid')) {$('#title').focus();return;}

						$('.resources').css('left','0px').css('top','620px').show();
						$('.objects').css('left','0px').show();
						$('.closeDesignerWrapper').show();

						$('.saveMap').click($.proxy(this.save,this));
						$('.closeDesigner').click($.proxy(this.firstMenu,this));
						$('.previewSvg').click($.proxy(this.previewSvg,this));

						//todo:uncomment
						//window.onbeforeunload = function() { return getString('unsavedData'); };

						mapWizard.title = title;

						designer.reset();
						designer.init({
							name    : title,
						    width   : Number(w),
							height  : Number(h)
						});

					}else $('.validation').show().addClass('invalid').html(getString('MapNameExists'));

				},this),{mapName:$('#title').val()})

			},this));

		},this));

		//load
		$('.loadMap').click($.proxy(function(){

			$('.mapWizardMenuTitle').html( getString('LoadMap') );
			$('.mapWizardMenuItem').remove();
			$('.mapWizardMenu').append('<div class="mapWizardMenuItem">'+getString('Loading')+'...</div>');

			this.api('init',function(data){

				this.maps = JSON.parse(JSON.parse(data.d));

				$('.mapWizardMenuItem').remove();
				$('.mapWizardMenu').append('<div class="mapWizardMenuItem"><select id="maps"></select></div>');
				$('.mapWizardMenu').append('<div class="mapWizardMenuItem"><div class="mapPreview"></div></div>');
				$('.mapPreview').append('<div class="mapPreviewTitle">'+getString('Preview')+'</div><div class="mapPreviewCanvas"></div>');

				$('.mapWizardMenu').append('<div class="mapWizardMenuItem"><div class="mapWizardButton loadMapAction disabled">'+getString('Start')+'</div><div class="mapWizardButton goBack">'+getString('Back')+'</div><div class="clear"></div></div>');

				$('.goBack').click($.proxy(function(){ this.firstMenu(); },this));

				$('#maps').append('<option value="0">'+getString('SelectMapTIt')+'</option>');

				for(i in this.maps) $('#maps').append('<option value="'+this.maps[i].MapID+'">'+this.maps[i].Title+'</option>');

				$('#maps').change($.proxy(function(e){
					item = $(e.target);
					if(item.val() == "0") return;
					this.api('GetMapCode',$.proxy(function( data ){
						var map = JSON.parse(data.d);
						//debugger;
						if(map.Code){
							$('.mapPreviewCanvas').html(map.Code);
							w = Number($('.mapPreviewCanvas svg').width());
							$('.mapPreviewCanvas svg').css('zoom',460/w);
							$('.loadMapAction').removeClass('disabled').unbind('click').bind('click',$.proxy(function(){

								this.mapId = Number($('#maps').val());
								title = $('#maps option[value='+$('#maps').val()+']').html();
								svg = $('.mapPreviewCanvas').html();
								w = Number($(svg).attr('width').replace('px',''));
								h = Number($(svg).attr('height').replace('px',''));

								$('.resources').css('left','0px').css('top','620px').show();
								$('.objects').css('left','0px').show();
								$('.closeDesignerWrapper').show();

								$('.saveMap').click($.proxy(this.save,this));
								$('.closeDesigner').click($.proxy(this.firstMenu,this));
								$('.previewSvg').click($.proxy(this.previewSvg,this));

								//todo:uncomment
								//window.onbeforeunload = function() { return getString('unsavedData'); };

								mapWizard.title = title;

								designer.reset();
								designer.init({
									name    : title,
								    width   : w,
									height  : h,
									data    : this.parseSvg(svg)
								});

							},this))
						}
					}),{
						mapId : Number(item.val())
					})
				},this));

			});

			

		},this));

	},

	previewSvg : function(){

		var svg = designer.file.getSvg({objects:designer.objects});

		htmlPopup = new Popup({
			header    : getString('Preview')+"...",
			closeText : getString('Close'),
			content   : svg,
			addClass  : 'htmlPreview',
			onLoad    : function(){ $('#previewLang').trigger('change'); }
		});

	},

	parseSvg : function( svg ){

		var data              = { objects : [], resources : [] },
			current           = 0,
			PreviousMapWizard = false;

		if($('g',svg).length) PreviousMapWizard = true;

		$('*',svg).each(function(){

			var found     = false,
				newObject = {},
				matrix    = '',
				rotate    = 0

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

			switch($(this).prop("tagName"))
			{
				case 'rect' :
					found = true;
					if(typeof $(this).attr('opacity') == 'undefined') $(this).attr('opacity','1');
					newObject = 
					{
						id     		  : current,
						dynamicData   : $(this).attr('id'),
						layer  		  : 0,
						type          : 'box',
						startX 		  : Number($(this).attr('x')),
						startY 		  : Number($(this).attr('y')),
						endX   		  : Number($(this).attr('x')) + Number($(this).attr('width')),
						endY   		  : Number($(this).attr('y')) + Number($(this).attr('height')),
						width         : Number($(this).attr('width')),
						height        : Number($(this).attr('height')),
						rotate        : rotate,
						shadowColor   : '',
						shadowBlur    : '',
						shadowOffsetX : '',
						shadowOffsetY : '',
						visible       : true,
						locked        : false,
						stroke 	  	  : '',
						lineWidth     : (Number($(this).attr('stroke-width')) * 2) || 2,
						strokeStyle   : stroke,
						fill 	      : fill,
						fillStyle     : '',
						radius        : '',
						opacity       : Number($(this).attr('opacity')),
						matrix        : matrix
					};
					break;
				case 'image' :
					found = true;
					newObject = 
					{
						id     		  : current,
						dynamicData   : $(this).attr('id'),
						layer  		  : 0,
						type          : 'box',
						src           : $(this).attr('xlink:href'),
						startX 		  : Number($(this).attr('x')) || 0,
						startY 		  : Number($(this).attr('y')) || 0,
						endX   		  : Number($(this).attr('x')) + Number($(this).attr('width')),
						endY   		  : Number($(this).attr('y')) + Number($(this).attr('height')),
						width         : Number($(this).attr('width')),
						height        : Number($(this).attr('height')),
						rotate        : rotate,
						shadowColor   : '',
						shadowBlur    : '',
						shadowOffsetX : '',
						shadowOffsetY : '',
						visible       : true,
						locked        : false,
						stroke 	  	  : '',
						lineWidth     : $(this).attr('stroke-width'),
						strokeStyle   : stroke,
						fill 	      : fill,
						fillStyle     : '',
						radius        : '',
						opacity       : Number($(this).attr('opacity')),
						matrix        : matrix
					};
					break;
				case 'text' :
					fontSize = Number($(this).attr('font-size'));
					if(PreviousMapWizard)
					{
						x = Number($(this).attr('x')) - (Number($(this).attr('font-size')) * 1.5);
						y = Number($(this).attr('y')) - Number($(this).attr('font-size'));
					}else{
						x = Number($(this).attr('x'));
						y = Number($(this).attr('y')) - (fontSize - (fontSize / 10)); // comp from system/file.js
					}
					found = true;
					newObject = 
					{
						id     		  : current,
						dynamicData   : $(this).attr('id'),
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
						locked        : false,
						lineWidth     : Number($(this).attr('stroke-width')),
						strokeStyle   : '',
						fillStyle     : '',
						radius        : '',
						text 		  : $(this).html(),
						font          : $(this).attr('font-family'),
						fontSize      : fontSize,
						lineHeight    : '',
						isItalic      : '',
						isBold        : '',
						stroke        : '',
						strokeStyle   : stroke,
						fillStyle     : fill,
						height        : '',
						opacity       : Number($(this).attr('opacity')),
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
						dynamicData   : $(this).attr('id'),
						type          : 'path',
						opacity       : Number($(this).attr('opacity')),
						matrix        : matrix,
						path          : $(this).attr('d'),
						strokeStyle   : stroke,
						fillStyle     : fill,
						lineWidth     : $(this).attr('stroke-width') ? Number($(this).attr('stroke-width')) : 2,
						rotate        : rotate,
						visible       : true,
						locked        : false,
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
						dynamicData   : $(this).attr('id'),
						type          : 'ellipse',
						opacity       : Number($(this).attr('opacity')),
						matrix        : matrix,
						rotate        : rotate,
						visible       : true,
						locked        : false,
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
						dynamicData   : $(this).attr('id'),
						type          : 'line',
						opacity       : Number($(this).attr('opacity')),
						matrix        : matrix,
						rotate        : rotate,
						visible       : true,
						locked        : false,
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
						dynamicData   : $(this).attr('id'),
						type          : 'circle',
						opacity       : Number($(this).attr('opacity')),
						matrix        : matrix,
						rotate        : rotate,
						visible       : true,
						locked        : false,
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

		return data;
	},

	setupUi : function(){

		if( $('body').hasClass('ltr') )
		{
			$('.resources').css('left','0px').hide();
			$('.objects').css('left','0px').hide();
			$('.objects').css('top','309px').hide();
		}
		else
		{
			$('.resources').css('left','0px').hide();
			$('.objects').css('left','0px').hide();
		}

	},

	setupDesigner : function(){

		// use this to modify designer

		designer.draw.rect = function( ctx, x, y, w, h, radius, lineWidth, strokeStyle, fill, stroke, opacity ) {

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

			if(this.current.dynamicData.search('btn') != -1)
			{
				ctx.globalAlpha = 0.3;
				ctx.lineWidth   = 0;
				fill            = '#2088F1';
				stroke          = false;
			}

			if (stroke && lineWidth) ctx.stroke();
			if (fill) { ctx.fillStyle = fill; ctx.fill(); }

		}

	},

	// helpers

	api : function( action, callback, data ){

		a = {
			type        : "POST",
			contentType : "application/json; charset=utf-8",
			url         : "api/mapWizard.aspx/"+action,
			dataType    : "json",
			success     : $.proxy(callback,this)
		}

		if(data) a.data = JSON.stringify(data);

		$.ajax(a);

	}


}

var closeDesigner = $('<div class="closeDesignerWrapper hidden"></div>'),
	saveMap       = $('<div class="saveMap  left button">'+getString('save2')+'</div>'),
	closeButton   = $('<div class="closeDesigner left button">'+getString('Back')+'</div>'),
	previewButton = $('<div class="previewSvg left button">'+getString('Preview')+'</div>'),
	clearDiv      = $('<div class="clear"></div>');

closeDesigner.append(saveMap);
closeDesigner.append(closeButton);
closeDesigner.append(previewButton);
closeDesigner.append(clearDiv);

$('body').append(closeDesigner);

mapWizard.init();

//$('.saveMap').click(mapWizard.save);
//$('.closeDesigner').click(mapWizard.firstMenu);