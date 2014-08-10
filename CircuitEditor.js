/*

Editor by Eldad Levi

Version      : 1.10
Release Date : 7rd of Av, 5774 ( 3.8.14 )

*/

$(document).ready(function()
{

	setTimeout(function()
	{

		editor.init({
			name   : getString("UntitledProject"),
		    width  : 980,//$('.stage').width(),
			height : 253//$('.stage').height()
		});

	},20);
	
});