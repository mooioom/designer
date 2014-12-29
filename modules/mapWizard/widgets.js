//@ sourceURL=mapWizardWidgets.js

$.extend(true,mapWizard,{

	widgets : {

		widget : {},

		wizardTemplate : '',

		widgetTypes : [

			{
				type  : 'chart',
				title : 'Chart',
				sub  : [
					{ 
						type  : 'line', 
						title : 'Line' 
					},
					{ 
						type  : 'spline', 
						title : 'Spline' 
					},
					{
						type  : 'bar',
						title : 'Bar'
					},
					{ 
						type  : 'column', 
						title : 'Column' 
					},
					{ 
						type  : 'area', 
						title : 'Area' 
					},
					{ 
						type  : 'areaspline', 
						title : 'Area - Spline' 
					},
					{ 
						type  : 'pie', 
						title : 'Pie' 
					}
				]
			},
			{
				type  : 'gauge',
				title : 'Gauge',
				sub : [
					{ 
						type : 'regular', 
						title : 'Regular' 
					},
					{ 
						type : 'solid', 
						title : 'Solid' 
					}
				]
			},
			{ 
				type  : 'led', 
				title : 'Led Light', 
			},
			{ 
				type  : 'meter', 
				title : 'Meter', 
			},
			{ 
				type  : 'iframe', 
				title : 'Iframe', 
			}
		],

		init : function(){

			console.log('mapWizard widgets module :: init ');

			this.load();

			if(!isAdmin) return; // todo remove

			this.toolbox();
			this.toolbar();

		},

		save : function(){

			designer.customTags = [];

			for(i in designer.objects) 
			{
				if(designer.objects[i].widget)
				{
					var tag = designer.objects[i].widget;
					tag.name = 'widget';
					designer.customTags.push( tag );
				}
			}

		},

		load : function(){

			for(i in designer.customTags)
			{
				var o = designer.functions.getObject( Number(designer.customTags[i].oid) );
				o.widget = designer.customTags[i];
			}

		},

		toolbox : function(){

			// creates the widgets toolbox

			$('#view .mainMenuSub #widgets').remove();
			$('#view .mainMenuSub').append('<div id="widgets" class="subItem"><div class="title">Widgets</div><div class="shortcut">Ctrl + W</div><div class="clear"></div></div>');
			$('#view .mainMenuSub #widgets').click(function(){$('.toolbox.widgets').toggle();});

			if(designer.objects) $('.toolbox.widgets').show();

			new designer.toolbox({

				name  : 'widgets',
				title : 'Widgets',

				visible : false,

				onLoad : function()
				{
					this.parent = mapWizard.widgets;

					this.render();
					this.events();	
				},

				render : function(){

					// render 

					$('.menu',this.el).remove();
					$(this.el).append('<div class="menu"></div>');
					$('.menu',this.el).append('<div class="item create right">'+getString('Create')+'</div>');
					$('.menu',this.el).append('<div class="clear"></div>');

				},

				events : function(){

					$('.create',this.el).unbind('click').bind('click', $.proxy(this.parent.wizard,this) );

				}
			});
		},

		toolbar : function(){
			// creates the widgets toolbar
		},

		wizard : function(){
			// creates the widgets wizard

			if(!this.parent.wizardTemplate) this.parent.wizardTemplate = designer.getHtml('modules/mapWizard/wizard.html');

			var html = $(this.parent.wizardTemplate);

			html.find('#type').append('<option value="0">Select Widget Type...</option>');

			for(i in this.parent.widgetTypes)
			{
				var wt = this.parent.widgetTypes[i];
				html.find('#type').append('<option value="'+wt.type+'">'+wt.title+'</option>');
			}
			
			wizard = new Popup({

				header     : 'Widgets Wizard',
				closeText  : getString('Close'),
				actionText : getString('save2'),
				action     : $.proxy(function(){

				},this),
				content    : html,
				addClass   : 'widgetsWizard',
				onLoad     : $.proxy(function(){

					$('.widgetsWizard #type').change($.proxy(function(){
						this.parent.onSelectType();
					},this));

					$('.widgetsWizard .selectData').click($.proxy(function(){

						var autoMaxDemands  = true,
							autoSelectDates = true;

						if( this.parent.isSingleValue() )
						{
							autoMaxDemands  = false;
							autoSelectDates = false;
						}

						DL.devices = mapWizard.devices;
						DL.chooser({

							onChange   : $.proxy(this.parent.onDataChange,this.parent),
							onSelect   : $.proxy(this.parent.onDataChange,this.parent),

							widgetMode      : true,
							autoSelectDates : autoSelectDates,
							autoMaxDemands  : autoMaxDemands

						});
					},this));

				},this)
			});

		},

		isSingleValue : function(){
			if( $('.widgetsWizard #type').val() == 'gauge' || 
				$('.widgetsWizard #type').val() == 'led' ) return true;
			return false;
		},

		onSelectType : function(){

			$('.widgetsWizard #sub').hide();
			$('.widgetsWizard .widget').empty();
			$('.dlChooser').remove();

			var type = this.getType( $('.widgetsWizard #type').val() ),
				subs = type&&type.sub;

			if(type=='0'){this.resetWizard();return;}

			this.widget = {};
			this.widget.type = type.type;

			if(subs)
			{
				$('.widgetsWizard #sub').empty().show();
				for(i in subs) $('.widgetsWizard #sub').append('<option value="'+subs[i].type+'">'+subs[i].title+'</option>');
				$('.widgetsWizard #sub').unbind('change').bind('change',$.proxy(function(e){
					this.widget.subType = $(e.target).val();
					this.preview();
				},this));
			}

			$('.widgetsWizard .selectData').show();

			this.preview();

		},

		onDataChange : function( result, query, options ){

			console.log('on data change',options);

			this.widget.dataType = options.type;
			this.widget.fields   = options.fields;
			this.widget.q        = query;

			this.preview();

		},

		resetWizard : function(){

			$('.widgetsWizard .selectData').hide();
			$('.widgetsWizard #sub').val('').hide();

		},

		preview : function(){

			var widget = this.widget;

			if(!widget.q) widget.q = '';

			widgetPlayer.go( $('.widgetsWizard .widget'), widget );

		},

		// helpers

		getType  : function( type ){ for(i in this.widgetTypes) if(this.widgetTypes[i].type == type) return this.widgetTypes[i]; }

	}

})