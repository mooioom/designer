//@ sourceURL=templateEditorAdmin.js

console.log('templateEditorAdmin');

// admin for creating template designs

new editor.toolbox({

	templateUrl : 'modules/templateEditorAdmin.html',

	name    : 'designs',
	title   : 'Designs',
	visible : true,
	width   : 200,

	designs : [],

	preLoad : function(){ this.getData(); },
	onLoad  : function(){

		this.reposition(); 
		$('#new,#save,#load').show();

	},

	redraw  : function(){
		this.render();
		this.events();
	},

	render  : function(){
		$('.toolbox.designs .body').empty();
		$('.toolbox.designs .menu').remove();

		for(i in this.designs)
		{
			item      = $.extend(true,{},this.designs[i]);
			item.type = getString(item.type);
			this.append('.body','.item',item);
		}

		$('.toolbox.designs').append('<div class="menu"></div>');
		$('.toolbox.designs .menu').append('<div class="item add right">'+getString('new')+'</div>');
		$('.toolbox.designs .menu').append('<div class="item delete disabled right"></div>');
		$('.toolbox.designs .menu').append('<div class="clear"></div>');

		if(this.hasSelected()) $('.delete',this.el).removeClass('disabled');

		this.reposition();

	},
	
	events  : function(){
		$('.body .item',this.el).click(       $.proxy(this.load,      this) );
		$('.body .item .save',this.el).click( $.proxy(this.save,      this) );
		$('.body .isActive',this.el).click(   $.proxy(this.isActive,  this) );
		$('.menu .add',this.el).click(        $.proxy(this.add,       this) );
		$('.menu .delete',this.el).click(     $.proxy(this.delete,    this) );
	},

	api : function( action, callback, data ){

		a = {
			type        : "POST",
			contentType : "application/json; charset=utf-8",
			url         : "api/api.aspx/"+action,
			dataType    : "json",
			success     : $.proxy(callback,this)
		}

		if(data) a.data = JSON.stringify(data);

		$.ajax(a);

	},

	getData : function(){

		this.api(
			'getDesigns',
			function ( data ) {
				data         = $.parseJSON(data.d);
				this.designs = [];
				for(i in data)
				{
					design = data[i];
					this.designs.push({
						id       : design.ID,
						title    : design.Name,
						type     : design.Type,
						height   : design.Height,
						isActive : design.Active,
						data     : design.Data
					});
				}
				if(this.designs.length) this.redraw();
			}
		);

	},
	
	load : function( e ){

		var item = $(e.target).closest('.item'),
			id   = Number(item.attr('id')),
			type = $('.type',item).attr('type').toLowerCase();
			
		this.api(
			'getDesign',
			function( data ){
				data   = $.parseJSON(data.d);
				design = data[0];
				this.select( design.ID );
				if( design )
				{
					editor.reset();
					editor.init({
						name    : design.Name,
					    width   : 1024,
						height  : Number(design.Height),
						data    : design.Data
					});
					this.redraw();
				}
			}, 
			{ type : type, id : id } 
		);

	},
	select : function( id ){
		for(i in this.designs)
		{
			d = this.designs[i]
			d.selected = false;
			if(id == d.id) d.selected = true;
		}
	},
	save : function( e ){
		e.preventDefault(); e.stopPropagation();
		//todo edit objects before save
		this.api(
			'saveDesign',
			function( data ){
				if(data) console.log('saved');
			},
			{ id : this.hasSelected(), data : editor.file.getData(), html : editor.file.getHtml( {objects:editor.objects} )  }
		)
	},
	delete : function( e ){
		e.preventDefault(); e.stopPropagation();
		id = this.hasSelected();
		if(!id) return;
		deletePop = new Popup({
			header     : 'Are you sure?',
			content    : 'Are you sure you want to delete the selected design?',
			actionText : 'Delete',
			closeText  : 'Cancel',
			action     : $.proxy(function(){
				this.api(
					'removeDesign',
					function(data){if(data.d)this.getData();},
					{id:id}
				);
				deletePop.close();
			},this)
		})
	},
	isActive : function(){

	},
	add : function(){

		data = {
			nameTitle   : getString('TemplateName'),
			nameValue   : getString('UntitledTemplate'),
			heightTitle : getString('Height'),
			heightValue : 253,
			type        : getString('type'),
			header 		: getString('header'),
			footer  	: getString('footer')
		}

		html = this.template.find('.designCreate').outerHTML();
		content = Mustache.to_html(html,data);

		var createPopup = new Popup({
			enable     : true,
			header     : getString('CreateATemplate'),
			content    : content,
			actionText : getString('Create'),
			closeText  : getString('Cancel'),
			action     : $.proxy(function()
			{

				var name   = $('#TemplateName').val(),
					height = $('#TemplateHeight').val(),
					type   = $('#TemplateType').val();

				this.setupDesign( name,type,height );
				createPopup.close();
				
			},this)
		});
	},
	setupDesign : function( name, type, height ){

		this.api(
			'setupDesign',
			function(data){if(data.d)this.getData();},
			{name:name,height:height,type:type}
		);

	},
	append : function( el, templateItem, data){
		html = this.template.find(templateItem).outerHTML();
		html = Mustache.to_html(html,data);
		$(el,this.el).append(html);
	},
	reposition : function()
	{
		var canvasLeft   = $('#canvas').css('left'),
			canvasLeft   = Number(canvasLeft.replace('px','')),
			canvasHeight = $('#canvas').height();

		$('.toolbox.designs').css('left', canvasLeft + 'px');
		$('.toolbox.objects').css('left', canvasLeft + 810 + 'px');
		$('.toolbox.resources').css('left', canvasLeft + 526 + 'px');
		$('.toolbox.text').css('left', canvasLeft + 'px');
		$('.toolbox.templates').css('left', canvasLeft + 'px');

		$('.toolbox').css('top', canvasHeight + 97 + 4 + 'px').css('right', 'initial');

	},
	hasSelected : function(){ a = this.designs; for(i in a) if(a[i].selected) return a[i].id;}

});

var canvasLeft = $('#canvas').css('left'),
	canvasLeft = Number(canvasLeft.replace('px','')),
	canvasHeight = $('#canvas').height();

$('.toolbox.designs').css('left', canvasLeft + 310 + 'px');
$('.toolbox.designs').css('top', canvasHeight + 97 + 4 + 'px');
$('.toolbox.designs').css('right', 'initial');