
var editor = editor || {};

$.extend( true, editor, {

	debug : false,

	canvas : null,
	ctx    : null,

	current   : 0,

	objects   : [],
	resources : [],
	images    : [],
	clipboard : [],
	selecteds : [],
	temps     : [],
	temp      : null,
	toolboxes : [],

	action : "box", // select, move, rotate, scale, box, line, colorpick etc...

	selectAndMove : false,

	selectionBox :
	{
		startX 		: null,
		startY 		: null,
		endX   		: null,
		endY   		: null,
		lineWidth 	: 1,
		strokeStyle : '#000'
	},

	selectedBox :
	{
		lineWidth 	: 1,
		strokeStyle : 'grey',
		feather 	: 0
	},

	resizeLinked    : true,

	onResize : false,
	onRotate : false,

	rotateStartAngle : 0,
	transformClone   : {},

	defaults : {

		name   : "",
		width  : 0,
		height : 0,

		grid : 
		{
			visible     : true,
			snap        : true,
			size 		: 14, //22
			lineWidth 	: 0.1,
			strokeStyle : '#000'
		},

		defaults : {

			box : {
				stroke      : '',
				lineWidth   : 2,
				fill  		: '',
				fillStyle   : '',
				strokeStyle : 'grey',
				radius      : 0,
				// addToExportStyle (string) : added inside the 'style' attribute - html export
				// addToExportProps (string) : added to element properties        - html export
				// onExport         (string) : replaces the element               - html export
			},

			text : {
				text          : 'Hello Canvas',
				color         : '#000',
				font          : 'Arial',
				fontSize      : 30,
				lineHeight    : 32,
				lineWidth     : 0,
				isItalic      : false,
				isBold        : false,
				stroke        : false,
				strokeStyle   : '#000',
				fillStyle     : '#000',
				shadowColor   : '#000',
				shadowBlur    : 0,
				shadowOffsetX : 0,
				shadowOffsetY : 0,
				feather       : 4
				// textBefore       (string) : added before the text              - html export
				// textAfter        (string) : added after  the text              - html export
				// addToExportStyle (string) : added inside the 'style' attribute - html export
				// addToExportProps (string) : added to element properties        - html export
				// onExport         (string) : replaces the element               - html export
			},


			displayImageCompressionRate : 0.75

		},

		actionPointSize : 5,


	},

	/* global usage events to be used in modules */

	onLoad 	 	 : function(){},
	onMouseUp    : function(){},
	onMouseDown  : function(){},
	onMouseMove  : function(){},
	onKeyDown    : function(){},
	onKeyUp      : function(){},
	onToolChange : function(){},
	onSelect 	 : function(){},
	onMove   	 : function(){},
	onTextCreate : function(){},
	onBoxCreate  : function(){},
	onRender 	 : function(){},
	onRedraw 	 : function(){}

})