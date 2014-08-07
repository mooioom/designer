
var editor = editor || {};

$.extend( true, editor, {

	defaults : {

		name   : "",
		width  : 0,
		height : 0,

		debug : false,

		canvas : null,
		ctx    : null,

		objects   : [],
		resources : [],
		images    : [],

		history : {
			objects   : [],
			selecteds : [],
			index     : 0,
			last      : -1,
		},

		grid : 
		{
			visible     : true,
			snap        : true,
			size 		: 14, //22
			lineWidth 	: 0.1,
			strokeStyle : '#000'
		},

		currentObject   : 0,
		selectedObjects : [],
		tempSelecteds   : [],
		tempObject      : null,
		clipboard		: [],

		mouseX : 0,
		mouseY : 0,

		startMoveX : 0,
		startMoveY : 0,
		movedX     : 0,
		movedY     : 0,

		mouseDown : false,
		drag      : false,

		action : "box", // select, move, rotate, scale, box, line, colorpick etc...

		lineWidth   : 2,
		strokeStyle : 'grey',
		radius      : 0,

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

		defaultText : 
		{
			text          : getString('HelloCanvas'),
			font          : 'Arial',
			fontSize      : 30,
			lineHeight    : 32,
			isItalic      : false,
			isBold        : false,
			stroke        : false,
			strokeStyle   : '#000',
			fillStyle     : '#000',
			shadowColor   : '#000',
			shadowBlur    : 0,
			shadowOffsetX : 0,
			shadowOffsetY : 0,
			selectFeather : 4
		},

		resizeLinked : true,

		actionPointSize : 5,

		onResize : false,
		onRotate : false,

		rotateStartAngle : 0,
		transformClone   : {}

	}

})