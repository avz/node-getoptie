var ParsedOptstring = require('./ParsedOptstring');
var OptionDescription = require('./OptionDescription');

function OptstringParser() {

};

module.exports = OptstringParser;

OptstringParser.prototype.parse = function(optstring) {
	var parsed = new ParsedOptstring;

	parsed.cases = OptstringParser.unfold(optstring);

	for(var ci = 0; ci < parsed.cases.length; ci++) {
		var c = parsed.cases[ci];
		for(var oi = 0; oi < c.length; oi++) {
			var optionInfo = c[oi];

			var s = parsed.options[optionInfo.id];
			if(s) {
				if(!s.isEqual(optionInfo))
					throw new Error('Definition mismatch for option -' + optionInfo.id);
			} else {
				parsed.options[optionInfo.id] = optionInfo;
			}
		}
	}

	return parsed;
};

/**
 * Разворачивает оптстринг в массив возможных наборов опций,
 * например, "ab(c|d)" развернётся в "abc" и "abd" в отпарсенном предствалении
 * @param {string} optstring
 * @returns {OptionDescription[][]}
 */
OptstringParser.unfold = function(optstring) {
	var offset = 0;

	var joinOptstrings = function(list1, list2) {
		var result = [];

		for(var i = 0; i < list1.length; i++) {
			for(var j = 0; j < list2.length; j++)
				result.push(list1[i].concat(list2[j]));
		}

		return result;
	};

	var unfold = function(depth) {
		var result = [];
		var variants = [];

		var addOptToVariants = function(opt) {
			if(!variants.length)
				variants.push([]);

			for(var i = 0; i < variants.length; i++)
				variants[i].push(opt);
		};

		var endPrevOpt = function() {
			if(!opt)
				return;

			addOptToVariants(opt);
			opt = null;
		};

		var opt = null;
		var isOptional = false;
		var end = false;

		while(offset < optstring.length && !end) {
			var chr = optstring[offset];
			offset++;

			switch(chr) {
				case '(':
					if(isOptional)
						throw new Error('Sorry, but optional groups is non implemented yet');

					endPrevOpt();
					var subVariants = unfold(depth + 1);
					if(!subVariants.length)
						throw new Error('Empty subset');

					if(variants.length)
						variants = joinOptstrings(variants, subVariants);
					else
						variants = subVariants;
				break;
				case ')':
					if(!depth)
						throw new Error('Unexpected `)`');

					end = true;
				break;
				case '|':
					endPrevOpt();
					result = result.concat(variants);
					variants = [];
				break;
				case '[':
					if(isOptional)
						throw new Error('Unexpected `[`: optional already enabled');

					isOptional = true;
				break;
				case ']':
					if(!isOptional)
						throw new Error('Unexpected `]`: optional was not enabled');

					isOptional = false;
				break;
				case ':':
					if(!opt || opt.argumentRequired)
						throw new Error('Unexpected `:`, must be after option name');

					opt.argumentRequired = true;
				break;
				case '*':
					if(!opt || opt.isMulti)
						throw new Error('Unexpected `*`, must be after option definition');

					opt.isMulti = true;
					endPrevOpt();
				break;
				default:
					if(!/^[0-9a-z]$/i.test(chr))
						throw new Error('Invalid option name: ' + chr);

					endPrevOpt();
					opt = new OptionDescription(chr);
					opt.isOptional = isOptional;
				break;
			}
		}

		if(depth && !end) {
			throw new Error('Unexpected end of optstring: `)` expected');
		}

		if(isOptional) {
			throw new Error('Unexpected end of optstring: `]` expected');
		}

		endPrevOpt();

		return result.concat(variants);
	};

	try {
		return unfold(0);
	} catch(e) {
		throw new Error(
			'Optstring syntax error near offset ' + (offset - 1)
			+ ' (starting with "' + optstring.substr(offset - 1) + '")'
			+ ': '
			+ e.message
		);
	}
};
