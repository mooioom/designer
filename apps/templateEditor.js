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

// setup ui

var canvasLeft = $('#canvas').css('left'),
	canvasLeft = Number(canvasLeft.replace('px',''));

$('.toolbox.objects').css('left', canvasLeft + 766 + 'px');
$('.toolbox.objects').css('top', '354px');
$('.toolbox.objects').css('right', 'initial');

$('.toolbox.resources').css('left', canvasLeft + 526 + 'px');
$('.toolbox.resources').css('top', '354px');
$('.toolbox.resources').css('right', 'initial');

// get templates - << API

new editor.toolbox({

	name  : 'templates',
	title : getString('templates'),

	visible : true,

	preLoad : function(){
		// get data from API
		this.data = this.getData();
	},

	onLoad : function(){

	},

	render : function(){
		// render the toolbox custom ui
		this.append('<div class="item header"><div class="left">'+getString('title')+' + '+getString('type')+'</div><div class="right">'+getString('active')+'?</div><div class="clear"></div></div>');
		for(i in this.data){
			item = this.data[i];
			if(item.isActive) active='active'; else active = '';
			this.append('<div class="item" id="'+item.id+'"><div class="left"><div class="title">'+item.title+'</div><div class="type">'+getString(item.type)+'</div></div><div class="right"><div class="right isActive '+active+'"></div><div title="'+getString('load')+'" class="right load"></div><div class="clear"></div></div><div class="clear"></div></div>');
		}
		$('.toolbox.templates').append('<div class="menu"></div>');
		$('.toolbox.templates .menu').append('<div class="item add right">+</div>');
		$('.toolbox.templates .menu').append('<div class="item delete disabled right"></div>');
		$('.toolbox.templates .menu').append('<div class="clear"></div>');
	},

	redraw : function(){

	},

	events : function(){
		// setup toolbox custom	events
		$('.toolbox.templates .body .item .load').click( $.proxy(this.load,      this) );
		$('.toolbox.templates .body .isActive').click(   $.proxy(this.isActive,  this) );
		$('.toolbox.templates .menu .add').click(        $.proxy(this.add,       this) );
		$('.toolbox.templates .menu .delete').click(     $.proxy(this.delete,    this) );
	},

	getData : function(){
		return [
			{ id : 1, title : 'BillTemplate 1', type : 'header', isActive : true },
			{ id : 2, title : 'BillTemplate 2', type : 'footer', isActive : true },
			{ id : 3, title : 'BillTemplate 3', type : 'header', isActive : false },
			{ id : 4, title : 'BillTemplate 4', type : 'footer', isActive : false }
		];
	},

	load : function( e ){
		e.preventDefault(); e.stopPropagation();

		var item  = $(e.target).parent().parent(),
			id    = Number(item.attr('id')),
			title = item.find('.title').html();

		var loadPop = new Popup({
			header     : getString('load')+' '+title+' ...',
			content    : 'Any unsaved changed on the current project will be deleted!',
			actionText : getString('load'),
			closeText  : getString('Cancel'),
			action : function()
			{
				loadPop.close();
			}
		});
	},

	isActive : function( e ){
		e.preventDefault(); e.stopPropagation();
		console.log('isActive',this);
	},

	add : function(){
		console.log('add',this);
	},

	delete : function(){
		console.log('delete',this);
	}

});

$('.toolbox.templates').css('left', canvasLeft + 'px');
$('.toolbox.templates').css('top', '354px');
$('.toolbox.templates').css('right', 'initial');