
editor.toolbox = function( data ){ return this.init( data) }
editor.toolbox.prototype = {

	name      : "",
	title     : "",

	visible   : false,
	dockable  : true,

	left : 20,
	top  : 65,

	init : function( data ){

		for(var i in data) this[i] = data[i];

		if(!this.name) return;

		this.system.parent = this;

		this.preLoad();
		this.system.render();
		this.render();
		this.system.events();
		this.events();
		this.postLoad();

		this.el = $('.toolbox.'+this.name);
		this.el.css('right','initial');
		this.el.css('left','initial');
		this.el.css('left',this.left+'px');
		this.el.css('top',this.top+'px');

		return this;

	},

	// toolbox system events & functions

	system : {

		render : function(){
			var hidden;
			if(this.parent.visible == true) hidden = ''; else hidden = 'hidden';

			$('body').append('<div class="toolbox '+this.parent.name+' '+hidden+'"><div class="header">'+this.parent.title+'</div><div class="close">X</div><div class="body"></div></div>');
		},
		events : function(){
			$('.toolbox').draggable({ 
				start : function(){ $(this).css('right','initial'); },
				containment : "window"
			});
		}

	},

	append : function( html ){
		$('.toolbox.'+this.name+' .body').append( html );
	},

	// toolbox user events & functions

	preLoad  : function(){}, // user preLoad event
	postLoad : function(){}, // user postLoad event
	render   : function(){}, // user render event
	events   : function(){}, // user events
	refresh  : function(){}  // user refresh event

}