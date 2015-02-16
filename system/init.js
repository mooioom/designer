
$.extend( true, Designer, {
	
	init : function( settings )
	{
		console.log('Designer', settings);

		for(var i in this.defaults) this[i] = this.defaults[i];

		this.helpers.init();
		this.helpers.context( this, this );

		$('.stage').empty()
				   .append('<canvas id="canvas"></canvas>')
				   .append('<canvas id="gridCanvas"></canvas>')
				   .append('<canvas id="helperCanvas" class="hidden"></canvas>');

		this.name   = settings.name;
		this.width  = settings.width;
		this.height = settings.height;

		$('#canvas, #gridCanvas, #helperCanvas').attr('width',this.width).attr('height',this.height);

		this.helpers.positionCanvas( this.width, this.height );

		$('.stage').show();

		this.canvas = document.getElementById("canvas");
		this.ctx    = this.canvas.getContext("2d");

		this.ctx.imageSmoothingEnabled = false;

		this.gridCanvas = document.getElementById("gridCanvas");
		this.gridCtx    = this.gridCanvas.getContext("2d");

		this.helperCanvas = document.getElementById("helperCanvas");
		this.helperCtx    = this.helperCanvas.getContext("2d");

		this.options = settings.options || {};

		this.ui.init();
		this.file.init();
		this.events.init();

		this.draw.grid();
		this.render();

		this.functions.reset();
		this.functions.parse( settings.data );

		this.developer.init( settings.modules );

		this.onLoad();

		$('.resources').hide();

	}
	
})