String.prototype.capitalize = function() {return this.charAt(0).toUpperCase() + this.slice(1);}
window.getString = function( name ){return $('string[resource="'+name+'"]').attr('value');}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

jQuery.fn.outerHTML = function(s) {return s ? this.before(s).remove() : jQuery("<p>").append(this.eq(0).clone()).html();};
window.getParams = function(){

  var urlParams,
      match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = window.location.search.substring(1);

  urlParams = {};
  while (match = search.exec(query))
     urlParams[decode(match[1])] = decode(match[2]);

  return urlParams;

}