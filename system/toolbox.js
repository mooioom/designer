
//required
jQuery.fn.outerHTML = function(s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};

Designer.toolbox = function( data ){ return this.init( data) }
Designer.toolbox.prototype = {

	name      : "",
	title     : "",

	el 		 : "",
	template : "",

	visible  : false,

	left : 20,
	top  : 65,

	init : function( data ){

		for(var i in data) this[i] = data[i];
		if(!this.name) return;

		this.parent = Designer; // static name

		var oldToolbox = this.parent.helpers.getToolbox(this.name);

		if(oldToolbox) return;

		this.parent.toolboxes.push(this);

		this.system.parent = this;

		this.preLoad();
		this.system.render();
		this.render();
		this.system.events();
		this.events();
		this.onLoad();

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
			var toolbox = $('<div class="toolbox '+this.parent.name+' '+hidden+'"><div class="header">'+this.parent.title+'</div><div class="close">X</div><div class="body"></div></div>');
			$('body').append(toolbox);
			if(this.parent.width) toolbox.css('width',this.parent.width + 'px');
			this.parent.el = toolbox;
		},
		events : function(){
			$(this.parent.el).draggable({ 
				start       : function(){ $(this).css('right','initial'); },
				drag        : function( e ){},
				handle      : '.header',
				containment : "window"
			});
			$('.close',this.parent.el).click(function(){$(this).parent().hide();})
		},
		destroy : function(){
			var flag = null;
			for(var i=0;i<this.parent.parent.toolboxes.length;i++){
				var tb = this.parent.parent.toolboxes[i];
				if(tb.name == this.parent.name) flag = i;
			}
			$(this.parent.el).remove();
			if(typeof flag == 'number') this.parent.parent.toolboxes.splice(flag,1);
		}
	},

	bind : function( a, b, c ){
		$(a).unbind(b).bind(b,$.proxy(c,this));
	},

	// toolbox user events & functions

	preLoad  : function(){}, // user preLoad event
	render   : function(){}, // user render event
	events   : function(){}, // user events
	onLoad   : function(){}, // user onLoad event
	refresh  : function(){}  // user refresh event

}