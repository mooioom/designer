/*

Editor by Eldad Levi

Version      : 1.2
Release Date : 15th of Av, 5774 ( 11.8.14 )

*/

$(document).ready(function()
{

	setTimeout(function()
	{

		editor.init({
			name    : getString("UntitledProject"),
		    width   : 980,
			height  : 253,
			modules : ['templateEditor']
		});

	},20);
	
});