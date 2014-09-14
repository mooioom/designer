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
		    width   : 1024,//$('.stage').width(),
			height  : 320//$('.stage').height()
		});

	},20);
	
});