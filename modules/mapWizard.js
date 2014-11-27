//@ sourceURL=mapWizard.js

// use mapWizard.setupDesigner to modify designer code

console.log('mapWizard');

mapWizard = {

	maps : null,

	meters : [
		{
			target   : 'var_11772_4352_1_1_1_2',
			min      : 229,
			max      : 237,
			offColor : 'rgb(0, 0, 0)',
			onColor  : 'rgb(0, 204, 11)',
			levels   : 10
		},
		{
			target   : 'var_11772_268_1_6_1_2',
			min      : 0.79,
			max      : 5.11,
			offColor : 'rgb(0, 0, 0)',
			onColor  : 'rgb(0, 204, 11)',
			levels   : 10
		}
	],

	init : function(){

		document.title = getString('MapWizard');

		this.setupUi();
		this.setupDesigner();

		this.load();
		this.firstMenu();

	},

	load : function(){},

	parseData : function(){

		elements = [];
		links    = [];

		objects = $.extend(true,{},designer.objects);

	    var elements = [],
	    	links    = [];

	    for(i in objects)
	    {
	    	o = objects[i];
	    	if(o.dynamicData) str = o.dynamicData;
	    	else continue;
	    	if(str.search('var') != -1){
	    		elements.push({
	    			mapVariableName : str,
		            unit            : str.split('_')[0],
		            deviceid        : str.split('_')[1],
		            paramId         : str.split('_')[2],
		            groupId         : str.split('_')[3],
		            orderno         : str.split('_')[4],
		            phase           : str.split('_')[5]
	    		});
	    	}
	    	if(str.search('btn') != -1){
	    		links.push({
	    			mapVariableName : str,
		            linkid			: str.split('_')[1],
		            linktype		: str.split('_')[2],
		            pageid			: str.split('_')[3]
	    		});
	    	}
	    }

		return {
			elements : JSON.stringify( elements ),
			links    : JSON.stringify( links )
		}

	},

	save : function(){

		designer.ui.indicator.show( getString('Saving')+'...' );
		objects = $.extend(true,{},designer.objects);

		svg = designer.file.getSvg({objects:objects});

		// if(this.meters.length){

		// 	for(i in this.meters){
		// 		m = this.meters[i];
		// 		svg += '<meter id="'+(Number(i)+1)+'" target="'+m.target+'" offcolor="'+m.offColor+'" oncolor="'+m.onColor+'" levels="'+m.levels+'" min="'+m.min+'" max="'+m.max+'" style="display:none;" />';
		// 	}

		// }

		if(!this.mapId){

			data = this.parseData();

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
				svg      : svg,
				elements : data.elements,
				links    : data.links
			});

		}else{

		    data = this.parseData();

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
				svg      : svg,
				elements : data.elements,
				links    : data.links
			});

		}

	},

	firstMenu : function(){

		this.hideOnInit();

		$('.mapWizardMenu,.mapWizardDummy').remove();
		$('.stage').append('<div class="mapWizardMenu"></div>');
		$('.mapWizardMenu').append('<div class="mapWizardMenuTitle">'+getString('MapWizard')+'</div>');
		$('.mapWizardMenu').append('<div class="mapWizardMenuItem createMap clickable">'+getString('CreateNewMap')+'</div>');
		$('.mapWizardMenu').append('<div class="mapWizardMenuItem loadMap clickable">'+getString('LoadMap')+'</div>');
		$('.mapWizardMenu').append('<div class="mapWizardMenuItem exit clickable">'+getString('Exit')+'</div>');

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
						$('.closeDesigner').click(function(){
							location.reload();
						});
						$('.previewSvg').click($.proxy(this.previewSvg,this));

						$('.bottomMenu').show();
						$('.tools').show();

						this.api('getDevices',function( d ){
							if(!d) return;
							d = JSON.parse(d.d);
							this.devices = d;
						});

						//todo:uncomment
						//window.onbeforeunload = function() { return getString('unsavedData'); };

						mapWizard.title = title;

						designer.reset();
						designer.init({
							name    : title,
						    width   : Number(w),
							height  : Number(h)
						});

						window.scrollTo(0,0);
						a = $(window).height();
						b = a - 47;
						window.$('html').css('height',b+'px').css('overflow','hidden');

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
					if($('#maps').val() == "0") return;
					this.api('GetMapCode',$.proxy(function( data ){
						var map = JSON.parse(data.d);
						//debugger;
						if(map.Code){
							$('.mapPreviewCanvas').html(map.Code);
							w = Number($('.mapPreviewCanvas svg').width());
							zoom = 670 / w;
							$('.mapPreviewCanvas svg').attr('style', 'zoom:'+zoom+' ;-moz-transform:scale('+zoom+')');
							$('.loadMapAction').removeClass('disabled').unbind('click').bind('click',$.proxy(function(){

								this.mapId = Number($('#maps').val());
								title      = $('#maps option[value='+$('#maps').val()+']').html();
								svg        = $('.mapPreviewCanvas').html();
								w          = Number($(svg).attr('width').replace('px',''));
								h          = Number($(svg).attr('height').replace('px',''));

								$('.resources').css('left','0px').css('top','620px').show();
								$('.objects').css('left','0px').show();
								$('.closeDesignerWrapper').show();

								$('.saveMap').click($.proxy(this.save,this));
								$('.closeDesigner').click(function(){
									location.reload();
								});
								$('.previewSvg').click($.proxy(this.previewSvg,this));

								$('.bottomMenu').show();
								$('.tools').show();

								this.api('getDevices',function( d ){
									if(!d) return;
									d = JSON.parse(d.d);
									this.devices = d;
								});

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

								window.scrollTo(0,0);
								a = $(window).height();
								b = a - 47;
								window.$('html').css('height',b+'px').css('overflow','hidden');

							},this))
						}
					}),{
						mapId : Number($('#maps').val())
					})
				},this));

			});

		},this));

		//exit

		$('.exit').click(function(){

			window.location = '../../eXpertpower/Dashboard/default.aspx';

		});

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

		//if($('g',svg).length) PreviousMapWizard = true;

		$('*',svg).each(function()
		{
			var found     = false,
				newObject = {},
				matrix    = '',
				rotate    = 0;

			//debugger;

			if($(this).attr('transform')){
				transform = $(this).attr('transform');
				//debugger;
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
						groupId       : Number( $(this).attr('ogid') ) || '',
						dynamicData   : $(this).attr('id'),
						title         : $(this).attr('otitle') || '',
						url           : $(this).attr('dataurl') || '',
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
						strokeStyle   : stroke,
						fillStyle     : fill,
						height        : '',
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

		data.groups = [];

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

		return data;
	},

	hideOnInit : function(){

		$('.tools, .toolbox, #new, #save, #load, .stage canvas, #group, #ungroup').hide();

	},

	setupUi : function(){

		$('.tools').css('height','389px');

		if( $('body').hasClass('ltr') )
		{
			$('.resources').css('left','0px');
			$('.objects').css('left','0px');
			$('.objects').css('top','467px');
		}
		else
		{
			$('.resources').css('left','0px');
			$('.objects').css('left','0px');
		}

		this.hideOnInit();

		// setup toolboxes, menus etc.

		designer.onLoad = function(){

			// combo

			$('.tools .combo').remove();
			$('.tools .text').after('<div class="button combo" id="combo"></div>');

			if(!$('.toolbar.combo').length) $('.toolbar:last').after('<div class="toolbar combo hidden"><div class="item">Params Box</div><div class="sep"></div><div class="item">Click to add new parameters box</div><div class="clear"></div></div>');

			designer.actions.combo = {};

			designer.actions.combo.mouseDown = function(){

				this.parent.history.save();
				
				x = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseX );
				y = this.parent.helpers.getClosestSnapCoords( this.parent.events.mouseY );

				howMany = 3; w = 140; h = 30;

				for(i=0;i<=howMany-1;i++)
				{
					this.parent.create.box(x,y+(h*i),w,h,{color1: "grey",color2:"rgba(0,0,0,0)",dontSnap : true});
					this.parent.create.text((x+7),y+(h*i)+5,{color1: "black",text:"Param #"+String(i+1),font:'arial',fontSize:20,dontSnap : true});
				}
				this.parent.redraw();

			};
			designer.actions.combo.mouseMove = function(){

			};
			designer.actions.combo.mouseUp = function(){

			};

			designer.events.addToolsEvents();

			// shapes

			$('.tools .shape').remove();

			$('.tools .text').after('<div class="button shape" id="shape"><svg class="shapeButton" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><svg viewBox="-15 -15 330 330"><path fill="none" stroke="#000000" stroke-width="20" d="m7.454795,178.082489l67.605378,0m-67.605378,-54.850876l67.605393,0.000015m-0.155602,-30.065033l0,113.750015c194.70015,10.208389 199.234482,-124.687454 0,-113.750015zm217.618942,56.662766l-70.312149,0m-221.397258,-29.817062l6.68369,0l0,6.683685l-6.68369,0l0,-6.683685zm-0.314375,54.532364l6.68369,0l0,6.683685l-6.68369,0l0,-6.683685zm291.95109,-27.976547l6.683685,0l0,6.683685l-6.683685,0l0,-6.683685z"></path></svg></svg></div>');
			$('.tools #shape').unbind('click').bind('click', function( e ){
				$('.tools .button').removeClass('active');
				$('.listOfShapes').toggle();
				$(e.target).addClass('active');
				designer.events.exitEditMode();
				designer.events.endCreatePath();
				designer.action = 'path';
				designer.render();
				designer.draw.ui();
				designer.draw.toolbar();
				designer.onToolChange();
			} );

			shapes = [
				{title : 'Capacitor',    data : 'm292.103577,149.999374l-117.073944,-0.445328m-167.175035,0.445328l116.628588,0m0.44532,-72.035179l11.364601,0l0,144.640358l-11.364601,0l0,-144.640358zm38.244209,-0.569977l11.364594,0l0,144.640297l-11.364594,0l0,-144.640297zm-162.171733,68.98156l6.905184,0l0,6.905212l-6.905184,0l0,-6.905212zm291.101741,0.325241l6.905182,0l0,6.905212l-6.905182,0l0,-6.905212z'},
				{title : 'Diode',        data : 'm180.228439,90.39769l21.70816,0l0,117.211075l-21.70816,0l0,-117.211075zm23.345947,59.602753l88.556381,0m-284.3409,-1.995804l85.541058,0l0,-65.011185l87.251961,66.722031l-87.250778,67.291931l0,-68.720001m-92.331572,-3.917542l6.811423,0l0,6.811447l-6.811423,0l0,-6.811447zm291.20439,2.03891l6.811401,0l0,6.811462l-6.811401,0l0,-6.811462z'},
				{title : 'Gate',         data : 'm7.454795,178.082489l67.605378,0m-67.605378,-54.850876l67.605393,0.000015m-0.155602,-30.065033l0,113.750015c194.70015,10.208389 199.234482,-124.687454 0,-113.750015zm217.618942,56.662766l-70.312149,0m-221.397258,-29.817062l6.68369,0l0,6.683685l-6.68369,0l0,-6.683685zm-0.314375,54.532364l6.68369,0l0,6.683685l-6.68369,0l0,-6.683685zm291.95109,-27.976547l6.683685,0l0,6.683685l-6.683685,0l0,-6.683685z'},
				{title : 'Inverter',     data : 'm292.351624,149.998962l-70.506393,0m-0.189026,0a19.883057,19.883057 0 1 1-39.766113,0a19.883057,19.883057 0 1 139.766113,0zm-213.972072,2.405243l69.321826,0l0,-61.05407l101.250404,58.4571l-101.19664,58.840652l0,-56.176727m-76.061115,-3.699677l6.780182,0l0,6.779526l-6.780182,0l0,-6.779526zm291.428455,-2.135864l6.780518,0l0,6.780548l-6.780518,0l0,-6.780548z'},
				{title : 'Nand',         data : 'm8.042537,173.038879l60.699101,-0.672531m-60.699101,-49.879471l61.371335,0m-0.785973,-24.868042l0,104.835098c179.441437,9.408417 183.619827,-114.915443 0,-104.835098zm223.921448,50.643158l-64.591507,0m0.637238,0a11.937837,11.937837 0 1 1-23.87648,0a11.937837,11.937837 0 1 123.87648,0zm-227.445681,-29.373505l6.739111,0l0,6.739143l-6.739111,0l0,-6.739143zm-0.150617,50.613495l6.73911,0l0,6.739151l-6.73911,0l0,-6.739151zm291.47287,-24.654327l6.739105,0l0,6.739151l-6.739105,0l0,-6.739151z'},
				{title : 'Gate nor',     data : 'm292.610077,150.214462l-69.483139,-0.215668m0.147217,0.215668a12.942393,12.942393 0 1 1-25.884689,0a12.942393,12.942393 0 1 125.884689,0zm-215.590108,29.264374l63.620397,0m-63.620397,-54.805801l65.561368,-0.431335m-20.75433,-33.139984c129.343479,0 143.580387,58.405624 143.580387,58.405624l-0.347778,0c-18.514755,69.097885 -143.580379,58.057999 -143.580379,58.057999c59.7962,-58.405655 0.347775,-116.463623 0.347775,-116.463623zm-51.490408,30.117874l6.644974,0l0,6.645012l-6.644974,0l0,-6.645012zm0.003831,54.852463l6.644983,0l0,6.64502l-6.644983,0l0,-6.64502zm291.530706,-29.571609l6.644989,0l0,6.64502l-6.644989,0l0,-6.64502z'},
				{title : 'Gate or',      data : 'm7.681484,183.57515l71.7616,0m-71.7616,-60.67144l73.093784,-0.000015m-23.092442,-37.784157c143.186604,0 158.947315,64.65654 158.947315,64.65654l75.817307,0l-76.202316,0c-20.49614,76.493118 -158.94717,64.271667 -158.94717,64.271667c66.195942,-64.656525 0.385136,-128.928207 0.385136,-128.928207zm-56.684011,33.939781l6.677925,0l0,6.677956l-6.677925,0l0,-6.677956zm291.510831,27.410866l6.677948,0l0,6.677948l-6.677948,0l0,-6.677948zm-291.404498,33.607208l6.677927,0l0,6.677917l-6.677927,0l0,-6.677917z'},
				{title : 'Gate xor',     data : 'm80.450493,91.498093c129.22271,0 143.446312,58.351089 143.446312,58.351089l68.423569,0l-68.770889,0c-18.497391,69.033295 -143.446304,58.003708 -143.446304,58.003708c59.740372,-58.351089 0.347511,-116.354797 0.347511,-116.354797zm-22.576313,4.515259c43.415966,54.530457 0,108.018921 0,108.018921m-50.015199,-26.867355l63.560987,0m-63.560987,-54.7547l63.560987,0m-70.418914,-3.722206l6.82584,0l0,6.825867l-6.82584,0l0,-6.825867zm0.057968,54.832268l6.825839,0l0,6.825867l-6.825839,0l0,-6.825867zm291.170364,-27.096024l6.825836,0l0,6.825867l-6.825836,0l0,-6.825867z'},
				{title : 'Inductor',     data : 'm7.783882,182.663147l59.679306,0c0,0 -30.829735,-67.744125 15.054253,-68.81945c42.462807,-0.995041 37.635605,69.357201 24.194321,69.357201c-13.441284,0 -12.903625,-68.81955 22.043701,-68.81955c34.947357,0 40.323868,68.819366 20.968399,68.819366c-19.355423,0 -11.828323,-68.819366 22.58139,-68.819366c34.409683,0 41.399155,68.81955 19.893112,68.81955c-21.506073,0 -9.67775,-68.81955 24.19429,-68.81955c33.87207,0 29.570831,68.819366 18.280151,68.819366c-11.290665,0 57.528732,-0.537659 57.528732,-0.537659m-291.202282,-3.571106l6.772959,0l0,6.772995l-6.772959,0l0,-6.772995zm291.221844,0.301132l6.772949,0l0,6.772995l-6.772949,0l0,-6.772995z'},
				{title : 'Junction 1',   data : 'm0.99971,146.64024l6.71786,0l0,6.7179l-6.71786,0l0,-6.7179zm7.44043,3.36145l283.11684,0m0.72388,-3.35979l6.71786,0l0,6.7179l-6.71786,0l0,-6.7179zm-145.6413,152.35712l0,-6.71786l6.7179,0l0,6.71786l-6.7179,0zm3.36145,-7.44043l0,-283.11688m-3.35944,-0.72348l0,-6.71786l6.71793,0l0,6.71786l-6.71793,0z'},
				{title : 'Junction 2',   data : 'm0.99971,146.64024l6.71786,0l0,6.7179l-6.71786,0l0,-6.7179zm7.44043,3.36145l121.77922,0c0,-29.3896 38.77921,-31.3896 38.77921,0l122.55841,0m0.72391,-3.35979l6.71783,0l0,6.7179l-6.71783,0l0,-6.7179zm-145.6413,152.35712l0,-6.71786l6.7179,0l0,6.71786l-6.7179,0zm3.36145,-7.44043l0,-283.11688m-3.35945,-0.72348l0,-6.71786l6.71794,0l0,6.71786l-6.71794,0z'},
				{title : 'Junction 3',   data : 'm143.58945,150.00009c0,-3.49425 2.83032,-6.32455 6.32455,-6.32455c3.49423,0 6.32455,2.83031 6.32455,6.32455c0,3.49423 -2.83032,6.32455 -6.32455,6.32455c-3.49423,0 -6.32455,-2.83032 -6.32455,-6.32455zm-142.59006,-3.35985l6.71783,0l0,6.7179l-6.71783,0l0,-6.7179zm7.44043,3.36145l283.11682,0m0.72394,-3.35979l6.71783,0l0,6.7179l-6.71783,0l0,-6.7179zm-145.6413,152.35712l0,-6.71786l6.7179,0l0,6.71786l-6.7179,0zm3.36145,-7.44043l0,-283.11688m-3.35947,-0.72348l0,-6.71786l6.71796,0l0,6.71786l-6.71796,0z'},
				{title : 'Junction Tee', data : 'm149.914,143.67554zm-148.91461,2.96471l6.71783,0l0,6.7179l-6.71783,0l0,-6.7179zm7.44043,3.36145l283.11682,0m0.72394,-3.35979l6.71783,0l0,6.7179l-6.71783,0l0,-6.7179zm-141.61324,2.91669l-0.66661,-141.11688m-3.35947,-0.72348l0,-6.71786l6.71796,0l0,6.71786l-6.71796,0z'},
				{title : 'Resistor',     data : 'm7.868202,151.620193l82.343018,0l11.393402,-32.392784l18.643684,62.356071l20.71521,-63.165901l18.12587,62.356071l19.679459,-61.546242l19.679443,61.951149l10.875488,-30.368195l82.860886,0m-291.18655,-2.813812l6.844604,0l0,6.844635l-6.844604,0l0,-6.844635zm291.194058,-0.465622l6.844604,0l0,6.844635l-6.844604,0l0,-6.844635z'},
				{title : 'Source AC',    data : 'm7.841724,149.837311l67.250737,0m149.928139,0.389923l67.250793,0m-67.653702,-0.227753a74.615135,74.615135 0 1 1-149.230286,0a74.615135,74.615135 0 1 1149.230286,0zm-126.528297,-1.996506c49.250984,-78.535637 61.230949,87.853104 103.826454,2.662094m-200.917796,-4.522659l6.717863,0l0,6.717896l-6.717863,0l0,-6.717896zm291.36706,0.642181l6.717865,0l0,6.717896l-6.717865,0l0,-6.717896z'},
				{title : 'Source DC',    data : 'm221.862747,94.98175l0,31.813873m-21.510544,-15.906944l43.020996,0m48.613678,39.407722l-121.593582,0m-162.447085,0l115.809275,0m1.040596,-37.757935l7.284134,0l0,75.963058l-7.284134,0l0,-75.963058zm37.461227,-41.623596l7.284134,0l0,158.169647l-7.284134,0l0,-158.169647zm-161.255614,75.613235l6.954941,0l0,6.954971l-6.954941,0l0,-6.954971zm291.012953,0.175003l6.954956,0l0,6.954971l-6.954956,0l0,-6.954971z'},
				{title : 'Speaker',      data : 'm21.35352,187l77,0m-83.70878,3.11937l0,-6.71786l6.71793,0l0,6.71786l-6.71793,0zm6.70878,-76.11937l77,0m-83.70878,3.11937l0,-6.71786l6.71793,0l0,6.71786l-6.71793,0zm155.70878,-32.61937l115,-83l0,296.5l-115,-82.5l0,-131zm-70.99999,0l70.99999,0l0,131l-70.99999,0l0,-131z'},
				{title : 'Circles',		 data : 'm200,150m -100, 0 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0zm -100, 0 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0'},
				{title : 'CirclesUpDown',data : 'm150,100m -100, 0 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0zm 0, 100 a 100,100 0 1,1 200,0 a 100,100 0 1,1 -200,0'}
			];

			$('.shapeItem').unbind('click').bind('click',function( e ){
				designer.selectedShape = Number( $(e.target).attr('shapeid') );
				$('.selectedShape').empty();
				$('.selectedShape').append('<svg xmlns="http://www.w3.org/2000/svg" viewbox="-15 -15 330 330"><path d="'+designer.shapes[designer.selectedShape].data+'" /></svg>');
				$('.tools #shape').empty();
				$('.tools #shape').append('<svg class="shapeButton" xmlns="http://www.w3.org/2000/svg" width="24" height="24"><svg viewbox="-15 -15 330 330"><path stroke="#000" fill="none" stroke-width="20" d="'+designer.shapes[designer.selectedShape].data+'" /></svg></svg>');
				$('.listOfShapes').hide();
			});

			for(i in shapes) designer.shapes.push(shapes[i]);

			designer.selectedShape = 25;


			// devices

			$('.tools .device').remove();
			$('.tools .text').after('<div class="button device" id="device"></div>');

			devices = [
				{"name":"AX8","src":"modules/devices/AX-8_Reflect.png"},
				{"name":"BFM136","src":"modules/devices/BFM136.png"},
				{"name":"C191HM","src":"modules/devices/C191HM.png"},
				{"name":"EDL175","src":"modules/devices/EDL175.png"},
				{"name":"EM132","src":"modules/devices/EM132.png"},
				{"name":"EM133","src":"modules/devices/EM133.png"},
				{"name":"EM720","src":"modules/devices/EM720.png"},
				{"name":"EM920","src":"modules/devices/EM920.png"},
				{"name":"ETC2002","src":"modules/devices/ETC2002.png"},
				{"name":"FPD280","src":"modules/devices/FPD280.png"},
				{"name":"PM130PLUS","src":"modules/devices/PM130PLUS.png"},
				{"name":"PM135","src":"modules/devices/PM135.png"},
				{"name":"PM172E","src":"modules/devices/PM172E.png"},
				{"name":"PM174","src":"modules/devices/PM174.png"},
				{"name":"PM180","src":"modules/devices/PM180.png"},
				{"name":"PM296","src":"modules/devices/PM296.png"},
				{"name":"PTS175","src":"modules/devices/PTS175.png"},
				{"name":"RGM180","src":"modules/devices/RGM180.png"},
				{"name":"RSC232","src":"modules/devices/RSC232.png"}
			]

			for(i in devices) designer.resources.push(devices[i]);
			designer.getToolbox('resources').redraw();
			$('.toolbox.resources').hide();
			$('.tools #device').click(function(){ $('.toolbox.resources').toggle(); });

		}

		$('.toolbar.text .clear').remove(); // link to parameter

		$('.toolbar.text').append('<div class="sep selectParamHolder "></div>');
		$('.toolbar.text').append('<div class="item selectParamHolder "><div class="toolbarButtonB left selectParam">'+getString('SelectParameter')+'</div><div class="toolbarButtonB left makeButton">'+getString('MakeButton')+'</div><div class="selectedInteraction left"></div><div class="clear"></div></div>');

		$('.toolbar.text').append('<div class="clear"></div>');


		$('.toolbar.box .clear, .toolbar.ellipse .clear, .toolbar.path .clear').remove(); // make button

		$('.toolbar.box, .toolbar.ellipse, .toolbar.path').append('<div class="sep makeButtonHolder "></div>');
		$('.toolbar.box, .toolbar.ellipse, .toolbar.path').append('<div class="item makeButtonHolder "><div class="toolbarButtonB left makeButton">'+getString('MakeButton')+'</div><div class="selectedInteraction left"></div><div class="clear"></div></div>');

		$('.toolbar.box, .toolbar.ellipse, .toolbar.path').append('<div class="clear"></div>');

		$('.makeButton').click($.proxy(function(){

			content = $('<div class="dynamicDataContent"></div>');

			tabs = $('<div class="dynamicDataTabs"></div>');

			tab1 = $('<div class="dynamicDataTab selected" datatab="LinkToPage">'+getString('LinkToPage')+'</div>');
			tab2 = $('<div class="dynamicDataTab"          datatab="LinkToMap">'+getString('LinkToMap')+'</div>');
			tab3 = $('<div class="dynamicDataTab"          datatab="LinkToUrl">'+getString('LinkToUrl')+'</div>');

			tabContents = $('<div class="dynamicDataTabContents"></div>');

			tabContent1 = $('<div class="dynamicDataTabContent selected" datatab="LinkToPage"></div>');
			tabContent2 = $('<div class="dynamicDataTabContent"          datatab="LinkToMap"></div>');
			tabContent3 = $('<div class="dynamicDataTabContent"          datatab="LinkToUrl"></div>');

			tabContent1data1 = $('<div class="dynamicDataPar"><div class="left lastReading selected dynamicDataRadio" pagetype="2">'+getString('LastReading')+'</div><div class="left touImport dynamicDataRadio" pagetype="7">'+getString('TOUImport')+'</div><div class="clear"></div></div>');
			tabContent1data2 = $('<div class="dynamicDataPar"><div class="dynamicDataTitle">'+getString('SelectDevice')+'</div><select id="deviceId" class="dynamicDataSelect"></select></div>');

			tabContent2data1 = $('<div class="dynamicDataPar"><div class="dynamicDataTitle">'+getString('SelectMapTIt')+'</div><select id="linkToMap" class="dynamicDataSelect"></select></div>');

			tabContent3data1 = $('<div class="dynamicDataPar"><div class="dynamicDataTitle">'+getString('SelectUrl')+'</div><input id="linkToUrl" class="dynamicDataInput" /></div>');

			tabContent1.append(tabContent1data1).append(tabContent1data2);
			tabContent2.append(tabContent2data1);
			tabContent3.append(tabContent3data1);

			tabContents.append(tabContent1).append(tabContent2).append(tabContent3);

			tabs.append(tab1).append(tab2).append(tab3);

			content.append(tabs).append(tabContents);

			popup = new Popup({
				header     : getString('MakeButton'),
				closeText  : getString('Close'),
				actionText : getString('save2'),
				action     : $.proxy(function(){

					var selectedTab = $('.dynamicDataTab.selected').attr('datatab'),
						pageType    = $('.dynamicDataRadio.selected').attr('pagetype'),
						deviceId    = $('#deviceId').val(),
						mapId       = $('#linkToMap').val();

					switch(selectedTab){
						case 'LinkToPage' :
							designer.selecteds[0].url = '';
							designer.selecteds[0].dynamicData = 'btn_'+deviceId+'_1_'+pageType;
							break;
						case 'LinkToMap' :
							designer.selecteds[0].url = '';
							designer.selecteds[0].dynamicData = 'btn_'+mapId+'_2_-1';
							break;
						case 'LinkToUrl' :
							designer.selecteds[0].dynamicData = '';
							designer.selecteds[0].url = $('#linkToUrl').val();
							break;
					}
					popup.close();
				},this),
				content  : content,
				addClass : 'dynamicDataPopup',
				onLoad   : $.proxy(function()
				{

					for(i in this.devices){
						device = this.devices[i];
						$('#deviceId').append('<option value="'+device.DeviceID+'">'+device.Name+'</option>');
					}

					for(i in this.maps){
						map = this.maps[i];
						$('#linkToMap').append('<option value="'+map.MapID+'">'+map.Title+'</option>');
					}

					$('.dynamicDataTab').click(function()
					{
						$('.dynamicDataTab, .dynamicDataTabContent').removeClass('selected');
						datatab = $(this).attr('datatab');
						$(this).addClass('selected');
						$('.dynamicDataTabContent[datatab='+datatab+']').addClass('selected');
					});

					$('.dynamicDataRadio').click(function(){
						$('.dynamicDataRadio').removeClass('selected');
						$(this).addClass('selected');
					});

					if(( designer.selecteds[0].dynamicData && designer.selecteds[0].dynamicData.search('btn') != -1 ) || designer.selecteds[0].url ){

						if(designer.selecteds[0].url) 
						{
							url = designer.selecteds[0].url;
							$('.dynamicDataTab,.dynamicDataTabContent').removeClass('selected');
				            $('.dynamicDataTab[datatab=LinkToUrl],.dynamicDataTabContent[datatab=LinkToUrl]').addClass('selected');
				            $('#linkToUrl').val(url);
						}else{

							str = designer.selecteds[0].dynamicData;

							var mapVariableName = str,
				            	linkid			= str.split('_')[1],
				            	linktype		= str.split('_')[2],
				            	pageid			= str.split('_')[3];

				            if(linktype == '1'){
				            	$('.dynamicDataTab, .dynamicDataTabContent,.dynamicDataRadio').removeClass('selected');
				            	$('.dynamicDataTab[datatab=LinkToPage], .dynamicDataTabContent[datatab=LinkToPage]').addClass('selected');
				            	$('.dynamicDataRadio[pagetype='+pageid+']').addClass('selected');
				            	$('#deviceId').val(linkid);
				            }

				            if(linktype == '2'){
				            	$('.dynamicDataTab, .dynamicDataTabContent,.dynamicDataRadio').removeClass('selected');
				            	$('.dynamicDataTab[datatab=LinkToMap], .dynamicDataTabContent[datatab=LinkToMap]').addClass('selected');
				            	$('.dynamicDataRadio[pagetype='+pageid+']').addClass('selected');
				            	$('#linkToMap').val(linkid);
				            }

						}

					}

				},this)
			});

		},this));

		$('.selectParam').click($.proxy(function(){

			content = $('<div class="dynamicDataContent"></div>');

			contentData1 = $('<div class="dynamicDataPar"><div class="left pageType selected dynamicDataRadio" pagetype="2">'+getString('LastReading')+'</div><div class="left pageType dynamicDataRadio" pagetype="7">'+getString('TOUImport')+'</div><div class="clear"></div></div>');
			contentData2 = $('<div class="dynamicDataPar"><div class="dynamicDataTitle">'+getString('SelectDevice')+'</div><select id="deviceId" class="dynamicDataSelect"></select></div>');
			contentData3 = $('<div class="dynamicDataPar"><div class="dynamicDataTitle dynamicDataType">'+getString('Type')+'</div><div class="left paramType selected dynamicDataRadio" paramtype="1">'+getString('Basic')+'</div><div class="left paramType dynamicDataRadio" paramtype="2">'+getString('Energy')+'</div><div class="clear"></div></div>');
			contentData4 = $('<div class="dynamicDataPar"><div class="dynamicDataTitle">'+getString('Parameter')+'</div><select id="parameter" class="dynamicDataSelect"><option value="0">'+getString('SelectDevice')+'</option></select></div>');
			
			content.append(contentData1).append(contentData2).append(contentData3).append(contentData4);

			popup = new Popup({

				header     : getString('SelectParameter'),
				closeText  : getString('Close'),
				actionText : getString('save2'),
				action     : $.proxy(function(){

					var pageType    = $('.dynamicDataRadio.pageType.selected').attr('pagetype'),
						paramType   = $('.dynamicDataRadio.paramType.selected').attr('paramtype'),
						deviceId    = $('#deviceId').val(),
						parameterId = $('#parameter').val(),
						groupId     = $('#parameter option[value="'+parameterId+'"]').attr('groupid'),
						orderNo     = $('#parameter option[value="'+parameterId+'"]').attr('orderno'),
						phase   	= $('#parameter option[value="'+parameterId+'"]').attr('phase');

					designer.selecteds[0].dynamicData = 'var_'+deviceId+'_'+parameterId+'_'+groupId+'_'+orderNo+'_'+phase+'_'+pageType;

					if(parameterId == '0') designer.selecteds[0].dynamicData = '';

					popup.close();

				},this),
				content  : content,
				addClass : 'dynamicDataPopup',
				onLoad   : $.proxy(function(){

					this.isBasicParamsMode = true;

					for(i in this.devices){
						device = this.devices[i];
						$('#deviceId').append('<option value="'+device.DeviceID+'">'+device.Name+'</option>');
					}

					$('.dynamicDataRadio.pageType').click($.proxy(function( e ){
						$('.dynamicDataRadio.pageType').removeClass('selected');
						$(e.target).addClass('selected');
					},this));

					$('.dynamicDataRadio.paramType').click($.proxy(function( e ){
						$('.dynamicDataRadio.paramType').removeClass('selected');
						$(e.target).addClass('selected');
						this.isBasicParamsMode = $(e.target).attr('paramtype') == '1';
						this.refreshParametersInput();
					},this));

					$('#deviceId').change($.proxy(function( e ){
						deviceId = Number($(e.target).val());
						this.getParameters(deviceId);
					},this));

					if( designer.selecteds[0].dynamicData && designer.selecteds[0].dynamicData.search('var') != -1 ){

						str = designer.selecteds[0].dynamicData;

						var mapVariableName = str,
				            unit            = str.split('_')[0],
				            deviceid        = str.split('_')[1],
				            paramId         = str.split('_')[2],
				            groupId         = str.split('_')[3],
				            orderno         = str.split('_')[4],
				            phase           = str.split('_')[5],
				            pagetype        = str.split('_')[6];

				        $('.dynamicDataRadio').removeClass('selected');
				        $('.dynamicDataRadio.pageType[pagetype="'+pagetype+'"]').addClass('selected');
				        $('#deviceId').val(deviceid);

				        this.getParameters(deviceid,paramId);

					}

				},this)
			});

		},this));

		designer.onToolChange = this.onToolbarRefresh;
		designer.onMouseUp    = this.onToolbarRefresh;

		// premade templates toolbox

	},

	onToolbarRefresh : function(){

		$('.selectedInteraction').empty();

		if(designer.selecteds.length == 1) o = designer.selecteds[0];
		else return;

		if(o.dynamicData && o.dynamicData.search('btn') != -1){
			$('.selectedInteraction').html('assigned button');
		}
		else if(o.dynamicData && o.dynamicData.search('var') != -1){
			$('.selectedInteraction').html('assigned parameter');
		}
		else if(o.url){
			$('.selectedInteraction').html('assigned url');
		}

	},

	getParameters : function( deviceId, selectedParameter ){

		this.api('GetParametersForDevice',$.proxy(function( d ){
			if(!d) return; 
			d = JSON.parse(d.d);
			this.parameters = d;
			this.refreshParametersInput( selectedParameter );
		},this),{deviceId:deviceId})

	},

	refreshParametersInput : function( selectedParameter ){

		if(!this.parameters) return;

		$('#parameter').empty();

		if(selectedParameter){

			for(i in this.parameters)
			{
				p = this.parameters[i];
				if(p.ParamID == Number(selectedParameter)){
					if(!p.IsEnergyParam){
						this.isBasicParamsMode = true;
						$('.dynamicDataRadio.paramType[paramtype="1"]').addClass('selected');
					}else{
						this.isBasicParamsMode = false;
						$('.dynamicDataRadio.paramType[paramtype="2"]').addClass('selected');
					}
				}
			}
		}

		for(i in this.parameters)
		{
			var p 		 = this.parameters[i],
				selected = '';

			if(selectedParameter && Number(selectedParameter) == p.ParamID) selected = 'selected';

			if((this.isBasicParamsMode && !p.IsEnergyParam) || (!this.isBasicParamsMode && p.IsEnergyParam))
				$('#parameter').append('<option '+selected+' value="'+p.ParamID+'" groupid="'+p.GroupID+'" orderno="'+p.OrderNo+'" phase="'+p.Phase+'">'+p.ParamName+'</option>');
		}

	},

	setupDesigner : function(){

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
	//previewButton = $('<div class="previewSvg left button">'+getString('Preview')+'</div>'),
	clearDiv      = $('<div class="clear"></div>');

closeDesigner.append(saveMap);
closeDesigner.append(closeButton);
//closeDesigner.append(previewButton);
closeDesigner.append(clearDiv);

$('body').append(closeDesigner);

mapWizard.init();

//$('.saveMap').click(mapWizard.save);
//$('.closeDesigner').click(mapWizard.firstMenu);