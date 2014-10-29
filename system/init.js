
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

		this.helpers.positionCanvas();

		$('.stage').show();

		this.canvas = document.getElementById("canvas");
		this.ctx    = this.canvas.getContext("2d");

		this.gridCanvas = document.getElementById("gridCanvas");
		this.gridCtx    = this.gridCanvas.getContext("2d");

		this.helperCanvas = document.getElementById("helperCanvas");
		this.helperCtx    = this.helperCanvas.getContext("2d");

		this.menu.init();
		this.ui.tools.init();
		this.ui.toolbars.init();
		this.ui.toolboxs.init();
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
			this.objects   = d.objects;
			this.resources = d.resources;
			this.current   = this.helpers.getLastId() + 1;
			this.redraw();
		}

		this.spectrum('fill');
		this.spectrum('strokeStyle');
		this.spectrum('fillStyle');
		this.spectrum('shadowColor');

		if(data.modules) for(i in data.modules) this.load( data.modules[i] );

		this.onLoad();

	},

	context : function( item )
	{
		// create parent context for all child objects
		for(var i in item) if(item[i] && Object.prototype.toString.call(item[i]).search('Object') != -1) 
		{
			if(i == 'clipboard' ) continue;
			if(i != 'parent' && i != 'root') this.context( item[i] );
			item[i].parent = item;
			item[i].root   = this;
		}
	},

	spectrum : function( el ){

		var s = $.proxy(function( color ){
			if(!this.selecteds.length) return;
	    	str = color ? color.toRgbString() : ""; 
	    	console.log(this.selecteds[0]);
	    	this.selecteds[0][el] = str;
	    	$("."+el).val( str );
	    	this.render();
		},this);

		$("." + el).spectrum({
		    allowEmpty : true,
		    showAlpha  : true,
		    move   : function( color ){ s( color ) },
		    change : function( color ){ s( color ) }
		}).on("dragstart.spectrum", $.proxy(function(e, color) {
			this.history.save();
		},this));

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