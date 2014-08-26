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

	templateUrl : 'templateEditor.html',

	name    : 'templates',
	title   : getString('templates'),
	visible : true,
	width   : 308,

	preLoad : function(){
		this.getData();
	},

	onLoad : function(){

	},

	append : function( el, templateItem, data){
		html = this.template.find(templateItem).outerHTML();
		html = Mustache.to_html(html,data);
		$(el,this.el).append(html);
	},

	render : function(){

		// render the toolbox custom ui
		$('.body',this.el).empty();
		$('.menu',this.el).remove();

		header = { title:getString('title'), type:getString('type'), active:getString('active') }
		this.append('.body','.item.header',header);

		//stub
		// this.templates = [
		// 	{ id : 1, title : 'item title 1', type : 'header', isActive : true },
		// 	{ id : 2, title : 'item title 2', type : 'footer', isActive : false }
		// ];

		for(i in this.templates)
		{
			item      = this.templates[i];
			item.type = getString(item.type);
			this.append('.body','.item:not(.header)',item);
		}

		this.el.append('<div class="menu"></div>');

		$('.menu',this.el).append('<div class="item add right">'+getString('new')+'</div>');
		$('.menu',this.el).append('<div class="item delete disabled right"></div>');
		$('.menu',this.el).append('<div class="clear"></div>');
	},

	redraw : function(){

	},

	events : function(){
		// setup toolbox custom	events
		$('.body .item .load',this.el).click( $.proxy(this.load,      this) );
		$('.body .isActive',this.el).click(   $.proxy(this.isActive,  this) );
		$('.menu .add',this.el).click(        $.proxy(this.add,       this) );
		$('.menu .delete',this.el).click(     $.proxy(this.delete,    this) );
	},

	getData : function()
	{
		$.ajax({
			type        : "POST",
			contentType : "application/json; charset=utf-8",
			url         : "api/api.aspx/init",
			dataType    : "json",
			success     : $.proxy(function ( data )
			{
				data = $.parseJSON(data.d);
				for(i in data.templates)
				{
					template = data.templates[i];
					d.push({
						id       : template.ID,
						title    : template.Name,
						type     : template.Type,
						height   : template.Height,
						isActive : template.Active 
					});
					this.templates = d;
				}
				if(!this.templates) this.create( true );
				this.render();
				this.events();
			},this),
			error : $.proxy(function(){ this.create(); },this)
		});
	},

	create : function( firstRun ){

		var header       = getString('CreateATemplate'),
			content      = getString('SelectADesign'),
			firstRunText = '';

		if( firstRun ) firstRunText = '<div class="firstTime">'+getString('FirstTimeUsing')+'</div>';

		content = firstRunText + content;

		var designs    = this.getDesigns(),
			designsDiv = $('<div class="designs"></div>');

		for(i in designs)
		{
			var design    = designs[i],
				heightStr = '',
			  	selected  = ''; if(i == 0) selected = 'selected';

			if(design.height) heightStr = ', ' + getString('Height') + ' : ' + design.height + 'px';

			design.selected  = selected;
			design.infoStr   = getString('type') + ' : ' + getString(design.type) + heightStr;

			if(!design.type) design.infoStr = getString('type')   + ' : ' + getString('Customizable') + 
										', ' + getString('Height') + ' : ' + getString('Customizable');

			html = this.template.find('.design').outerHTML();
			designHtml = Mustache.to_html(html,design);
			designsDiv.append(designHtml);

		}

		var createPopup = new Popup({
			enable     : true,
			header     : header,
			content    : '<div>'+content+'</div><div class="designs">'+designsDiv.html()+'</div>',
			actionText : getString('Continue'),
			closeText  : getString('Cancel'),
			onLoad     : function()
			{
				$('.design').click(function(){ $('.design').removeClass('selected'); $(this).addClass('selected'); })
			},
			action     : $.proxy(function()
			{
				//popup stage 2

				var designId     = Number($('.design.selected').attr('dataid')),
					designType   = $('.design.selected').attr('datatype'),
					designHeight = Number($('.design.selected').attr('dataheight')),
					designTitle  = $('.design.selected .designTitle').html();

				$('.popupLoading').hide();
				$('.popupContent').empty();

				data = {
					selectName  : designTitle,
					nameTitle   : getString('TemplateName'),
					nameValue   : getString('UntitledTemplate'),
					heightTitle : getString('Height'),
					heightValue : '',
					type        : getString('type'),
					header 		: getString('header'),
					footer  	: getString('footer')
				}
				html       = this.template.find('.popupStage2').outerHTML();
				stage2Html = Mustache.to_html(html,data);

				$('.popupContent').append(stage2Html);
				$('.popupButtonA').html(getString('Create'));
				$('.popupButtonB').html(getString('Back'));

				$('#TemplateType').val(designType ? designType : 'header');
				$('#TemplateHeight').val(designHeight ? designHeight : 253);

				if(designType)   $('#TemplateType').attr('disabled','disabled').addClass('disabled');
				if(designHeight) $('#TemplateHeight').attr('disabled','disabled').addClass('disabled');

				$('.popupButtonA').click($.proxy(function()
				{
					var name   = $('#TemplateName').val(),
						height = $('#TemplateHeight').val(),
						type   = $('#TemplateType').val();

					this.setupTemplate( name,height,type,designId );

					createPopup.close();	
				},this));

				$('.popupButtonB').click($.proxy(function(){
					createPopup.close();
					this.create(firstRun);
				},this));
				
			},this)
		});

	},

	getDesigns : function(){

		// load designs

		return [
			{
				id    : 2,
				title : 'Blank Template',
				desc  : 'Empty Template',
				type  : '',
				img   : ''
			},
			{
				id     : 0,
				title  : 'Basic Header Template',
				desc   : 'This is a basic template with a simple logo design, title and some basic information...',
				type   : 'header',
				height : 253,
				img    : ''
			},
			{
				id     : 1,
				title  : 'Basic Footer Template',
				desc   : 'A Basic footer template, logo, address and information',
				type   : 'footer',
				height : 180,
				img    : ''
			}
		];

	},

	setupTemplate : function( name, height, type, designId ){

		$.ajax({
			type        : "POST",
			contentType : "application/json; charset=utf-8",
			url         : "api/api.aspx/setupTemplate",
			data        : JSON.stringify({
				name     : name,
				height   : height,
				type     : type,
				designId : designId
			}),
			dataType    : "json",
			success     : $.proxy(function ( data )
			{
				console.log( data );
			},this)
		});

	},

	load : function( e ){
		e.preventDefault(); e.stopPropagation();

		var item  = $(e.target).parent().parent(),
			id    = Number(item.attr('id')),
			title = item.find('.title').html();

		var loadPopup = new Popup({
			header     : getString('load')+' '+title,
			content    : getString('unsavedData'),
			actionText : getString('load'),
			closeText  : getString('Cancel'),
			action     : function()
			{
				loadPopup.close();
			}
		});
	},

	isActive : function( e ){
		e.preventDefault(); e.stopPropagation();
		console.log('isActive',this);
	},

	add : function(){
		this.create();
	},

	delete : function(){
		console.log('delete',this);
	}

});

$('.toolbox.templates').css('left', canvasLeft + 'px');
$('.toolbox.templates').css('top', '354px');
$('.toolbox.templates').css('right', 'initial');