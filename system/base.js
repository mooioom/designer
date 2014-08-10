
var editor = editor || {};

$.extend( true, editor, {

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
			},

			text : {
				text          : 'Hello Canvas',//getString('HelloCanvas'),
				color         : '#000',
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
			}

		},

		resizeLinked : true,
		actionPointSize : 5,

		onResize : false,
		onRotate : false,

		rotateStartAngle : 0,
		transformClone   : {}

	}

})