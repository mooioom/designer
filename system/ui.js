
$.extend( true, designer, {

	ui : {

		tools : {

			init : function()
			{
				this.setHeight();
				$('.tools').show().draggable({containment : "window"});
			},

			setHeight : function()
			{
				var height = 1;
				$('.tools>div').each(function(){
					if($(this).hasClass('button') || $(this).hasClass('colors')) height += 32;
					if($(this).hasClass('sep')) height += 2;
				});
				$('.tools').css('height',height+'px');
			}

		},

		toolboxes : {

			init : function(){

				new this.parent.parent.toolbox({

					name    : 'objects',
					title   : getString('objects'),
					visible : true,

					autoScrollOnSelect : true,

					redraw  : function(){
						//this.parent.helpers.timer('start','objects toolbox');
						this.render();
						this.events();
						//this.parent.helpers.timer('stop','objects toolbox');
					},

					prepend : function( el, templateItem, data ){
						html = $('#ceTemplates').find(templateItem).outerHTML();
						html = Mustache.to_html(html,data);
						$(el,this.el).prepend(html);
					},

					append : function( el, templateItem, data ){
						html = $('#ceTemplates').find(templateItem).outerHTML();
						html = Mustache.to_html(html,data);
						$(el,this.el).append(html);
					},

					preLoad : function(){},

					onLoad  : function(){
						this.initRender();
						this.initEvents();
					},

					initRender : function(){
						$('.menu',this.el).remove();
						$('.toolbox.objects').append('<div class="menu"></div>');
						$('.menu',this.el).append('<div class="item add right">'+getString('new')+'</div>');
						$('.menu',this.el).append('<div class="item delete disabled right"></div>');
						$('.menu',this.el).append('<div class="item shadow disabled left">'+getString('shadow')+'</div>');
						$('.menu',this.el).append('<div class="item transform disabled left">'+getString('transform')+'</div>');
						$('.menu',this.el).append('<div class="clear"></div>');
					},
					initEvents : function(){

						$('.delete',this.el).unbind('click').bind('click',$.proxy(function(){ this.parent.functions.delete(); },this));

						$('.shadow',this.el).unbind('click').bind('click',$.proxy(function(){ $('.toolbox.shadow').show(); },this));

						$('.transform',this.el).unbind('click').bind('click',$.proxy(function(){ $('.toolbox.transform').show(); },this));

						$('.add',this.el).unbind('click').bind('click',$.proxy(function(){
							this.parent.create.box(0,0,this.parent.width,this.parent.height);
							this.parent.render(); 
							this.parent.draw.ui();
							this.parent.draw.toolbar();
						},this));

						$(document).off('mousedown', '.toolbox.objects .objectVisible, .toolbox.objects .objectLock');
						$(document).on('mousedown', '.toolbox.objects .objectVisible, .toolbox.objects .objectLock', $.proxy(function( e ){
							e.preventDefault(); e.stopPropagation();
							var isVisible = $(e.target).hasClass('objectVisible'),
								className = isVisible ? 'invisible'       : 'unlocked',
								propName  = isVisible ? 'visible'         : 'locked';
							$(e.target).toggleClass(className);
							var item = $(e.target).closest('.item');
							if(item.hasClass('header'))
							{
								id = Number( item.parent().attr('gid') );
								this.parent.functions.getGroup(id)[propName] = !$(e.target).hasClass(className);
							}else{
								id = Number( item.attr('oid') );
								this.parent.functions.getObject(id)[propName] = !$(e.target).hasClass(className);
							}
							//this.parent.render();
							this.refresh();
						},this));

						$(document).off('dblclick','.toolbox.objects .objectName');
						$(document).on('dblclick','.toolbox.objects .objectName',$.proxy(function(e){
							var v  = $(e.target).html();
							$(e.target).html('<input type="text" class="oInput" value="'+v+'" oldValue="'+v+'"/>');
							$('input',e.target).focus();
							$('input',e.target).keydown($.proxy(function(ee){
								if(ee.keyCode==13){
									if( $(e.target).parent().parent().hasClass('object') ){
										var id = $(e.target).closest('.object').attr('oid'),
											o  = this.parent.functions.getObject( id );
									}else{
										var id = Number( $(e.target).parent().closest('.group').attr('gid') ),
											o  = this.parent.functions.getGroup( id );
									}
									o.title = $('input',e.target).val();
									$(e.target).html( o.title );
									this.render();
								}else if(ee.keyCode==27){
									$(e.target).html( $('input',e.target).attr('oldValue') );
								}
							},this));
						},this))

						$(document).off('mousedown','.toolbox.objects .groupOpenClose');
						$(document).on('mousedown','.toolbox.objects .groupOpenClose',$.proxy(function( e ){
							$(e.target).parent().parent().toggleClass('collapsed'); 
							if(!$(e.target).parent().parent().hasClass('collapsed')) $(e.target).addClass('open');
							else $(e.target).removeClass('open');
							this.refresh();
						},this));

						// sortable

						var mousedown = false,
							drag 	  = false,
							sx 		  = null,
							sy 		  = null;

						onmousemove = null;
						onmousemove = function(e)
						{

							ex = e.clientX;
							ey = e.clientY;
							
							if(mousedown && ex != sx && ey != sy)
							{
								drag = true;
								var selecteds = 0;
								$('.selected').each(function(){
									$(this).addClass('ui-dragging');
									$(this).css('width',$('.toolbox.objects .body').width()+'px');
									$(this).css('position','fixed');
									$(this).css('top',ey + (selecteds * 24));
									$(this).css('left',ex);
									selecteds ++ ;
								});
							}
							if(drag)
							{
								items = 0;
								totalHeight = 0;
								$('.toolbox.objects .item:not(.selected):visible').each(function(){
									/*
									 * CAN BE MUCH BETTER
									*/
									i = $(this);
									offset = $(this).offset();
									height = $(this).height();
									if(e.clientY > offset.top && e.clientY < (offset.top + height))
									{
										$('.toolbox.objects .placeholder').remove();
										if( i.hasClass('header') && i.closest('.toolbox.objects .group').hasClass('collapsed') )
											 $('.toolbox.objects .body .item:not(.selected):visible:eq('+items+')').parent().after('<div class="placeholder"></div>');
										else $('.toolbox.objects .body .item:not(.selected):visible:eq('+items+')').after('<div class="placeholder"></div>');	
									}
									else if( $('.toolbox.objects .body .item:not(.selected):visible:eq(0)').length && e.clientY < $('.toolbox.objects .body .item:not(.selected):visible:eq(0)').offset().top ){
										$('.toolbox.objects .placeholder').remove();
										$('.toolbox.objects .body').prepend('<div class="placeholder"></div>')
									}
									items ++ ;
								});
								$('.toolbox.objects .placeholder').parents('.toolbox.objects .group').each(function(){
									p = $(this);
									if( $($('.header',p)[0]).hasClass('ui-dragging') ) $('.toolbox.objects .placeholder').addClass('disabled');
								});
								if(ey > $('.toolbox.objects').offset().top + $('.toolbox.objects').height() )
									$('.toolbox.objects .body').scrollTop( $('.toolbox.objects .body').scrollTop() + 20 );
								if(ey < $('.toolbox').offset().top ) 
									$('.toolbox.objects .body').scrollTop( $('.toolbox.objects .body').scrollTop() - 20 );
							}
						}

						$(document).off('mousedown','.toolbox.objects .body .item');
						$(document).on('mousedown','.toolbox.objects .body .item',function( e )
						{
							if( $('.toolbox.objects').hasClass('ui-draggable') ) $('.toolbox.objects').draggable( 'destroy' );

							if( !$(this).hasClass('selected') )
							{
								if( !e.ctrlKey ) $('.selected').not(this).toggleClass('selected');
								$(this).addClass('selected');
							}
							mousedown = true;
							sx = e.clientX;
							sy = e.clientY;
						});

						$(document).off('mouseup','.toolbox.objects .body .item');
						$(document).on('mouseup','.toolbox.objects .body .item',$.proxy(function( e )
						{
							$('.toolbox.objects').draggable();

							if( !e.ctrlKey && !drag) {
								$('.toolbox.objects .selected').not( $(e.target).closest('.item')[0] ).toggleClass('selected');
							}

							mousedown = false;

							if(drag)
							{
								drag = false;
								if( $('.toolbox.objects .placeholder').length && !$('.toolbox.objects .placeholder').hasClass('disabled') )
								{
									$('.toolbox.objects .ui-dragging').each(function()
									{
										if(!$(this).hasClass('header')) $(this).insertBefore('.toolbox.objects .placeholder'); 
										else $(this).parent().insertBefore('.toolbox.objects .placeholder');
									});
									$('.toolbox.objects .item').removeClass('ui-dragging').attr('style','');
									$('.toolbox.objects .placeholder').remove();	
								}
								else
								{
									$('.toolbox.objects .item').removeClass('ui-dragging').attr('style','');
									$('.toolbox.objects .placeholder').remove();
								}
								$('.toolbox.objects .group').each(function(){
									if(!$('.object',this).length) $(this).remove();
								});
								this.refresh();
							}
							this.refresh( 'doNotRender' );
							
						},this));
					},

					render  : function( overrideCheck ){

						$('.body',this.el).empty();

						var nested = this.parent.helpers.getNested();

						this.g = 0;

						this.drawGroup( nested , '.toolbox.objects .body' );
						$('.toolbox.objects .group, .toolbox.objects .object').removeAttr('groupid');

						this.toggleOptions();

						this.currentObjects   = $.extend(true,[],this.parent.objects);
						this.currentSelecteds = $.extend(true,[],this.parent.selecteds);

						if( this.autoScrollOnSelect && $('.objectsItem.selected:eq(0)').length ) $('.body',this.el).scrollTop($('.objectsItem.selected:eq(0)').index() * 27 - (27*4));
						
					},

					g : 0,

					drawGroup : function( objects, target ){
						// requires a nested object (helpers.getNested) to create the objects tree
						// init using - drawGroup( nested , '.target' );
						var t = $(target);
						for(i in objects)
						{
							var o = objects[i];
							if(o.oType == 'object'){
								var visible  = o.visible  ? ''         : 'invisible',
									locked   = !o.locked  ? 'unlocked' : '',
									selected = o.selected ? 'selected' : '';
								if(!o.title)
								{
									title = o.type; if(o.src) title = 'image';
									title += ' ' + o.id; if(o.type == 'text') title += ' - ' + o.text;
									title = title.capitalize();
									o.title = title;
								}
								t.append('<div class="object item '+selected+'" groupid="'+this.g+'" oid="'+o.id+'" ><div class="header"><div class="left objectName">'+o.title+'</div><div class="right objectLock '+locked+'"></div><div class="right objectVisible '+visible+'"></div><div class="clear"></div></div></div>');
								if( $('>.header', $('.object[oid="'+o.id+'"]').parents('.group') ).hasClass('selected') ) $('.object[oid="'+o.id+'"]').removeClass('selected');
							}
							if(o.oType == 'group')
							{
								this.g++;
								var visible   = o.visible   ? ''          : 'invisible',
									locked    = !o.locked   ? 'unlocked'  : '',
									collapsed = o.collapsed ? 'collapsed' : '',
									open      = o.collapsed ? ''          : 'open',
									selected  = o.selected  ? 'selected'  : '';

								t.append('<div class="group '+collapsed+'" groupid="'+this.g+'" gid="'+o.gid+'"><div class="header item '+selected+'"><div class="left groupOpenClose '+open+'"></div><div class="left objectName">'+o.title+'</div><div class="right objectLock '+locked+'"></div><div class="right objectVisible '+visible+'"></div><div class="clear"></div></div></div>');
								if( $('>.header', $('.group[gid="'+o.gid+'"]').parents('.group') ).hasClass('selected') ) $('.group[gid="'+o.gid+'"]>.header').removeClass('selected');
								this.drawGroup( o.objects, '.group[groupid="'+this.g+'"]' )
							}
						}
						$('.objects.toolbox .group').each(function(){
							var objects   = $('.object' , this).length,
								selecteds = $('.object.selected' , this).length;
							if(objects == selecteds) {
								$('>.header',this).addClass('selected');
								$('.object', this).removeClass('selected');
							}
						})
					},

					events  : function(){},

					toggleOptions : function(){
						
						if(this.parent.selecteds && this.parent.selecteds.length) {
							$('.shadow',   this.el).removeClass('disabled');
							$('.transform',this.el).removeClass('disabled');
							$('.delete',   this.el).removeClass('disabled');
						}
						else {
							$('.shadow',   this.el).addClass('disabled');
							$('.transform',this.el).addClass('disabled');
							$('.delete',   this.el).addClass('disabled');
						}
					},

					refresh : function( doNotRender ){

						var objects   		= [],
							groups    		= [],
							selecteds 		= [],
							selectedsGroups = [];

						// dom to data

						$('.toolbox.objects .object').each(function(){
							objects.push({
								id      : Number( $(this).attr('oid') ),
								title   : $('>.header>.objectName',this).html(),
								groupId : Number( $(this).closest('.group').attr('gid') ) || undefined,
								visible : !$('>.header>.objectVisible',this).hasClass('invisible'),
								locked  : !$('>.header>.objectLock',this).hasClass('unlocked')
							});
						});

						$('.toolbox.objects .group').each(function(){
							groups.push({
								id        : Number( $(this).attr('gid') ),
								title     : $('>.header>.objectName',this).html(),
								groupId   : Number( $(this).closest('.group:not([gid="'+$(this).attr('gid')+'"])').attr('gid') ) || undefined,
								visible   : !$('>.header>.objectVisible',this).hasClass('invisible'),
								locked    : !$('>.header>.objectLock',this).hasClass('unlocked'),
								collapsed : !$('>.header>.groupOpenClose',this).hasClass('open'),
							})
						});

						$('.toolbox.objects .selected').each(function(){
							if($(this).hasClass('object')) selecteds.push( Number($(this).attr('oid')) )
							else selectedsGroups.push( Number($(this).parent().attr('gid')) )
						});

						var objectsTemp   = [],
							selectedsTemp = [];

						for(i in objects.reverse() )
						{
							var newO         = $.extend(true,{},this.parent.functions.getObject( objects[i].id ));
								newO.title   = objects[i].title,
								newO.groupId = objects[i].groupId,
								newO.visible = objects[i].visible,
								newO.locked  = objects[i].locked;

							objectsTemp.push( newO );
						}

						this.parent.objects = objectsTemp;

						for(i in selectedsGroups)
						{
							var g = selectedsGroups[i];
							$('.group[gid="'+g+'"] .item').each(function(){
								if($(this).hasClass('object') && selecteds.indexOf( Number($(this).attr('oid')) ) == -1 ) 
									selecteds.push( Number($(this).attr('oid')) )
								else if(!$(this).hasClass('object') && selectedsGroups.indexOf( Number($(this).parent().attr('gid')) ) == -1 ) 
									selectedsGroups.push( Number($(this).parent().attr('gid')) )
							})
						}

						for(i in selecteds) 
							selectedsTemp.push( this.parent.functions.getObject( selecteds[i] ) );

						this.parent.groups    		= groups;
						this.parent.selecteds 		= selectedsTemp.reverse();
						this.parent.selectedsGroups = selectedsGroups;

						// reset lock and visibility

						for(i in this.parent.objects)
						{
							var o = this.parent.objects[i], flagVisible = false, flagLock = false;
							if(!o.groupId) continue;
							var groups = this.getParentGroups( o.groupId );
							groups.push(o.groupId);
							for(x in groups)
							{
								var g = this.parent.functions.getGroup(groups[x]);
								if(!g.visible) flagVisible = true;
								if(g.locked)   flagLock    = true;
							}
							if(flagVisible) o.parentInvisible = true;
							else delete o.parentInvisible;
							if(flagLock) o.parentLocked = true;
							else delete o.parentLocked;

						}

						if(!doNotRender) this.render();
						this.parent.render();
						this.parent.draw.toolbar();

					},

					group : function(){
						this.parent.history.save();
						if( !$('.selected').length ) return;
						var biggestId = 1;
						for(i in this.parent.groups) {
							var g = this.parent.groups[i];
							if(Number(g.id) >= biggestId) 
								biggestId = Number(g.id) + 1;
						}
						first = $('.selected:first');
						if( first.hasClass('header') ) first = first.parent();
						first.before('<div class="group newGroup" gid="'+biggestId+'"><div class="header item selected"><div class="left groupOpenClose open"></div><div class="left objectName">Group '+Number(this.parent.groups.length+1)+'</div><div class="right objectLock unlocked"></div><div class="right objectVisible"></div><div class="clear"></div></div></div>');
						$('.selected').each(function(){
							if(  $(this).hasClass('header') ) $(this).parent().appendTo('.newGroup');	
							else $(this).appendTo('.newGroup');	
						});
						$('.newGroup').removeClass('newGroup');
						this.refresh();
					},
					ungroup : function(){
						this.parent.history.save();
						if( !$('.selected').length ) return;
						toUngroup = [];
						$('.selected').each(function(){
							var gid = null;
							if( $(this).hasClass('header') ) gid = $(this).parent().attr('gid') || null;
							else gid = $(this).prevAll('.header').parent().attr('gid') || null;
							if(gid!=null && toUngroup.indexOf(gid)==-1) toUngroup.push( gid );
						});
						for(i in toUngroup){
							var gid = toUngroup[i];
							$('.group[gid="'+gid+'"] > *:not(.header)').insertBefore('.group[gid="'+gid+'"]');
							$('.group[gid="'+gid+'"]').remove();
						}
						this.refresh();
					},
					getParentGroups : function( groupId ){
						var a = [];
						$('.group[gid="'+groupId+'"]').parents('.group').each(function(){a.push(Number($(this).attr('gid')))})
						return a;
					}

				});

				new this.parent.parent.toolbox({

					name    : 'resources',
					title   : getString('resources'),
					visible : true,

					redraw  : function( refresh ){
						this.render( refresh );
						this.events();
					},

					prepend : function( el, templateItem, data ){
						html = $('#ceTemplates').find(templateItem).outerHTML();
						html = Mustache.to_html(html,data);
						$(el,this.el).prepend(html);
					},

					preLoad : function(){

						$('body').append('<div id="" class="hidden"></div>');

						// init browser drop event for files
						this.parent.events.browserDropEvents.push($.proxy(function(e){

							if(!e.originalEvent.dataTransfer) return;
							e.originalEvent.stopPropagation();
							e.originalEvent.preventDefault();
							var dt    = e.originalEvent.dataTransfer,
								files = dt.files;
								
							if(!files || !dt.files.length) return;
							var file = dt.files[0];
							if (!file.type.match('image')) return;

							var reader = new FileReader();

							reader.onload = ($.proxy(function(theFile) {
								return $.proxy(function(e) {
									flag = false;
									for(i in this.parent.resources) 
										if(theFile.name == this.parent.resources[i].name) flag = true;
									if(flag) return;
									this.parent.resources.push({
										src       : e.target.result,
										name      : theFile.name,
										size      : theFile.size,
										type      : theFile.type
									});
									this.redraw();
								},this);
							},this))(file);
							// Read in the image file as a data URL.
							reader.readAsDataURL(file);

						},this));

						this.parent.events.canvasDropEvents.push($.proxy(function( event, ui){

							if( !$(ui.draggable).hasClass('dropItem') ) return;

							var e = $(ui.draggable).hasClass('resourceDisplay') ? $('img',ui.draggable)[0] : $(ui.draggable)[0];

							var src      = e.src,
								point    = { x:event.clientX, y:event.clientY },
							    position = this.parent.helpers.getPositionOnCanvas( point );

							img     = new Image();
							img.src = src;
							w       = img.width;
							h       = img.height;

							this.redraw();
							this.parent.history.save();

							this.parent.selecteds = [];

							this.parent.create.box( position.x, position.y, w, h );
							this.parent.selecteds[0].src = src;

							$(ui.draggable).css('top','0px').css('left','0px');

							$('.tools .move').click();

							this.parent.render();
							this.parent.draw.ui();
							this.parent.draw.toolbar();

						},this));

					},
					onLoad  : function()
					{
						$(document).on('click','.toolbox.resources .delete',$.proxy(function(){
							$('.resourceItem.selected').each($.proxy(function(a,b){
								idx = $(b).index();
								this.parent.resources.splice(((this.parent.resources.length - 1) - idx),1);
							},this));
							this.redraw( 'refresh' );
						},this));
					},
					render  : function( refresh ){

						$('.dropItem.ui-draggable').css('position','relative').css('left','initial').css('top','initial');

						if(!refresh){
							flags = [];
							$('.toolbox.resources .resourceItem').each($.proxy(function( i,e ) {
								var name = $('.resourceName',e).html();
								for(i in this.parent.resources) if(name == this.parent.resources[i].name) flags.push(true);
							},this));
							if(this.parent.resources.length && flags.length == this.parent.resources.length) return;
						}
						
						$('.toolbox.resources .resourceItem').remove();
						$('.menu',this.el).remove();

						for(i in this.parent.resources)
						{
							resource = $.extend(true,{},this.parent.resources[i]);
							this.prepend('.body','.resourceItem',resource);
							$('.resourceImage:eq(0)',this.el).attr('src',resource.src);
						};

						if(!$('.resourceItem.selected').length) $('.toolbox.resources .delete').addClass('disabled');

						if(!this.parent.resources.length) 
							$('.toolbox.resources .body').append('<div class="resourceItem noResources">' + getString('NoResources') + '</div>');

						this.el.append('<div class="menu"></div>');
						$('.menu',this.el).append('<div class="item delete disabled right"></div>');
						$('.menu',this.el).append('<div class="clear"></div>');

					},
					events  : function(){

						$('.resourceItem .resourceDisplay').draggable({ revert: "invalid", revertDuration:10 })

						$('.resourceItem').click(function()
						{ 
							$(this).toggleClass('selected');
							if($('.resourceItem.selected').length) $('.toolbox.resources .delete').removeClass('disabled');
							else $('.toolbox.resources .delete').addClass('disabled'); 
						});
					}
				});

				new this.parent.parent.toolbox({

					name    : 'grid',
					title   : getString('grid'),
					visible : false,

					render : function(){

						$('.body',this.el).empty();
						$('.body',this.el).append('<div class="item"><input type="checkbox" id="visible" checked="checked"> '+getString('visible')+'</div>');
						$('.body',this.el).append('<div class="item"><input type="checkbox" id="snap" checked="checked"> '+getString('snap')+' </div>');
						$('.body',this.el).append('<div class="item"><input type="text" id="size" value="14"> '+getString('size')+' </div>');
						$('.body',this.el).append('<div class="item"><input type="text" id="lineWidth" value="0.1"> '+getString('lineWidth')+' </div>');
						$('.body',this.el).append('<div class="item"><input type="text" id="strokeStyle" value="#000"> '+getString('style')+' </div>');

					},

					events : function(){

						$('input[type="text"]',this.el).keyup($.proxy(function(e){
							if(!$(e.target).val()) return;
							var v;
							if($(e.target).attr('id') == "strokeStyle") v = $(e.target).val();
							else v = Number($(e.target).val());
							this.parent.grid[$(e.target).attr('id')] = v;
							this.parent.draw.grid();
						},this));

						$('#visible',this.el).change($.proxy(function(){
							this.parent.grid.visible = $('#visible',this.el).prop('checked');
							this.parent.draw.grid();
						},this));

						$('#snap',this.el).change($.proxy(function(){
							this.parent.grid.snap = $('#snap',this.el).prop('checked');
						},this));

					}

				});

				new this.parent.parent.toolbox({

					name    : 'text',
					title   : getString('text'),
					visible : false,

					render : function(){
						$('.body',this.el).empty();
						$('.body',this.el).append('<div class="item"><textarea id="text"></textarea></div>');
					},

					events : function(){
						$('.toolbox.text #text').bind('keyup change keydown',function(){ designer.functions.changeText( $(this).val() ); });
					}

				});

				new this.parent.parent.toolbox({

					name    : 'transform',
					title   : getString('transform'),
					visible : false,

					render : function(){
						$('.body',this.el).empty();
						$('.body',this.el).append('<div class="item"><div class="title">'+getString('rotate')+'</div><input type="range" class="rotate" min="0" max="360" step="5" value="180"></div>');
						$('.body',this.el).append('<div class="item"><div class="title">'+getString('Scale')+'</div><input type="range" class="scale" min="-200" max="200" step="1" value="0"></div>');
					},

					events : function()
					{
						//rotate
						$('.toolbox.transform .rotate').bind('mousedown',function(){
							designer.history.save();
							designer.rotateStartAmount = $(this).val();
							designer.rotateStartCenter = designer.events.transformDimensions.c;
							for(i in designer.selecteds)
							{
								o = designer.selecteds[i];
								if( !o || o.locked || !o.visible ) continue;
								o.rotationData = {};
								o.rotationData.rotate = Number(o.rotate) || 0;
								o.rotationData.center = designer.helpers.getCenter( o );
							}
						});
						$('.toolbox.transform .rotate').bind('mouseup',function(){
							for(i in designer.selecteds)
							{
								o = designer.selecteds[i];
								if( !o || o.locked || !o.visible ) continue;
								delete o.rotationData;
							}
							delete designer.rotateStartAmount;
							delete designer.rotateAmount;
							designer.events.doNotRotate = true;
							$('input.rotate').val(180);
							//$('.stage').focus();
						});
						$('.toolbox.transform .rotate').bind('change input',function(){
							if(designer.events.doNotRotate){ delete designer.events.doNotRotate; return; }
							designer.rotateAmount = Number($(this).val()) - Number(designer.rotateStartAmount);
							designer.functions.rotate( designer.rotateAmount );
							
						});

						//scale
						$('.toolbox.transform .scale').bind('mousedown',function(){

							designer.history.save();
							designer.scaleStartAmount = $(this).val();
							designer.scaleStartCenter = designer.events.transformDimensions.c;
							for(i in designer.selecteds)
							{
								o = designer.selecteds[i];
								if( !o || o.locked || !o.visible ) continue;
								o.scaleData = {};
								o.scaleData.rotate   = Number(o.rotate) || 0;
								o.scaleData.center   = designer.helpers.getCenter( o );
								o.scaleData.startX   = o.startX;
								o.scaleData.startY   = o.startY;
								o.scaleData.endX     = o.endX;
								o.scaleData.endY     = o.endY;
								o.scaleData.width    = o.width;
								o.scaleData.height   = o.height;
								o.scaleData.rx       = o.rx;
								o.scaleData.ry       = o.ry;
								o.scaleData.fontSize = o.fontSize;
								o.scaleData.path     = o.path;
								o.scaleData.tlx      = o.topLeftX;
								o.scaleData.tly      = o.topLeftY;
							}
						});
						$('.toolbox.transform .scale').bind('mouseup',function(){
							for(i in designer.selecteds)
							{
								o = designer.selecteds[i];
								if( !o || o.locked || !o.visible ) continue;
								delete o.scaleData;
							}
							delete designer.scaleStartAmount;
							delete designer.scaleAmount;
							designer.events.doNotScale = true;
							$('input.scale').val(0);
							//$('.stage').focus();
						});
						$('.toolbox.transform .scale').bind('change input',function(){
							if(designer.events.doNotScale){ delete designer.events.doNotScale; return; }
							designer.scaleAmount = Number($(this).val()) - Number(designer.scaleStartAmount);
							designer.functions.scale( designer.scaleAmount );
						});
					}

				});

				new this.parent.parent.toolbox({

					name    : 'shadow',
					title   : getString('shadow'),
					visible : false,

					render : function(){
						$('.body',this.el).empty();
						$('.body',this.el).append('<div class="item">'+getString('color')+' <input type="text" class="shadowColor"></div>');
						$('.body',this.el).append('<div class="item">'+getString('blur')+'<br/><input type="range" class="shadowBlur" min="0" max="20" step="0.1" value="0"></div>');
						$('.body',this.el).append('<div class="item">'+getString('offsetX')+'<br/><input type="range" class="shadowOffsetX" min="-20" max="20" step="0.1" value="0"></div>');
						$('.body',this.el).append('<div class="item">'+getString('offsetY')+'<br/><input type="range" class="shadowOffsetY" min="-20" max="20" step="0.1" value="0"></div>');
					},

					events : function(){
						$('.toolbox input[type="range"]',this.el).change(function(){
							var prop = $(this).attr('class');
							o = designer.selecteds[0];
							if( !o ) return;
							if( o.locked || !o.visible ) return;
							o[prop] = $(this).val();
							designer.render();
						});
					}

				});

				new this.parent.parent.toolbox({

					name    : 'brightCont',
					title   : getString('brightCont'),
					visible : false,

					render : function(){
						$('.body',this.el).empty();
						$('.body',this.el).append('<div class="item">'+getString('brightness')+'<br/><input type="range" class="brightness" min="-255" max="255" step="0.5" value="0"></div>');
						$('.body',this.el).append('<div class="item">'+getString('contrast')+'<br/><input type="range" class="contrast" min="-255" max="255" step="0.5" value="0"></div>');
						$('.body',this.el).append('<div class="buttons"><div class="right button save">'+getString('save2')+'</div><div class="right button cancel">'+getString('Cancel')+'</div><div class="clear"></div></div>');
					},

					events : function(){

						$('.toolbox.brightCont .brightness').bind('mouseup',$.proxy(function(e){
							this.parent.filters.brightness( Number($(e.target).val()) )
						},this));
						$('.toolbox.brightCont .contrast').bind('mouseup',$.proxy(function(e){
							this.parent.filters.contrast( Number($(e.target).val()) )
						},this));

						$('.toolbox.brightCont .save').bind('click',$.proxy(function(){ this.save(); },this));
						$('.toolbox.brightCont .cancel, .toolbox.brightCont .close').bind('click',$.proxy(function(){ this.cancel(); },this));

					},

					open : function(){
						if( this.parent.filters.setup() ) 
						{
							$('.toolbox.brightCont .brightness, .toolbox.brightCont .contrast').val(0);
							$('.toolbox.brightCont').show();
						}
					},

					save : function(){
						this.parent.filters.original = null;
						this.parent.history.save();
						$('.toolbox.brightCont').hide();
					},

					cancel : function(){
						this.parent.selecteds[0].src = this.parent.filters.getOriginalSrc();
						this.parent.render();
						$('.toolbox.brightCont').hide();
					}

				});

				new this.parent.parent.toolbox({

					name    : 'hueSat',
					title   : getString('hueSat'),
					visible : false,

					render : function(){
						$('.body',this.el).empty();
						$('.body',this.el).append('<div class="item">'+getString('hue')+'<br/><input type="range" class="hue" min="-1" max="1" step="0.001" value="0"></div>');
						$('.body',this.el).append('<div class="item">'+getString('saturation')+'<br/><input type="range" class="saturation" min="0" max="200" step="1" value="100"></div>');
						$('.body',this.el).append('<div class="item">'+getString('lightness')+'<br/><input type="range" class="lightness" min="-1" max="1" step="0.001" value="0"></div>');
						$('.body',this.el).append('<div class="buttons"><div class="right button save">'+getString('save2')+'</div><div class="right button cancel">'+getString('Cancel')+'</div><div class="clear"></div></div>');
					},

					events : function(){

						$('.toolbox.hueSat .hue,.toolbox.hueSat .saturation,.toolbox.hueSat .lightness').bind('mouseup',$.proxy(function(e){
							this.parent.filters.hsl( Number( $('.toolbox.hueSat .hue').val() ), Number( $('.toolbox.hueSat .saturation').val() ), Number( $('.toolbox.hueSat .lightness').val() ))
						},this));

						$('.toolbox.hueSat .save').bind('click',$.proxy(function(){ this.save(); },this));
						$('.toolbox.hueSat .cancel, .toolbox.hueSat .close').bind('click',$.proxy(function(){ this.cancel(); },this));

					},

					open : function(){
						if( this.parent.filters.setup() ) 
						{
							$('.toolbox.hueSat .hue, .toolbox.hueSat .lightness').val(0);
							$('.toolbox.hueSat .saturation').val(100);
							$('.toolbox.hueSat').show();
						}
					},

					save : function(){
						this.parent.filters.original = null;
						this.parent.history.save();
						$('.toolbox.hueSat').hide();
					},

					cancel : function(){
						this.parent.selecteds[0].src = this.parent.filters.getOriginalSrc();
						this.parent.render();
						$('.toolbox.hueSat').hide();
					}

				});

				new this.parent.parent.toolbox({

					name    : 'colorize',
					title   : getString('colorize'),
					visible : false,

					render : function(){
						$('.body',this.el).empty();
						$('.body',this.el).append('<div class="item">'+getString('red')+'<br/><input type="range" class="red" min="0" max="100" step="1" value="255"></div>');
						$('.body',this.el).append('<div class="item">'+getString('green')+'<br/><input type="range" class="green" min="0" max="100" step="1" value="255"></div>');
						$('.body',this.el).append('<div class="item">'+getString('blue')+'<br/><input type="range" class="blue" min="0" max="100" step="1" value="255"></div>');
						$('.body',this.el).append('<div class="buttons"><div class="right button save">'+getString('save2')+'</div><div class="right button cancel">'+getString('Cancel')+'</div><div class="clear"></div></div>');
					},

					events : function(){

						$('.toolbox.colorize input[type="range"]').bind('mouseup',$.proxy(function(e){
							this.parent.filters.colorize( Number( $('.toolbox.colorize .red').val() ), Number( $('.toolbox.colorize .green').val() ), Number( $('.toolbox.colorize .blue').val() ) );
						},this));

						$('.toolbox.colorize .save').bind('click',$.proxy(function(){ this.save(); },this));
						$('.toolbox.colorize .cancel, .toolbox.colorize .close').bind('click',$.proxy(function(){ this.cancel(); },this));

					},

					open : function(){
						if( this.parent.filters.setup() ) 
						{
							$('.toolbox.colorize .hue').val(0);
							$('.toolbox.colorize .saturation').val(100);
							$('.toolbox.colorize').show();
						}
					},

					save : function(){
						this.parent.filters.original = null;
						this.parent.history.save();
						$('.toolbox.colorize').hide();
					},

					cancel : function(){
						this.parent.selecteds[0].src = this.parent.filters.getOriginalSrc();
						this.parent.render();
						$('.toolbox.colorize').hide();
					}

				});

				new this.parent.parent.toolbox({

					name    : 'sharpen',
					title   : getString('sharpen'),
					visible : false,

					render : function(){
						$('.body',this.el).empty();
						$('.body',this.el).append('<div class="item">'+getString('sharpen')+'<br/><input type="range" class="sharpen" min="1" max="20" step="0.1" value="1"></div>');
						$('.body',this.el).append('<div class="buttons"><div class="right button save">'+getString('save2')+'</div><div class="right button cancel">'+getString('Cancel')+'</div><div class="clear"></div></div>');
					},

					events : function(){

						$('.toolbox.sharpen .sharpen').bind('mouseup',$.proxy(function(e){
							this.parent.filters.sharpen( Number($(e.target).val()) )
						},this));

						$('.toolbox.sharpen .save').bind('click',$.proxy(function(){ this.save(); },this));
						$('.toolbox.sharpen .cancel, .toolbox.sharpen .close').bind('click',$.proxy(function(){ this.cancel(); },this));

					},

					open : function(){
						if( this.parent.filters.setup() ) 
						{
							$('.toolbox.sharpen .sharpen').val(0);
							$('.toolbox.sharpen').show();
						}
					},

					save : function(){
						this.parent.filters.original = null;
						this.parent.history.save();
						$('.toolbox.sharpen').hide();
					},

					cancel : function(){
						this.parent.selecteds[0].src = this.parent.filters.getOriginalSrc();
						this.parent.render();
						$('.toolbox.sharpen').hide();
					}

				});

				new this.parent.parent.toolbox({

					name    : 'blur',
					title   : getString('blur'),
					visible : false,

					render : function(){
						$('.body',this.el).empty();
						$('.body',this.el).append('<div class="item">'+getString('blur')+'<br/><input type="range" class="blur" min="1" max="30" step="1" value="1"></div>');
						$('.body',this.el).append('<div class="buttons"><div class="right button save">'+getString('save2')+'</div><div class="right button cancel">'+getString('Cancel')+'</div><div class="clear"></div></div>');
					},

					events : function(){

						$('.toolbox.blur .blur').bind('mouseup',$.proxy(function(e){
							this.parent.filters.blur( Number($(e.target).val()) )
						},this));

						$('.toolbox.blur .save').bind('click',$.proxy(function(){ this.save(); },this));
						$('.toolbox.blur .cancel, .toolbox.blur .close').bind('click',$.proxy(function(){ this.cancel(); },this));

					},

					open : function(){
						if( this.parent.filters.setup() ) 
						{
							$('.toolbox.blur .blur').val(0);
							$('.toolbox.blur').show();
						}
					},

					save : function(){
						this.parent.filters.original = null;
						this.parent.history.save();
						$('.toolbox.blur').hide();
					},

					cancel : function(){
						this.parent.selecteds[0].src = this.parent.filters.getOriginalSrc();
						this.parent.render();
						$('.toolbox.blur').hide();
					}

				});
				

				// can be removed once all toolboxes upgrade
				// -----------------------------------------
				$('.toolbox').draggable({ 
					start       : function(){ $(this).css('right','initial'); },
					containment : "window"
				});
				$(document).on('click', '.toolbox .close', function () {
					$(this).parent().hide();
				});
				// -----------------------------------------

				$('.toolbox input[type="range"]').change(function(){
					var prop = $(this).attr('class');
					o = designer.selecteds[0];
					if( !o ) return;
					if( o.locked || !o.visible ) return;
					o[prop] = $(this).val();
					designer.render();
				});

				$('.toolbox input[type="range"]').mousedown(function(){
					designer.history.save();
				});

				//text
				//$('.toolbox.text').hide();
				//$('.toolbox.text #text').bind('keyup change keydown',function(){ designer.functions.changeText( $(this).val() ); });

			},

			update : function( o ){

				$('.toolbox.transform .rotate').val(     o.rotate );
				$('.toolbox.shadow .shadowBlur').val(    o.shadowBlur    );
				$('.toolbox.shadow .shadowOffsetX').val( o.shadowOffsetX );
				$('.toolbox.shadow .shadowOffsetY').val( o.shadowOffsetY );
				$(".toolbox.shadow .shadowColor").spectrum("set", o.shadowColor);

			},

			toggle : function( item ){

				$('.toolbox.'+item).toggle();

			},

			open : function( item ){

				this.parent.parent.getToolbox(item).open();

			}

		},

		toolbars : {

			init : function(){

				// fonts
				if(designer.fonts && designer.fonts.length)
				{
					$('.toolbar .font').empty();
					for(i in designer.fonts){
						font = designer.fonts[i];
						$('.toolbar .font').append('<option value="'+font.font+'">'+font.title+'</option>');
					}
				}

				// shapes
				if(designer.shapes && designer.shapes.length)
				{
					$('.toolbar.path .shapes').show();
					$('.listOfShapes').empty();
					$('.selectedShape').unbind('click').bind('click',function(){$('.listOfShapes').toggle();});

					shapeDiv = $('<div class="shapeItem" shapeid="-1"></div>');
					$('.listOfShapes').append(shapeDiv);

					for(i in designer.shapes)
					{
						shape = designer.shapes[i];
						shapeDiv = $('<div class="shapeItem" shapeid="'+i+'"></div>');
						shapeSvg = $('<svg xmlns="http://www.w3.org/2000/svg" viewbox="-15 -15 330 330"><path d="'+shape.data+'" /></svg>');
						shapeDiv.append(shapeSvg);
						$('.listOfShapes').append(shapeDiv);
					}

					$('.listOfShapes').append('<div class="clear"></div>');
					$('.shapeItem').click(function( e ){
						shapeId = Number( $(e.target).attr('shapeid') );
						designer.selectedShape = shapeId;
						$('.listOfShapes').hide();
						if(shapeId == -1) {designer.selectedShape = null; $('.selectedShape').empty(); return;}
						$('.selectedShape').empty();
						$('.selectedShape').append('<svg xmlns="http://www.w3.org/2000/svg" viewbox="-15 -15 330 330"><path d="'+designer.shapes[designer.selectedShape].data+'" /></svg>');
					});
				}

				$('#selectAndMove').click(function(){ designer.selectAndMove = $(this).prop('checked'); });
				$('#selectGroup').click(function(){ designer.selectGroup = $(this).prop('checked'); });

				$('.toolbar .link').unbind('click').bind('click',function(){
					$(this).toggleClass('unlinked');
					designer.resizeLinked = !$(this).hasClass('unlinked');
				});

				$('.toolbar input, .toolbar select').unbind('keyup change').bind('keyup change',function( e ){

					if(e.keyCode == 190) {return;} // allow decimal point

					if(e.shiftKey) amount = 10; else amount = 1;
					
					if($(this).attr('data')!='string')
					{
						if (e.keyCode == 37) {} //left
						if (e.keyCode == 38) { $(this).val( Number( $(this).val() ) + amount ) } // up
						if (e.keyCode == 39) {} //right
						if (e.keyCode == 40) { $(this).val( Number( $(this).val() ) - amount ) } // down
					}
					var val = $(this).val();
					if( $(this).attr('type') == 'checkbox' ) val = $(this).prop('checked');
					designer.helpers.updateSelectedObjProp( $(this).attr('class'), val, $(this).attr('data'));
					designer.render();
				});

				$('.toolbarButton.align').click(function(){
					var type = $(this).attr('type');
					designer.functions['align'+type]();
				});

				$('#isAnnular').click(function()
				{
					var isAnnular = $(this).prop('checked'),
						sDegree   = Number($('.startDegree').val()),
						eDegree   = Number($('.endDegree').val()),
						thickness = Number($('.thickness').val());
						
					designer.functions.makeAnnular( isAnnular, sDegree, eDegree, thickness );
					$('.annular').toggle( $(this).prop('checked') );
				});

			},

			update : function( o ){

				$('.toolbar.'+o.type+' .startX').val(      o.startX 	 );
				$('.toolbar.'+o.type+' .startY').val( 	   o.startY 	 );
				$('.toolbar.'+o.type+' .width').val( 	   o.width 		 );
				$('.toolbar.'+o.type+' .height').val( 	   o.height 	 );
				$('.toolbar.'+o.type+' .lineWidth').val(   o.lineWidth 	 );
				$('.toolbar.'+o.type+' .strokeStyle').val( o.strokeStyle );
				$('.toolbar.'+o.type+' .radius').val( 	   o.radius 	 );
				$('.toolbar.'+o.type+' .fill').val( 	   o.fill 		 );

				$('.toolbar.'+o.type+' .font').val(        o.font        );
				$('.toolbar.'+o.type+' .fontSize').val(    o.fontSize    );
				$('.toolbar.'+o.type+' .isBold').prop('checked',   o.isBold   );
				$('.toolbar.'+o.type+' .isItalic').prop('checked', o.isItalic );

				$('.toolbar.'+o.type+' .opacity').val();

				$(".toolbar .fill").spectrum("set", 	   o.fill        );
				$(".toolbar .fillStyle").spectrum("set",   o.fillStyle   );
				$(".toolbar .strokeStyle").spectrum("set", o.strokeStyle );

			}

		},

		sidebars : {

			init : function(){}

		},

		indicator : {

			show : function( message ){

				if(!$('#indicator').length)$('body').append('<div id="indicator"></div>');
				$('#indicator').addClass('animate').html(message).addClass('show');

			},

			hide : function(){
				$('#indicator').removeClass('animate')
							   .addClass('show')
							   .addClass('animate')
							   .removeClass('show');
			}

		}

	}

});