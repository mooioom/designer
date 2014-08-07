String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

window.getString = function( name ){
	return $('string[resource="'+name+'"]').attr('value');
}