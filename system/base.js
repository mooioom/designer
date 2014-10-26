
var designer = designer || {};

$.extend( true, designer, {

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

	action : "select", // select, move, rotate, scale, box, line, colorpick etc...

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

			actionPoint : {

				size        : 5,
				lineWidth   : 1,
				strokeStyle : '#003300',
				hoverColor  : 'orange'

			},

			actionPointSize : 5,

			displayImageCompressionRate : 0.75

		},

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
	onRedraw 	 : function(){},

	/* pre-made shapes to use with Path tool */

	selectedShape : null,

	shapes    : [
		{
			title : 'Triagle',
			data  : 'm1,280.375l149,-260.75l149,260.75z'
		},
		{
			title : 'Square',
			data  : 'm0,0l300,0l0,300l-300,0zm35,-265l0,230l230,0l0,-230z'
		},
		{
			title : 'Heart',
			data  : 'm150,73c61,-175 300,0 0,225c-300,-225 -61,-400 0,-225z'
		},
		{
			title : 'Star',
			data  : 'm1,116.58409l113.82668,0l35.17332,-108.13487l35.17334,108.13487l113.82666,0l-92.08755,66.83026l35.17514,108.13487l-92.08759,-66.83208l-92.08757,66.83208l35.17515,-108.13487l-92.08758,-66.83026z'
		},
		{
			title : 'Diode',
			data  : 'm1.00059,299.00055l0,-167.62497l0,0c0,-72.00411 58.37087,-130.37499 130.375,-130.37499l0,0l0,0c34.57759,0 67.73898,13.7359 92.18906,38.18595c24.45006,24.45005 38.18593,57.61144 38.18593,92.18904l0,18.625l37.24997,0l-74.49995,74.50002l-74.50002,-74.50002l37.25,0l0,-18.625c0,-30.8589 -25.0161,-55.87498 -55.87498,-55.87498l0,0l0,0c-30.85892,0 -55.875,25.01608 -55.875,55.87498l0,167.62497z'
		}
	]

})