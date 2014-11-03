
$.extend( true, designer, {

	ui : {

		tools : {

			init : function(){}

		},

		toolboxs : {

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
						$('.menu',this.el).append('<div class="item fx disabled left">fx</div>');
						$('.menu',this.el).append('<div class="clear"></div>');
					},
					initEvents : function(){

						$(document).on('click', '.toolbox .objectVisible', $.proxy(function( e ){
							e.preventDefault(); e.stopPropagation();
							$(e.target).toggleClass('invisible');
							id = Number($(e.target).parent().attr('objectid'));
							this.parent.functions.getObject(id).visible = !$(e.target).hasClass('invisible');
							this.parent.render();
						},this));

						$(document).on('click', '.toolbox .objectLock',$.proxy(function( e ){
							e.preventDefault(); e.stopPropagation();
							$(e.target).toggleClass('unlocked');
							id = Number($(e.target).parent().attr('objectid'));
							this.parent.functions.getObject(id).locked = !$(e.target).hasClass('unlocked');
							this.parent.render();
						},this));

						$('.delete',this.el).unbind('click').bind('click',$.proxy(function(){ this.parent.functions.delete(); },this));
						$('.shadow',this.el).unbind('click').bind('click',$.proxy(function(){ $('.toolbox.shadow').show(); },this));
						$('.transform',this.el).unbind('click').bind('click',$.proxy(function(){ $('.toolbox.transform').show(); },this));
						$('.add',this.el).unbind('click').bind('click',$.proxy(function(){
							this.parent.create.box(0,0,this.parent.width,this.parent.height);
							this.parent.render(); 
							this.parent.draw.ui();
							this.parent.draw.toolbar();
						},this));

						$('.sortable').multisortable({
							items         : ".objectsItem",
							selectedClass : "selected",
							stop          : $.proxy(function(){ 
								this.parent.draw.reOrderByUi();
								this.toggleOptions();
							},this),
							click         : $.proxy(function(){
								this.parent.draw.reOrderByUi(); 
								this.toggleOptions();
							},this)
						});
					},

					render  : function(){

						//todo :: can be better if renders only the difference of current objects

						if(!this.currentObjects)   this.currentObjects   = $.extend(true,[],this.parent.objects);
						if(!this.currentSelecteds) this.currentSelecteds = $.extend(true,[],this.parent.selecteds);

						else if( 
							this.parent.helpers.equalObjects(this.currentObjects,   this.parent.objects) &&
							this.parent.helpers.equalObjects(this.currentSelecteds, this.parent.selecteds)
						) return;

						$('.body',this.el).empty();
						$('.body',this.el).removeClass('sortable').addClass('sortable');

						//this.parent.helpers.timer('start','objects toolbox :: render');

						for(i in this.parent.objects)
						{
							object = $.extend(true,{},this.parent.objects[i]);
							if(this.parent.helpers.isObjectSelected(object.id)) object.selected = true;
							title = object.type; if(object.src) title = 'image';
							title += ' ' + object.id; if(object.type == 'text') title += ' - ' + object.text;
							title = title.capitalize();
							object.title = title;
							this.prepend('.body','.objectsItem',object);
						}

						//this.parent.helpers.timer('stop','objects toolbox :: render');

						this.toggleOptions();

						this.currentObjects   = $.extend(true,[],this.parent.objects);
						this.currentSelecteds = $.extend(true,[],this.parent.selecteds);

						if( this.autoScrollOnSelect && $('.objectsItem.selected:eq(0)').length ) $('.body',this.el).scrollTop($('.objectsItem.selected:eq(0)').index() * 27 - (27*4));
						
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

							if(!$(event.toElement).hasClass('dropItem')) return;

							var src      = event.toElement.src,
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
							console.log('change');
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
							$('.stage').focus();
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
							$('.stage').focus();
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

					name    : 'fx',
					title   : getString('fx'),
					visible : false,

					render : function(){
						$('.body',this.el).empty();
						$('.body',this.el).append('<div class="item"><textarea id="text"></textarea></div>');
					},

					events : function(){
						$('.toolbox.text #text').bind('keyup change keydown',function(){ designer.functions.changeText( $(this).val() ); });
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
					$('.selectedShape').click(function(){$('.listOfShapes').toggle();});

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