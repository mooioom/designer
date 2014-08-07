
/*

Editor by Eldad Levi

Version      : 1.10
Release Date : 7rd of Av, 5774 ( 3.8.14 )

*/

$(document).ready(function()
{

	function Editor( data ){ return this.init( data ) };
	Editor.prototype = editor;

	/**********************************************************************************************/

	setTimeout(function()
	{

		editor.init({
			name   : getString("UntitledProject"),
		    width  : 980,//$('.stage').width(),
			height : 253//$('.stage').height()
		});

		function resizeCanvas(w,h){
			console.log('resizeCanvas',w,h);
			name = editor.name;
			ce = new Editor({
				name   : name,
				width  : w,
				height : h
			});
			editor.reset();
		}

		/* MAIN MENU */

		// //view
		// $('.mainMenu #grid').click(function(){      $('.toolbox.grid').show(); });
		// $('.mainMenu #objects').click(function(){   $('.toolbox.objects').show(); });
		// $('.mainMenu #resources').click(function(){ $('.toolbox.resources').show(); });

		/* SUB MENU */

		$('#selectAndMove').click(function(){ editor.selectAndMove = $(this).prop('checked'); });

		$('.subMenu .link').click(function(){
			$(this).toggleClass('unlinked');
			editor.resizeLinked = !$(this).hasClass('unlinked');
		})

		$('.subMenu input, .subMenu select').bind('keyup change',function( e ){
			
			if($(this).attr('data')!='string')
			{
				if (e.keyCode == 37) {} //left
				if (e.keyCode == 38) { $(this).val( Number( $(this).val() )+ editor.grid.size ) } // up
				if (e.keyCode == 39) {} //right
				if (e.keyCode == 40) { $(this).val( Number( $(this).val() )- editor.grid.size ) } // down
			}
			var val = $(this).val();
			if( $(this).attr('type') == 'checkbox' ) val = $(this).prop('checked');
			editor.updateSelectedObjProp( $(this).attr('class'), val, $(this).attr('data'));
			editor.render();
		});

		$('.subMenuButton.align').click(function(){
			var type = $(this).attr('type');
			ce['align'+type]();
		});

		/* TOOLBOX */

		$('.toolbox').draggable({ start : function(){ $(this).css('right','initial'); }});
		$('.toolbox .close').click(function(){ $(this).parent().hide(); });

		$(document).on('click', '.toolbox.objects .objectVisible', function () {
			$(this).toggleClass('invisible');
			editor.selectedObjects[0].visible = !$(this).hasClass('invisible');
			editor.render();
		});
		$(document).on('click', '.toolbox.objects .objectLock', function () {
			$(this).toggleClass('unlocked');
			editor.selectedObjects[0].locked = !$(this).hasClass('unlocked');
			editor.render();
		});

		$('.toolbox.objects .toolboxMenu .delete').click( function(){ editor.deleteCurrent(); });
		$('.toolbox.objects .toolboxMenu .add').click( function() { 
			editor.createBox(0,0,editor.width,editor.height);
			editor.render(); 
			editor.drawExternalUi();
			editor.drawSubMenu();
			editor.reOrderByUi( true );
		});

		//grid
		$('.toolbox.grid input[type="text"]').keyup(function(){
			if(!$(this).val()) return;
			editor.grid[$(this).attr('id')] = $(this).val();
			editor.drawGrid();
		});

		$('.toolbox input[type="range"]').change(function(){
			var prop = $(this).attr('class');
			o = editor.selectedObjects[0];
			if( !o ) return;
			if( o.locked || !o.visible ) return;
			o[prop] = $(this).val();
			editor.render();
		});

		$('.toolbox input[type="range"]').mousedown(function(){
			editor.saveHistory();
		});

		$('.toolbox.grid #visible').change(function(){
			editor.grid.visible = $(this).prop('checked');
			editor.drawGrid.apply(ce);
		});

		$('.toolbox.grid #snap').change(function(){
			editor.grid.snap = $(this).prop('checked');
			editor.drawGrid();
		});

		$('.toolboxMenuItem.shadow').click(function(){ $('.toolbox.shadow').show(); });
		$('.toolboxMenuItem.transform').click(function(){ $('.toolbox.transform').show(); });

		//text
		$('.toolbox.text #text').bind('keyup change keydown',function(){ editor.changeText( 	$(this).val() ); });
		$('.toolbox.text #font').bind('change',function(){ 				 editor.changeFont( 	$(this).val() ); });
		$('.toolbox.text #size').bind('keyup change keydown',function(){ editor.changeFontSize( $(this).val() ); });
		$('.toolbox.text #bold'  ).bind('change',function(){ 			 editor.changeBold( 	$(this).prop('checked') ); });
		$('.toolbox.text #italic').bind('change',function(){ 			 editor.changeItalic( 	$(this).prop('checked') ); });


		//color picker
		function initSpectrum( el )
		{
			var s = function( color ){
				if(!editor.selectedObjects.length) return;
		    	str = color ? color.toRgbString() : ""; 
		    	editor.selectedObjects[0][el] = str;
		    	$("."+el).val( str );
		    	editor.render();
			}
			$("." + el).spectrum({
			    allowEmpty : true,
			    showAlpha  : true,
			    move   : function( color ){ s( color ) },
			    change : function( color ){ s( color ) }
			}).on("dragstart.spectrum", function(e, color) {
				editor.saveHistory();
			});
		}

		initSpectrum('fill');
		initSpectrum('strokeStyle');
		initSpectrum('fillStyle');
		initSpectrum('shadowColor');


	    // if (document.addEventListener) 
	    // {
	    //     document.addEventListener('contextmenu', function(e) {
	    //         //alert("You've tried to open context menu"); //here you draw your own menu
	    //         e.preventDefault();
	    //     }, false);
	    // } else {
	    //     document.attachEvent('oncontextmenu', function() 
	    //     {
	    //         //alert("You've tried to open context menu");
	    //         window.event.returnValue = false;
	    //     });
	    // }

	    /*

		TODO : 

		- save currentObject identifier
		- point to resources (do not draw src each time)
		- resources delete
		- scale
		- dynamic properties (text / button)
		- save file name
		- resources drag into object but do not replace image
		- update transform, shadow, text according to selected object
		- select align target
		- canvas size
		- zoom

		BUGS :

		- exporting svg streched images showing original dimentions
		- shadow offset in svg is not correct because of rotation
		- dragging an image into the canvas when big image is not correct
		- debug replaces text in view menu (objects)
		- after canvas resize - image drop is wrong coordinates
		- after canvas resize - clicking on layers renders wrong

		FEATURES :

		- grid before / after canvas ( change z-index and capture click on gridCanvas instead )

		CHANGELOG : 

		3/8/14 - Editor is now modular

	    */

	},20);
	
});