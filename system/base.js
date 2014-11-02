
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

	color1 : 'black',
	color2 : 'white',

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

	fonts : [
		{ font : 'arial',         	title : 'Arial' },
		{ font : 'arial black',   	title : 'Arial Black' },
		{ font : 'comic sans ms', 	title : 'Comic Sans Ms' },
		{ font : 'courier', 		title : 'Courier' },
		{ font : 'cursive', 		title : 'Cursive' },
		{ font : 'fantasy', 		title : 'Fantasy' },
		{ font : 'georgia', 		title : 'Georgia' },
		{ font : 'helvetica', 		title : 'Helvetica' },
		{ font : 'impact', 			title : 'Impact' },
		{ font : 'lucida console', 	title : 'Lucida Console' },
		{ font : 'marlett', 		title : 'Marlett - Symbols' },
		{ font : 'mekanik let', 	title : 'Mekanik Let' },
		{ font : 'monospace', 		title : 'Monospace' },
		{ font : 'sans-serif', 		title : 'Sans Serif' },
		{ font : 'symbol', 			title : 'Symbol' },
		{ font : 'tahoma', 			title : 'Tahoma' },
		{ font : 'times new roman', title : 'Times New Roman' },
		{ font : 'trebuchet ms', 	title : 'Trebuchet ms' },
		{ font : 'verdana', 		title : 'Verdana' },
		{ font : 'webdings', 		title : 'Webdings' },
		{ font : 'wingdings', 		title : 'Wingdings' }
	],

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
			title : 'Right Triagle',
			data  : 'm1,299l0,-298l298,298z'
		},
		{
			title : 'Diamond',
			data  : 'm228.23334,205.75699c-12.96465,-22.71989 -62.74901,-33.9996 -160.88079,-36.45064l-66.35706,-1.65739l0,-19.88501l0,-19.88482l50.08599,0c59.04541,0 101.26503,-4.08251 135.71376,-13.12332c20.32901,-5.33509 27.0845,-8.73719 36.27359,-18.26725l11.29199,-11.71121l32.38853,32.49907l32.38852,32.49925l-32.75113,32.72415l-32.75122,32.72433l-5.40219,-9.46716z'
		},
		{
			title : 'Pentagon',
			data  : 'm0.99791,0.9981l162.54547,0l135.45454,149.40899l-135.45454,149.40898l-162.54547,0z'
		},
		{
			title : 'Hexagon',
			data  : 'm1,149.99944l63.85715,-127.71428l170.28572,0l63.85713,127.71428l-63.85713,127.71428l-170.28572,0l-63.85715,-127.71428z'
		},
		{
			title : 'Septagon',
			data  : 'm0.99917,191.06511l29.51249,-127.7108l119.48833,-56.83673l119.48836,56.83673l29.51303,127.7108l-82.69087,102.41679l-132.62103,0l-82.69031,-102.41679z'
		},
		{
			title : 'Arrow Up',
			data  : 'm1.49805,149.64304l148.50121,-148.00241l148.50121,148.00241l-74.25061,0l0,148.71457l-148.5012,0l0,-148.71457z'
		},
		{
			title : 'Smiley',
			data  : 'm68.49886,214.78838q81.06408,55.67332 161.93891,0m-144.36983,-109.9558c0,-8.60432 6.97517,-15.57949 15.57948,-15.57949c8.60431,0 15.57948,6.97517 15.57948,15.57949c0,8.60431 -6.97517,15.57947 -15.57948,15.57947c-8.60431,0 -15.57948,-6.97516 -15.57948,-15.57947m95.83109,0c0,-8.60432 6.97517,-15.57949 15.57948,-15.57949c8.60431,0 15.57947,6.97517 15.57947,15.57949c0,8.60431 -6.97516,15.57947 -15.57947,15.57947c-8.60429,0 -15.57948,-6.97516 -15.57948,-15.57947m-181.89903,44.73038l0,0c0,-82.60133 66.96162,-149.56296 149.56296,-149.56296c82.60135,0 149.56296,66.96162 149.56296,149.56296c0,82.60135 -66.96161,149.56296 -149.56296,149.56296c-82.60133,0 -149.56296,-66.96161 -149.56296,-149.56296zm0,0l0,0c0,-82.60133 66.96162,-149.56296 149.56296,-149.56296c82.60135,0 149.56296,66.96162 149.56296,149.56296c0,82.60135 -66.96161,149.56296 -149.56296,149.56296c-82.60133,0 -149.56296,-66.96161 -149.56296,-149.56296z'
		},
		{
			title : 'Baloon 1',
			data  : 'm0.99786,35.96579l0,0c0,-19.31077 15.28761,-34.96524 34.14583,-34.96524l15.52084,0l0,0l74.50001,0l139.68748,0c9.05606,0 17.74118,3.68382 24.14478,10.24108c6.40356,6.55726 10.00107,15.45081 10.00107,24.72416l0,87.41311l0,0l0,52.44785l0,0c0,19.31078 -15.2876,34.96524 -34.14584,34.96524l-139.68748,0l-97.32507,88.90848l22.82506,-88.90848l-15.52084,0c-18.85822,0 -34.14583,-15.65446 -34.14583,-34.96524l0,0l0,-52.44785l0,0z'
		},
		{
			title : 'Cloud',
			data  : 'm182.05086,34.31005c-0.64743,0.02048 -1.27309,0.07504 -1.92319,0.13979c-10.40161,1.03605 -19.58215,7.63722 -24.24597,17.4734l-2.47269,7.44367c0.53346,-2.57959 1.35258,-5.08134 2.47269,-7.44367c-8.31731,-8.61741 -19.99149,-12.59487 -31.52664,-10.72866c-11.53516,1.8662 -21.55294,9.3505 -27.02773,20.19925c-15.45544,-9.51897 -34.72095,-8.94245 -49.62526,1.50272c-14.90431,10.44516 -22.84828,28.93916 -20.43393,47.59753l1.57977,7.58346c-0.71388,-2.48442 -1.24701,-5.01186 -1.57977,-7.58346l-0.2404,0.69894c-12.95573,1.4119 -23.58103,11.46413 -26.34088,24.91708c-2.75985,13.45294 2.9789,27.25658 14.21789,34.21291l17.54914,4.26352c-6.1277,0.50439 -12.24542,-0.9808 -17.54914,-4.26352c-8.66903,9.71078 -10.6639,24.08736 -4.94535,35.96027c5.71854,11.87289 17.93128,18.70935 30.53069,17.15887l7.65843,-2.02692c-2.46413,1.0314 -5.02329,1.70264 -7.65843,2.02692c7.15259,13.16728 19.01251,22.77237 32.93468,26.5945c13.92217,3.82214 28.70987,1.56322 41.03957,-6.25546c10.05858,15.86252 27.91113,24.19412 45.81322,21.38742c17.90208,-2.8067 32.66954,-16.26563 37.91438,-34.52742l1.82016,-10.20447c-0.27254,3.46677 -0.86394,6.87508 -1.82016,10.20447c12.31329,8.07489 27.80199,8.52994 40.52443,1.18819c12.72244,-7.34175 20.6609,-21.34155 20.77736,-36.58929l-4.56108,-22.7823l-17.96776,-15.41455c13.89359,8.70317 22.6528,21.96329 22.52884,38.19685c16.5202,0.17313 30.55292,-13.98268 36.84976,-30.22897c6.29684,-16.24631 3.91486,-34.76801 -6.2504,-48.68089c4.21637,-10.35873 3.96622,-22.14172 -0.68683,-32.29084c-4.65308,-10.14912 -13.23602,-17.69244 -23.55914,-20.65356c-2.31018,-13.45141 -11.83276,-24.27162 -24.41768,-27.81765c-12.58492,-3.54603 -25.98557,0.82654 -34.41142,11.25287l-5.11707,8.63186c1.30753,-3.12148 3.01521,-6.03101 5.11707,-8.63186c-5.93959,-8.19432 -15.2556,-12.8181 -24.96718,-12.51096z'
		},
		{
			title : 'Cylinder',
			data  : 'm299.0007,83.77844c0,18.28676 -66.70958,33.11111 -149.00002,33.11111m149.00002,-33.11111l0,0c0,18.28676 -66.70958,33.11111 -149.00002,33.11111c-82.29041,0 -148.99997,-14.82432 -148.99997,-33.11111m0,0l0,0c0,-18.28674 66.70956,-33.1111 148.99997,-33.1111c82.29044,0 149.00002,14.82436 149.00002,33.1111l0,132.44449c0,18.28674 -66.70958,33.11105 -149.00002,33.11105c-82.29041,0 -148.99997,-14.82431 -148.99997,-33.11105z'
		},
		{
			title : 'Page',
			data  : 'm249.3298,298.99744l9.9335,-39.73413l39.73413,-9.93355l-49.66763,49.66768l-248.33237,0l0,-298.00001l298.00001,0l0,248.33234'
		},
		{
			title : 'Thought',
			data  : 'm12,1c-6.094,0 -11,4.906 -11,11l0,147c0,6.09399 4.906,11 11,11l49.15625,0c-2.03143,2.32526 -3.15625,4.84886 -3.15625,7.5c0,11.32597 20.36188,20.5 45.5,20.5c25.13812,0 45.5,-9.17403 45.5,-20.5c0,-2.65114 -1.12482,-5.17474 -3.15625,-7.5l142.15625,0c6.09399,0 11,-4.90601 11,-11l0,-147c0,-6.094 -4.90601,-11 -11,-11l-276,0zm54,199c-13.81215,0 -25,5.37016 -25,12c0,6.62984 11.18785,12 25,12c13.81216,0 25,-5.37016 25,-12c0,-6.62984 -11.18784,-12 -25,-12zm-25,30c-7.73481,0 -14,4.02762 -14,9c0,4.97238 6.26519,9 14,9c7.73481,0 14,-4.02762 14,-9c0,-4.97238 -6.26519,-9 -14,-9zm-24,22c-4.97238,0 -9,2.23756 -9,5c0,2.76242 4.02762,5 9,5c4.97238,0 9,-2.23758 9,-5c0,-2.76244 -4.02762,-5 -9,-5z'
		},
		{
			title : 'Corners',
			data  : 'm78.29672,150l-55.17469,-55.1747l0,27.58735l-22.12203,0l0,-121.41265l121.41265,0l0,22.12203l-27.58736,0l55.17471,55.17471l55.17471,-55.17471l-27.58736,0l0,-22.12203l121.41264,0l0,121.41265l-22.12204,0l0,-27.58735l-55.1747,55.1747l55.1747,55.17471l0,-27.58736l22.12204,0l0,121.41264l-121.41264,0l0,-22.12204l27.58736,0l-55.17471,-55.17468l-55.17471,55.17468l27.58736,0l0,22.12204l-121.41265,0l0,-121.41264l22.12203,0l0,27.58736l55.17469,-55.17471z'
		},
		{
			title : 'Dotted',
			data  : 'm164.76302,54.29618c-12.89404,-14.08136 13.13254,-37.91006 24.83243,-21.67826c9.98653,14.06865 -12.21164,31.95572 -24.83243,21.67826zm34.52623,32.04741c-10.53665,-15.50334 18.2944,-32.06738 27.41472,-16.58083c10.82574,16.19412 -18.42853,34.68893 -27.41472,16.58083zm39.30569,38.77469c-13.16362,-8.91086 -0.08168,-29.46533 13.54875,-27.63215c18.93346,2.88981 13.87328,34.44158 -4.59297,32.89478c-3.58466,-0.41574 -6.77832,-2.45136 -8.95578,-5.26263zm32.87781,34.23642c-11.00845,-13.99648 14.37656,-32.37918 25.04797,-19.05171c11.60712,14.82527 -14.29718,34.39392 -25.04797,19.05171zm-63.84386,0.7675c-12.23796,-11.58463 5.72536,-30.30273 19.24007,-25.41679c19.63696,6.28566 5.03751,36.50668 -12.48737,29.64096c-2.41074,-1.14194 -4.56958,-2.71278 -6.7527,-4.22417zm-52.05359,0c-14.38365,-13.43323 11.89731,-35.50046 24.20743,-21.44815c12.48965,14.64734 -10.94827,35.43011 -24.20743,21.44815zm-51.41751,-0.7675c-11.01524,-13.99239 14.38364,-32.38554 25.04439,-19.04626c11.57417,14.84886 -14.25791,34.38168 -25.04439,19.04626zm-48.97159,0.7675c-14.38364,-13.43323 11.89733,-35.50046 24.20746,-21.44815c12.48962,14.64734 -10.94829,35.43011 -24.20746,21.44815zm-51.41319,-0.75569c-12.62148,-16.51503 21.51373,-34.53826 27.20482,-13.82039c4.20761,13.86485 -18.57945,25.93829 -27.20482,13.82039zm232.73729,36.71002c-12.26451,-12.7252 9.54947,-34.95583 22.63777,-23.37347c16.16324,11.53831 -5.25334,38.27226 -20.09267,25.93422c-0.83693,-0.86462 -1.69453,-1.70929 -2.5451,-2.56075zm-37.22105,31.5554c-10.33875,-14.74719 16.53384,-30.93315 26.24101,-17.10368c12.66234,14.69044 -12.76988,34.70573 -24.48114,20.0298l-1.75987,-2.92612zm-33.2933,39.2449c-11.17,-10.21844 4.17313,-26.31229 16.33257,-23.575c18.50797,4.77472 6.84483,34.45702 -10.13109,28.82402c-2.6304,-0.90369 -4.76476,-2.91159 -6.20148,-5.24902z'
		},
		{
			title : 'Hand',
			data  : 'm136.98543,214.15889c-14.70618,-5.74251 -4.62521,-24.05643 -14.3905,-33.27538c-12.96347,-7.75244 -2.12349,-24.16507 -12.57821,-33.28812c-7.48801,-6.64952 -5.24203,-16.62421 -3.67915,-25.18983c-29.75101,-0.23549 -59.53337,0.62366 -89.25697,-0.78464c-15.11522,1.28053 -20.03182,-18.26941 -12.80666,-28.85114c7.00419,-11.24166 21.87759,-8.31262 33.12609,-9.4029c64.97946,-0.76864 129.97618,-0.61134 194.95673,0.02921c17.26189,0.80067 37.01695,-1.19489 50.6566,11.68779c16.24808,15.16693 16.0166,39.34441 16.04852,59.94771c-0.42267,19.21857 -2.90109,42.02173 -20.4863,53.46951c-16.36914,10.95175 -36.93741,7.66907 -55.55533,8.62302c-27.94264,-0.30014 -56.07063,1.04456 -83.86891,-2.2673l-2.16592,-0.69792l0,0zm69.33224,-10.55814c9.631,-11.23128 -3.5211,-20.50227 -14.65393,-17.55965c-16.14473,-0.10535 -32.65453,-1.7021 -48.52592,1.75482c-13.67432,5.19589 -4.85582,21.54512 7.46478,18.25877c18.04872,1.02443 36.47603,1.82143 54.28616,-1.68709l1.42891,-0.76686zm65.93199,-2.17656c15.66348,-8.69865 15.78064,-28.60548 16.25079,-44.24881c-0.34195,-16.50655 1.70639,-34.58434 -7.04581,-49.36581c-7.23798,-10.84158 -20.71933,-14.52557 -33.13705,-14.12024c-23.36646,0.0377 -47.0793,-1.82723 -70.16504,2.52512c-15.66467,3.36275 -22.23152,20.93031 -23.45795,35.19015c-0.48341,13.80043 -1.82124,28.00842 1.22505,41.56039c7.24641,5.02983 15.89499,-9.13847 19.17191,-15.4227c4.31766,-11.67575 -0.61995,-26.25061 8.10953,-36.19362c8.72269,-9.46424 24.96402,-8.53419 32.52521,1.88722c8.3812,9.23244 -0.48325,21.69592 1.82307,32.51563c4.15211,9.93069 -0.70021,19.45959 -0.85791,28.5067c4.13835,6.87068 2.87872,15.02933 1.61143,22.50597c16.21062,-0.57724 32.86133,1.70529 48.65034,-2.71872c1.84845,-0.69202 3.61401,-1.59238 5.29642,-2.62128zm-126.53741,-35.9437c2.18771,-13.69858 -18.65493,-12.59653 -20.49308,-1.57007c-4.38604,12.23279 17.61123,15.56906 20.78048,7.03215c0.03699,-1.82657 -0.14053,-3.64476 -0.2874,-5.46208zm62.45076,0.42249c1.41585,-11.79691 -20.5592,-11.91444 -24.75133,-3.63126c-2.34377,5.03215 -10.03961,15.25429 1.13329,12.59268c7.54675,-1.70357 25.12254,3.75204 23.61804,-8.96143zm-62.44263,-31.11197c-0.75351,-2.94205 3.03209,-10.28735 -1.13232,-9.92064c-9.20967,1.01493 -19.08115,-0.45296 -27.70964,3.18962c-7.77171,10.63712 5.24397,21.0274 15.9218,17.53934c7.79146,0.11475 13.91219,-1.24452 12.92017,-10.80832zm61.0041,7.53122c8.85812,-9.53879 -4.95708,-21.9593 -14.94496,-15.6684c-10.39732,5.40628 -7.29182,25.10663 6.58635,19.17703c2.96956,-0.54494 6.1384,-1.30057 8.35861,-3.50864zm-53.18405,-38.39041c2.00339,-3.50816 4.00681,-7.01634 6.01019,-10.52453c-44.99024,0.24061 -90.00227,-0.61648 -134.97418,0.73022c-12.21447,-3.32573 -22.07768,15.22181 -6.82234,18.35822c24.02138,3.10667 48.39057,1.52395 72.56345,1.97845c19.07089,-0.00607 38.14179,-0.01187 57.21268,-0.01793c2.0034,-3.50815 4.00681,-7.01634 6.01019,-10.52452z'
		},
		{
			title : 'Frame',
			data  : 'm0,0l300,0l0,300l-300,0zm35,-265l0,230l230,0l0,-230z'
		},
		{
			title : 'Heart',
			data  : 'm150,73c61,-175 300,0 0,225c-300,-225 -61,-400 0,-225z'
		},
		{
			title : 'Star',
			data  : 'm1,116.58409l113.82668,0l35.17332,-108.13487l35.17334,108.13487l113.82666,0l-92.08755,66.83026l35.17514,108.13487l-92.08759,-66.83208l-92.08757,66.83208l35.17515,-108.13487l-92.08758,-66.83026z'
		}
	]

})