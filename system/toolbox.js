
editor.toolbox = function( data ){ return this.init( data) }
editor.toolbox.prototype = {

	name      : "",
	title     : "",

	el 		     : "",
	template     : "",
	templateUrl  : "",

	visible   : false,
	dockable  : true,

	isDocking : false,

	left : 20,
	top  : 65,

	init : function( data ){

		this.parent = editor;

		this.parent.toolboxes.push(this);

		for(var i in data) this[i] = data[i];

		if(!this.name) return;

		this.system.parent = this;

		this.preLoad();
		this.system.render();
		if(this.templateUrl) this.system.loadTemplate();
		this.render();
		this.system.events();
		this.events();
		this.onLoad();

		this.el = $('.toolbox.'+this.name);
		this.el.css('right','initial');
		this.el.css('left','initial');
		this.el.css('left',this.left+'px');
		this.el.css('top',this.top+'px');

	},

	// toolbox system events & functions

	system : {

		render : function(){
			var hidden;
			if(this.parent.visible == true) hidden = ''; else hidden = 'hidden';
			$('body').append('<div class="toolbox '+this.parent.name+' '+hidden+'"><div class="header">'+this.parent.title+'</div><div class="close">X</div><div class="body"></div></div>');
			if(this.parent.width) $('.toolbox.'+this.parent.name).css('width',this.parent.width + 'px');
			this.parent.el = $('.toolbox.'+this.parent.name);
		},
		events : function(){
			$('.toolbox.'+this.parent.name).draggable({ 
				start : function(){ $(this).css('right','initial'); },
				drag  : function( e ){
					// detect sidebar
					// console.log(e);
				},
				containment : "window"
			});
		},
		loadTemplate : function(){
			$.ajax({
				async    : false,
				dataType : 'html',
				url      : this.parent.templateUrl,
				success  : $.proxy(function( html ){
					html = '<div template>'+html+'</div>';
					this.parent.template = $(html);
				},this)
			})
		}
	},

	// toolbox user events & functions

	preLoad  : function(){}, // user preLoad event
	render   : function(){}, // user render event
	events   : function(){}, // user events
	onLoad   : function(){}, // user onLoad event
	refresh  : function(){}  // user refresh event

}