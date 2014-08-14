//@ sourceURL=templateEditor.js

console.log('templateEditor',editor);

$('.toolbar.text .clear').remove();
$('.toolbar.text').append('<div class="item">'+getString('dynamicField')+' : <select id="dynamicFields"></select></div>');
$('.toolbar.text').append('<div class="clear"></div>');

// get dynamic dynamicFields - << API

dynamicFields = [
	{ label : 'Title : User Name', value : 'titleUserName', display : 'User Name' },
	{ label : 'Value : User Name', value : 'valueUserName', display : '<userName>' },
	{ label : 'Title : User Address', value : 'titleAddress', display : 'Address' },
	{ label : 'Value : User Address', value : 'valueUserAddress', display : '<userAddress>' },
	{ label : 'Title : Serial Number', value : 'titleSerialNumber', display : 'Serial Number' },
	{ label : 'Value : Serial Number', value : 'valueSerialNumber', display : '<serialNumber>' },
	{ label : 'Title : Meter Number', value : 'titleMeterNumber', display : 'Meter Number' },
	{ label : 'Value : Meter Number', value : 'valueMeterNumber', display : '<meterNumber>' },
	{ label : 'Title : Bill Period', value : 'titleBillPeriod', display : 'Bill Period' },
	{ label : 'Value : Bill Period', value : 'valueBillPeriod', display : '<billPeriod>' }
]

// --- end of stub

for(i in dynamicFields){

	field = dynamicFields[i];
	$('#dynamicFields').append('<option data="'+field.value+'" value="'+field.display+'">'+field.label+'</option>');

}

$('#dynamicFields').change(function(){

	if(editor.selecteds.length)
	{
		editor.selecteds[0].text = $(this).val();
		editor.redraw();
	}

})