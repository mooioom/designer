
$.extend( true, editor, {

	debug : false,

	canvas : null,
	ctx    : null,

	current   : 0,

	objects   : [],
	resources : [],
	images    : [],
	clipboard : [],
	selecteds : [],
	temps     : [],
	temp      : null,

	action : "box", // select, move, rotate, scale, box, line, colorpick etc...

	selectAndMove : false,

	selectionBox :
	{
		startX 		: null,
		startY 		: null,
		endX   		: null,
		endY   		: null,
		lineWidth 	: 1,
		strokeStyle : '#000'
	},

	selectedBox :
	{
		lineWidth 	: 1,
		strokeStyle : 'grey',
		feather 	: 0
	},
	
	init : function( data )
	{
		console.log('Editor');

		for(var i in this.defaults) this[i] = this.defaults[i];

		this.context( this );

		$('.stage').empty();
		$('.stage').append('<canvas id="canvas"></canvas>');
		$('.stage').append('<canvas id="gridCanvas"></canvas>');

		if(this.debug) $('.debugger').show();

		this.name   = data.name;
		this.width  = data.width;
		this.height = data.height;

		$('#canvas, #gridCanvas').attr( 'width',  this.width );
		$('#canvas, #gridCanvas').attr( 'height', this.height );

		this.helpers.positionCanvas();

		$('.stage').show();

		this.canvas = document.getElementById("canvas");
		this.ctx    = this.canvas.getContext("2d");

		this.gridCanvas = document.getElementById("gridCanvas");
		this.gridCtx    = this.gridCanvas.getContext("2d");

		this.helperCanvas = document.getElementById("helperCanvas");

		this.menu.init();
		this.toolbar.init();
		this.toolbox.init();
		this.file.init();
		this.events.init();
		this.draw.grid();
		this.render();

		this.spectrum('fill');
		this.spectrum('strokeStyle');
		this.spectrum('fillStyle');
		this.spectrum('shadowColor');

	},

	context : function( item )
	{
		// create parent context for all child objects
		for(var i in item) if(item[i] && Object.prototype.toString.call(item[i]).search('Object') != -1) {
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

		$("." + el).spectrum({
		    allowEmpty : true,
		    showAlpha  : true,
		    move   : function( color ){ s( color ) },
		    change : function( color ){ s( color ) }
		}).on("dragstart.spectrum", $.proxy(function(e, color) {
			this.history.save();
		},this));

	},

	getResources : function(){

		$('.toolbox.resources .resourceItem').remove();

		for(i in this.resources)
		{
			resource     = this.resources[i];
			var template = $('#ceTemplates .resourceItem').clone();
			$('.resourceDisplay img',template).attr('src',resource.src);
			$('.resourceName',template).html(resource.name);
			$('.toolbox.resources .body').append(template);
		};
		$('.resourceItem').draggable({ revert: "invalid", revertDuration:10 });

		if(!this.resources.length) 
			$('.toolbox.resources .body').append('<div class="resourceItem noResources">' + getString('NoResources') + '</div>');

	}
})