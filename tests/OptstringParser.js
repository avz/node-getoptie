var OptstringParser = require('../src/OptstringParser');

exports.unfold = function(test) {
	var cases = {
		'(abc': 'Optstring syntax error near offset 3 (starting with "c"): Unexpected end of optstring: `)` expected'
		, '': {}
		, '()': 'Optstring syntax error near offset 1 (starting with ")"): Empty subset'
		, 'a' : [{a: ''}]
		, 'ab' : [{a: '', b: ''}]
		, 'a[b]' : [{a: '', b: 'o'}]
		, '[a]b' : [{a: 'o', b: ''}]
		, '[ab]' : [{a: 'o', b: 'o'}]
		, '[ab]c' : [{a: 'o', b: 'o', c: ''}]
		, '[ab:]c' : [{a: 'o', b: 'oa', c: ''}]
		, '[a:b:]c:' : [{a: 'oa', b: 'oa', c: 'a'}]
		, 'a|b' : [{a: ''}, {b: ''}]
		, 'a|bc' : [{a: ''}, {b: '', c: ''}]
		, 'a|ac' : [{a: ''}, {c: '', a: ''}]
		, 'a:|ac' : [{a: 'a'}, {c: '', a: ''}]
		, 'a|a(b|c)' : [{a: ''}, {a: '', b: ''}, {a: '', c: ''}]
		, 'a|a(b|c(d|e))' : [{a: ''}, {a: '', b: ''}, {a: '', c: '', d: ''}, {a: '', c: '', e: ''}]
		, 'a|a(b|c(d:|e:))' : [{a: ''}, {a: '', b: ''}, {a: '', c: '', d: 'a'}, {a: '', c: '', e: 'a'}]
	};

	var convert = function(parsed) {
		var res = [];
		for(var i = 0; i < parsed.length; i++) {
			var p = parsed[i];
			var r = {};

			for(var oi = 0; oi < p.length; oi++) {
				var o = p[oi];

				r[o.id] = ''
					+ (o.isOptional ? 'o' : '')
					+ (o.argumentRequired ? 'a' : '')
					+ (o.isMulti ? 'm' : '')
				;
			}

			res.push(r);
		}

		return res;
	};

	for(var optstring in cases) {
		var expected = cases[optstring];

		if(typeof(expected) !== 'string') {
			var actual = OptstringParser.unfold(optstring);

			test.deepEqual(convert(actual), expected);
		} else {
			var expectedError = function(e) {
				return e.message === expected;
			};

			test.throws(function() {
				OptstringParser.unfold(optstring);
			}, expectedError, 'Optstring: ' + optstring);
		}
	}

	test.done();
};
