
$.extend( true, designer, {
	
	init : function( data )
	{
		console.log('Designer', data);

		for(var i in this.defaults) this[i] = this.defaults[i];

		this.context( this );

		$('.stage').empty();
		$('.stage').append('<canvas id="canvas"></canvas>');
		$('.stage').append('<canvas id="gridCanvas"></canvas>');
		$('.stage').append('<canvas id="helperCanvas" class="hidden"></canvas>');

		if(this.debug) $('.debugger').show();

		this.name   = data.name;
		this.width  = data.width;
		this.height = data.height;

		$('#canvas, #gridCanvas, #helperCanvas').attr( 'width',  this.width );
		$('#canvas, #gridCanvas, #helperCanvas').attr( 'height', this.height );

		this.helpers.positionCanvas( this.width, this.height );

		$('.stage').show();

		this.canvas = document.getElementById("canvas");
		this.ctx    = this.canvas.getContext("2d");

		this.ctx.imageSmoothingEnabled = false

		this.gridCanvas = document.getElementById("gridCanvas");
		this.gridCtx    = this.gridCanvas.getContext("2d");

		this.helperCanvas = document.getElementById("helperCanvas");
		this.helperCtx    = this.helperCanvas.getContext("2d");

		this.menu.init();
		this.ui.tools.init();
		this.ui.toolbars.init();
		this.ui.toolboxes.init();
		this.ui.sidebars.init();

		this.file.init();
		this.events.init();

		this.draw.grid();
		this.render();

		this.reset();

		if(data.data)
		{
			d = data.data;
			if(typeof d != 'object') d = JSON.parse(data.data);
			this.objects    = d.objects;
			this.groups     = d.groups;
			this.resources  = d.resources;
			this.customTags = d.customTags;
			this.current    = this.helpers.getLastId() + 1;
			this.redraw();
		}

		this.spectrum('color1');
		this.spectrum('color2');
		this.spectrum('toolbar .fill');
		this.spectrum('toolbar .strokeStyle');
		this.spectrum('toolbar .fillStyle');
		this.spectrum('shadowColor');

		if(data.modules) for(i in data.modules) this.load( data.modules[i] );

		this.onLoad();

		$('.resources').hide();

	},

	context : function( item )
	{
		// create parent context for all child objects
		for(var i in item) if(item[i] && Object.prototype.toString.call(item[i]).search('Object') != -1) 
		{
			if(i == 'clipboard') continue;
			if(i != 'parent' && i != 'root') this.context( item[i] );
			item[i].parent = item;
			item[i].root   = this;
		}
	},

	spectrum : function( el ){

		var s = $.proxy(function( color ){
			if(!this.selecteds.length) return;
	    	str = color ? color.toRgbString() : ""; 
	    	this.selecteds[0][el] = str;
	    	$("."+el).val( str );
	    	this.render();
		},this);

		var c = $.proxy(function( color ){
			str = color ? color.toRgbString() : "";
			this[el] = str; 
			$("."+el).val( str );
			this.render();
		},this);

		if(el == 'color1' || el == 'color2'){

			$("." + el).spectrum({
			    allowEmpty : true,
			    showAlpha  : true,
			    showInput  : true,
			    move   : function( color ){ c( color ) },
			    change : function( color ){ c( color ) }
			}).on("dragstart.spectrum", $.proxy(function(e, color) {
				this.history.save();
			},this));

		}else{

			$("." + el).spectrum({
			    allowEmpty : true,
			    showAlpha  : true,
			    showInput  : true,
			    move   : function( color ){ s( color ) },
			    change : function( color ){ s( color ) }
			}).on("dragstart.spectrum", $.proxy(function(e, color) {
				this.history.save();
			},this));

		}		

	},

	reset : function(){
		this.objects   = [];
		this.selecteds = [];
		this.resources = [];
		this.current   = 0;
		this.render();
		this.draw.ui();
		this.draw.toolbar();
	},

	load : function( module ){

		$("<link/>", {
		   rel: "stylesheet",
		   type: "text/css",
		   href: "modules/"+module+".css"
		}).appendTo("head");

		$.ajax({
			url      : "modules/"+module+".js",
			dataType : 'script',
			async    : false
		});

	},
	
	include : function( url ){$.ajax({url:url,dataType:'script',async:false });},
	getHtml : function( url ){var res;$.ajax({url:url,async:false,success : function(html){res = html;}});return res;},

	getToolbox : function( toolboxName ){
		for(i in this.toolboxes) {t=this.toolboxes[i];if(t.name==toolboxName) return t}
	},

	where : function( q ){
		q = q.split('=');
		r = [];
		for(i in this.objects) if(this.objects[i][q[0]] && this.objects[i][q[0]] == q[1]) r.push(this.objects[i]);
		return r;
	},

	log : function(){
		console.log( this.selecteds[0] );
	}
})