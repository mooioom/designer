
$.extend( true, editor, {
	
	init : function( data )
	{
		console.log('Editor');

		for(var i in this.defaults) this[i] = this.defaults[i];

		this.menu.init();

		$('.stage').empty();
		$('.stage').append('<canvas id="canvas"></canvas>');
		$('.stage').append('<canvas id="gridCanvas"></canvas>');

		if(this.debug) $('.debugger').show();

		this.name   = data.name;
		this.width  = data.width;
		this.height = data.height;

		$('#canvas, #gridCanvas').attr( 'width',  this.width );
		$('#canvas, #gridCanvas').attr( 'height', this.height );

		this.positionCanvas();

		$('.stage').show();

		this.canvas = document.getElementById("canvas");
		this.ctx    = this.canvas.getContext("2d");

		this.gridCanvas = document.getElementById("gridCanvas");
		this.gridCtx    = this.gridCanvas.getContext("2d");

		this.helperCanvas = document.getElementById("helperCanvas");

		this.initCanvas();
		this.events();
		this.drawGrid();
		this.render();

	},

	initCanvas : function(){

		$( "#canvas" ).droppable({
			drop: $.proxy(function( event, ui )
			{

				if(!$(event.toElement).hasClass('dropItem')) return;

				var src = event.toElement.src,
					img = new Image();
				
				img.src = src;
				w       = img.width;
				h       = img.height;

				this.getResources();

				var point    = {x:event.clientX,y:event.clientY},
				    position = this.getPositionOnCanvas( point );

				this.saveHistory();

				this.selectedObjects = [];
				this.createBox( position.x, position.y, w, h );
				this.selectedObjects[0].src = src;

				$('.tools .move').click();

				this.render();
				this.drawExternalUi();
				this.drawSubMenu();

			},this)
	    });

		this.getResources();

	},

	positionCanvas : function(){

		var stageW  = Number($('.stage').width()),
			stageH  = Number($('.stage').height()),
			marginW = (stageW - this.width) / 2,
			marginH = (stageH - this.height) / 2;

		if(marginH > 50 || marginH < 0) marginH = 50;

		$('#canvas, #gridCanvas').css('left',marginW + 'px');
		$('#canvas, #gridCanvas').css('top', marginH + 'px');

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