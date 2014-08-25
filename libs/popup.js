$(document).ready(function(){

	//console.log('popup ready');

	/*
	** Popup Class
	** -----------

	example usage : popup = new Popup(data)

	data = {

		header 	   : (string)	  - text for the header
		content    : (string)	  - text for the content
		action     : (callback)   - callback function for the action | returns (array)
		actionText : (string)	  - action button text ie: save, undo etc.
		closeText  : (string)	  - close button text ie: close, cancel etc.
		enlarge	   : (boolean)    - OPTIONAL enlarges popup
		onLoad     : (function)   - a function to be called once popup is rendered
		enable     : (boolean)    - OPTIONAL keep buttons enabled on click (for further actions)

		inputs	   : [		      - OPTIONAL inputs mode
			{
				label          : (string) 		    - OPTIONAL - input label
				type           : (string)			- input type (title, text, textarea, select, upload, radio)
				varName        : (string)			- returned var name
				longText       : (boolean)			- OPTIONAL - long input text field
				value          : (string)           - OPTIONAL - init value for field
				keyup / change : (callback)         - OPTIONAL - event callbacks
				attributes     : (string)           - OPTIONAL - extra attributes
				unrequired     : (boolean)          - OPTIONAL - exclude from validation
				options : [							- options array - "select" / "radio" types data
					{
						value   : "option value"	- option value
						label   : "option label"	- option label
						default : (boolean)			- OPTIONAL - "radio" default option
					} ...
				],
			}
		],

		list       : [            - OPTIONAL list mode
			{
				label : (string)                    - list item label
				value : (string)                    - list item value
			} ...
		]

	}

	Methods : 

	Popup.close 		  - closes the popup
	Popup.content("...")  - changes the popup content text

	*/

	function Popup(data){ return this.init(data); }

	Popup.prototype = {

		init : function(data)
		{

			$('.popup').removeClass('transparent');

			if(data.transparent) $('.popup').addClass('transparent');
			if(data.preloader)   $('.popup').addClass('preloader');

			$('.popupInner').removeClass('enlarge');
			$('.popupContent').empty();
			$('.popup, .popupContent').show();
			$('.popupButtonA, .popupButtonB, .popupLoading, .popupButtons, .popupContentInput').hide();
			$('#popupInput').val('');
			$('.popupButton').unbind('click').removeClass('disabled');
			$('.popupHeader').html(data.header);

			// modes
			if(data.inputs) this.inputsMode( data );
			else if(data.list) this.listMode( data );
			else $('.popupContent').html( data.content );

			//actions
			if(data.action) this.actions( data );

			if(data.closeText)
			{
				$('.popupButtonB, .popupButtons').show();
				$('.popupButtonB').click(function(){ $('.popup').hide(); });
				$('.popupButtonB').html(data.closeText);
			}

			if(data.enlarge) $('.popupInner').addClass('enlarge');

			if(data.onLoad) data.onLoad();

			this.data = data;

		},

		close    : function(){ 
			$('.popupListInput').hide();
			$('.popup').attr('class','popup');
			$('.popupContent div').unbind('click');
			$('.popup').hide(); 
		},

		content  : function(newContent){ $('.popupContent').html(newContent); },

		inputsMode : function( data )
		{

			$('.popupContent').hide();
			$('.popupContentInput').empty().show();

			for(i in data.inputs)
			{

				var item         = data.inputs[i],
					inputsHolder = $('.popupContentInput'),
					inputLabel   = item.label,
					inputType    = item.type,
					inputOptions = item.options;
					
				if(inputType=='upload') data.upload = true;
				
				textClass = "text";
				if(item.longText) textClass = "longtext";

				attributes = 'popupItem="true"';
				if(item.varName)    attributes += ' v='+item.varName;
				if(item.value)      attributes += ' value="'+item.value+'"';
				if(item.attributes) attributes += ' '+item.attributes;
				if(!inputLabel)     attributes += ' style="width:100%;"';

				if(!item.unrequired)
				{
					required   =  'required="required"';
					attributes += " "+required;
				}
				
				switch(inputType)
				{
				case "title" :
					inputsHolder.append('<div class="popupLabelTitle">'+inputLabel+'</div>');
					break;
				case "text" :
					inputsHolder.append('<div class="popupLabel">'+inputLabel+'</div>');
					inputsHolder.append('<input '+attributes+' type="text" class="popupInput '+textClass+'" />');
					break;
				case "textarea" :
					inputsHolder.append('<div class="popupLabel">'+inputLabel+'</div>');
					inputsHolder.append('<textarea '+attributes+' ></textarea>');
					break;
				case "select" :
					inputsHolder.append('<div class="popupLabel">'+inputLabel+'</div>');
					inputsHolder.append('<select '+attributes+' class="popupInput select"></select>');
					for(x in inputOptions)
					{
						var selected    = "",
							optionValue = inputOptions[x].value,
							optionLabel = inputOptions[x].label;
						if(item.selected && item.selected == optionValue) selected = "selected";
						$('.popupContentInput select[v="'+item.varName+'"]').append('<option value="'+optionValue+'" '+selected+'>'+optionLabel+'</option>');
					}
					break;
				case "radio" :
					this.hasRadio = item.varName;
					inputsHolder.append('<div class="popupLabel">'+inputLabel+'</div>');
					inputsHolder.append('<div class="clear"></div>');
					for(x in inputOptions)
					{
						optionValue   = inputOptions[x].value,
						optionLabel   = inputOptions[x].label;
						optionDefault = '';
						if(inputOptions[x].default) optionDefault = 'selected';
						inputsHolder.append('<div '+attributes+' radioval="'+optionValue+'" class="popupRadioOption '+optionDefault+'">'+optionLabel+'</div>')
					}
					$('.popupRadioOption').unbind('click').bind('click',function(){
						$('.popupRadioOption').removeClass('selected');
						$(this).addClass('selected');
					});
					break;
				case "upload" :
					inputsHolder.append('<input '+attributes+' type="file" id="dataFilePopup" name="dataFilePopup">');
					inputsHolder.append('<div class="popupLabel break">'+inputLabel+'</div>');
					inputsHolder.append('<div class="popupUploadContainer left"></div>');
					inputsHolder.append('<div class="popupUploadSelect right">Select File...</div>');
					inputsHolder.append('<div class="clear"></div>');
					inputsHolder.append('<div class="popupUploadProgress hidden"></div>');
					break;
				}
				$('*[v='+item.varName+']').unbind('change keyup');
				$('*[v='+item.varName+']').bind('change keyup',$.proxy(function( e )
				{
					this.checkRequired();
					target = $(e.target);
					varName = target.attr('v');
					for(x in data.inputs)
					{
						if(data.inputs[x].varName && data.inputs[x].varName == varName)
						{
							if(data.inputs[x].keyup) data.inputs[x].keyup(e);
							if(data.inputs[x].change) data.inputs[x].change(e);
						}
					}
				},this));
				if(!inputLabel) $('.popupLabel', inputsHolder).remove();
				inputsHolder.append('<div class="clear"></div>');
			}
			if(data.upload)
			{
				$(".popupUploadSelect").click(function(){ $("#dataFilePopup").click(); });
				$("#dataFilePopup").change($.proxy(function(e)
				{
					str = $("#dataFilePopup").val();
					$('.popupUploadContainer').html(str);
					this.checkRequired();
				},this));
			}
		},

		checkRequired : function()
		{
			enable = true;
			$('*[popupitem]').each(function(){
				if($(this).attr('required')=='required')
				{
					if($(this).is("input")    && $(this).val() == '' )  enable = false;
					if($(this).is("textarea") && $(this).val() == '' )  enable = false;
					if($(this).is("select")   && $(this).val() == "0" ) enable = false;
				}
			})
			if(enable) $('.popupButtonA').removeClass('disabled'); else $('.popupButtonA').addClass('disabled');
		},

		listMode : function( data )
		{
			$('.popupListInput').show();
			$('#popupListInput').val('');
			$('.popup').addClass('list');
			for(i in data.list) $('.popupContent').append('<div value="'+data.list[i].value+'">'+data.list[i].label+'</div>');
			$('.popupContent div').click(function(){
				if(!$(this).hasClass('selected')) $(this).addClass('selected');
				else $(this).removeClass('selected');					
			});
			$('#popupListInput').keyup(function()
			{
				var q = $(this).val(),
					q = q.toLowerCase();
				$('.popupContent div').each(function(){
					if(!$(this).hasClass('selected')) $(this).remove();
				});
				for(i in data.list)
				{
					flag = false;
					$('.popupContent div').each(function(){
						if($(this).attr('value') == data.list[i].value) flag = true; 
					});
					if(!flag && (data.list[i].label.toLowerCase().indexOf(q) != -1)) 
						$('.popupContent').append('<div value="'+data.list[i].value+'">'+data.list[i].label+'</div>');
				}
				$('.popupContent div').unbind('click');
				$('.popupContent div').click(function(){
					if(!$(this).hasClass('selected')) $(this).addClass('selected');
					else $(this).removeClass('selected');					
				});
			});
			$('#popupListInput').focus();
		},

		actions : function( data )
		{
			$('.popupButtonA, .popupButtons').show();
			$('.popupButtonA').html(data.actionText);
			$('.popupButtonA').click($.proxy(function(){
				$('.popupLoading').show();
				if(!this.data.enable) $('.popupButton').addClass('disabled');
				if(data.upload)
				{
					ret = [];
					var fileInput = document.getElementById('dataFilePopup'),
						file 	  = fileInput.files[0],
						formData  = new FormData();
					formData.append('file', file);
					for(i in data.inputs) 
						if(data.inputs[i].type == 'upload')
							ret[data.inputs[i].varName] = formData;
					$('.popupContentInput input').each(function(){
						for(i in data.inputs) 
							if($(this).attr('v') == data.inputs[i].varName && $(this).attr('type') != 'file')
								ret[data.inputs[i].varName] = $(this).val();
					});
					if(data.vars) for(i in data.vars) ret[data.vars[i].varName] = data.vars[i].data;
					data.action(ret);
				}
				else if(data.inputs)
				{ 
					var ret = [];
					$('*[popupitem]').each(function(){
						ret[$(this).attr('v')] = $(this).val();
					});
					if(data.vars) for(i in data.vars) ret[data.vars[i].varName] = data.vars[i].data;
					if(this.hasRadio) ret[this.hasRadio] = $('.popupRadioOption.selected').attr('radioval');
					data.action(ret);
				}
				else if(data.list)
				{
					var selecteds = [];
					$('.popupContent div').each(function(){
						if($(this).hasClass('selected')) selecteds.push({
							value : $(this).attr('value'),
							title : $(this).html()
						});
					})
					data.action(selecteds);
				}
				else
				{
					 data.action();
				}
			},this));
		}
	}

	var popupHtml =
	'<div class="popup">'+
        '<div class="popupInner">'+
            '<div class="popupHeader"></div>'+
            '<div class="popupContent"></div>'+
            '<div class="popupContentInput hidden"></div>'+
            '<div class="popupButtons">'+
                '<div class="popupButton popupButtonA">Save</div>'+
                '<div class="popupButton popupButtonB">Cancel</div>'+
                '<div class="popupLoading hidden">Please wait...</div>'+
                '<div class="popupListInput hidden">'+
                    '<input id="popupListInput" type="text" placeholder="Search..." />'+
                '</div>'+
                '<div class="clear"></div>'+
            '</div>'+
        '</div>'+
        '<div class="middle"></div>'+
    '</div>';

	$('body').prepend(popupHtml);

	window.Popup = Popup;

});