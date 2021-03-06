{
	var _n_ = ((1234.5).toLocaleString());
    ko.extenders.thousandsSeparator = _n_.toLocaleString().substring(1, 2);
    ko.extenders.decimalSeparator   = _n_.toLocaleString().substring(5, 6);
}


function number_format(number, decimals, dec_point, thousands_sep) {
  //  discuss at: http://phpjs.org/functions/number_format/
  // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: davook
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Theriault
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Michael White (http://getsprink.com)
  // bugfixed by: Benjamin Lupton
  // bugfixed by: Allan Jensen (http://www.winternet.no)
  // bugfixed by: Howard Yeend
  // bugfixed by: Diogo Resende
  // bugfixed by: Rival
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  //  revised by: Luke Smith (http://lucassmith.name)
  //    input by: Kheang Hok Chin (http://www.distantia.ca/)
  //    input by: Jay Klehr
  //    input by: Amir Habibi (http://www.residence-mixte.com/)
  //    input by: Amirouche
  //   example 1: number_format(1234.56);
  //   returns 1: '1,235'
  //   example 2: number_format(1234.56, 2, ',', ' ');
  //   returns 2: '1 234,56'
  //   example 3: number_format(1234.5678, 2, '.', '');
  //   returns 3: '1234.57'
  //   example 4: number_format(67, 2, ',', '.');
  //   returns 4: '67,00'
  //   example 5: number_format(1000);
  //   returns 5: '1,000'
  //   example 6: number_format(67.311, 2);
  //   returns 6: '67.31'
  //   example 7: number_format(1000.55, 1);
  //   returns 7: '1,000.6'
  //   example 8: number_format(67000, 5, ',', '.');
  //   returns 8: '67.000,00000'
  //   example 9: number_format(0.9, 0);
  //   returns 9: '1'
  //  example 10: number_format('1.20', 2);
  //  returns 10: '1.20'
  //  example 11: number_format('1.20', 4);
  //  returns 11: '1.2000'
  //  example 12: number_format('1.2000', 3);
  //  returns 12: '1.200'
  //  example 13: number_format('1 000,50', 2, '.', ' ');
  //  returns 13: '100 050.00'
  //  example 14: number_format(1e-8, 8, '.', '');
  //  returns 14: '0.00000001'

  number = (number + '')
    .replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}

ko.extenders.decimal = function (target, options) {

	//	default options
	options	=	$.extend({
		decimals:           2,
		decimalSeparator:   ko.extenders.decimalSeparator,
		thousandsSeparator: ko.extenders.thousandsSeparator,
		nullable:           true,
		percent: 			false
	}, options);
	
	// if (options.thousandsSeparator == null) {
	// 	options.thousandsSeparator = ko.extenders.thousandsSeparator;
	// }

	// if (options.decimalSeparator == null) {
	// 	options.decimalSeparator = ko.extenders.decimalSeparator;
	// }

	target.decimal = ko.computed({
		owner: this,
		read: function() {
			var t = target();

			if ($.isNumeric(t)) {
				return options.percent ? number_format(t * 100, options.decimals, options.decimalSeparator, options.thousandsSeparator) : number_format(t, options.decimals, options.decimalSeparator, options.thousandsSeparator);
			} else {
				if (options.nullable)
					return '';
				else
					return number_format(0, options.decimals, options.decimalSeparator, options.thousandsSeparator);
			}
		},
		write: function(v) {
			v = v.replace(options.thousandsSeparator, '');
			v = v.replace(options.decimalSeparator, '.');
			var t = parseFloat(v);
			var value;
			if ($.isNumeric(t)) {
				t     = options.percent ? t / 100 : t;
				value = t.toFixed(options.decimals + options.percent ? 2 : 0); 
			} else {
				if (options.nullable)
					value = '';
				else
					value = 0;
			}
			
			if (target() !== value) {
				target(value);
			} else {
				target.display.notifySubscribers(value);
			}
		}
	})
	
	target.clear = function() {
		if (options.nullable)
			target(null);
		else
			target(0);
	}
	

	target.display = target.decimal;
	return target;
}


ko.extenders.percent = function (target, options) {

	//	default options
	options	=	$.extend({
		decimals:           0,
		nullable:           true,
		thousandsSeparator: null,
		decimalSeparator:   null
	}, options);

	target.percent = ko.computed({
		owner: target,
		read: function() {
			var t = target();
			if (t != null && t != undefined && t != '')
				return number_format(t * 100, options.decimals, options.decimalSeparator, options.thousandsSeparator);
			else {
				if (options.nullable)
					return '';
				else
					return 0;
			}
		},
		write: function(v) {
			v = v.replace(options.thousandsSeparator, '');
			v = v.replace(options.decimalSeparator, '.');
			var t = parseFloat(v);
			if (t != null && t != undefined && t != '')
				target(v / 100);
			else {
				if (options.nullable)
					target(null);
				else
					target(0);
			}
		}
	})
	
	target.clear = function() {
		target(null);
	}
	
	target.display = target.percent;
	return target;
}