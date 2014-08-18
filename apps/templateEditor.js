//@ sourceURL=templateEditor.js

console.log('templateEditor',editor);

$('.toolbar.text .clear').remove();
$('.toolbar.text').append('<div class="item">'+getString('dynamicField')+' : <select id="dynamicFields"></select></div>');
$('.toolbar.text').append('<div class="clear"></div>');

// get dynamic dynamicFields - << API

dynamicFields = [
	{ label : 'Title : User Name', value : 'titleUserName', display : 'User Name' , type : 'text' },
	{ label : 'Value : User Name', value : 'valueUserName', display : '<userName>', type : 'dynamic' },
	{ label : 'Title : User Address', value : 'titleAddress', display : 'Address', type : 'text' },
	{ label : 'Value : User Address', value : 'valueUserAddress', display : '<userAddress>', type : 'dynamic' },
	{ label : 'Title : Serial Number', value : 'titleSerialNumber', display : 'Serial Number', type : 'text' },
	{ label : 'Value : Serial Number', value : 'valueSerialNumber', display : '<serialNumber>', type : 'dynamic' },
	{ label : 'Title : Meter Number', value : 'titleMeterNumber', display : 'Meter Number', type : 'text' },
	{ label : 'Value : Meter Number', value : 'valueMeterNumber', display : '<meterNumber>', type : 'dynamic' },
	{ label : 'Title : Bill Period', value : 'titleBillPeriod', display : 'Bill Period', type : 'text' },
	{ label : 'Value : Bill Period', value : 'valueBillPeriod', display : '<billPeriod>', type : 'dynamic' }
]

// --- end of stub

for(i in dynamicFields){

	field = dynamicFields[i];
	$('#dynamicFields').append('<option data="'+field.value+'" value="'+field.display+'">'+field.label+'</option>');

}

$('#dynamicFields').change(function(){

	if(editor.selecteds.length)
	{
		editor.selecteds[0].text = $(this).val();
		editor.redraw();
	}

});

// get templates - << API

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

editor.toolboxes.push(new editor.toolbox({

	name  : 'templates',
	title : getString('templates'),

	left : 925,
	top  : 370,

	visible : true,

	preLoad : function(){
		// get data from API
		this.data = this.getData();
	},

	render : function(){
		// render the toolbox custom ui
		this.append('<div class="item header"><div class="left">'+getString('title')+' + '+getString('type')+'</div><div class="right">'+getString('active')+'?</div><div class="clear"></div></div>');
		for(i in this.data){
			item = this.data[i];
			if(item.isActive) active='active'; else active = '';
			this.append('<div class="item" id="'+item.id+'"><div class="left">'+item.title+'<br/><span class="type">'+getString(item.type)+'</span></div><div class="right"><div class="isActive '+active+'"></div></div><div class="clear"></div></div>');
		}
	},

	events : function(){
		// setup toolbox custom	events
	},

	getData : function(){
		return [
			{ id : 1, title : 'BillTemplate 1', type : 'header', isActive : true },
			{ id : 2, title : 'BillTemplate 2', type : 'footer', isActive : true },
			{ id : 3, title : 'BillTemplate 3', type : 'header', isActive : false },
			{ id : 4, title : 'BillTemplate 4', type : 'footer', isActive : false }
		];
	}

}));