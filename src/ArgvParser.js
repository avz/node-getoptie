var ParsedArgv = require('./ParsedArgv');

/**
 *
 * @param {ParsedOptstring} parsedOptstring
 * @returns {ArgvParser}
 */
function ArgvParser(parsedOptstring) {
	/**
	 * @type {ParsedOptstring}
	 */
	this.parsedOptstring = parsedOptstring;
};

module.exports = ArgvParser;

/**
 * Парсит чстый массив аргументов (без команды запуска ноды и без пути скрипта)
 * По сути он принимает process.argv.slice(2)
 * @param {string[]} argv
 * @param {number} offset
 * @returns {ParsedArgv}
 */
ArgvParser.prototype.parse = function(argv, offset) {
	var self = this;
	var parsed = new ParsedArgv;

	argv = argv.slice(offset);
	var options = {};

	var addOption = function(id, value) {
		var info = self.parsedOptstring[id];
		if(info.isMulti) {
			if(!options[id])
				options[id] = [];

			options[id].push(value);
		} else {
			if(options[id] !== undefined)
				throw new Error('Multiple occurience of -' + id);

			options[id] = value;
		}
	};

	while(argv.length) {
		var opt = argv[0];
		if(opt[0] !== '-' || opt === '--')
			break;

		if(opt === '-')
			throw new Error('Empty option name');

		argv.shift();

		opt = opt.substr(1);
		var optid = opt[0];
		var optionInfo = this.parsedOptstring.options[optid];

		if(!optionInfo)
			throw new Error('Unknown option: -' + optid);

		if(optionInfo.argumentRequired) {
			var optarg;

			if(opt.length > 1) {
				optarg = opt.substr(1);
			} else {
				if(!argv.length)
					throw new Error('Missing argument for option -' + optid);

				optarg = argv.shift();
			}

			addOption(optid, optarg);
		} else {
			addOption(optid, true);

			if(opt.length > 1) {
				argv.unshift('-' + opt.substr(1));
			}
		}
	}

	parsed.options = options;
	parsed.args = argv

	this.validate(parsed);

	return parsed;
};

/**
 * Провести проверки на наличие обязательных аргументов, отсутствие
 * взаимоисключений и лишных опций
 * @param {ParsedArgv} parsed
 * @returns {undefined}
 */
ArgvParser.prototype.validate = function(parsed) {
	var cases = this.parsedOptstring.cases;

	var caseOptionIndex = function(c, optid) {
		for(var i = 0; i < c.length; i++) {
			if(c[i].id === optid)
				return i;
		}

		return -1;
	};

	var caseHasRequiredOptions = function(c) {
		for(var i = 0; i < c.length; i++) {
			if(!c[i].isOptional)
				return true;
		}

		return false;
	}

	/*
	 * отсекаем кейсы, для которых не хватает опций и попутно удаляем из кейсов
	 * опции, которые нашлись (так проще будет выдавать сообщение про ненайденные)
	 */
	for(var opt in parsed.options) {
		var newCases = [];

		for(var i = 0; i < cases.length; i++) {
			var ind = caseOptionIndex(cases[i], opt);
			if(ind !== -1) {
				var c = cases[i].slice(0);
				c.splice(ind, 1);
				newCases.push(c);
			}
		}

		cases = newCases;

		if(!cases.length)
			throw new Error('Option -' + opt + ' is not allowed here');
	}

	for(var i = 0; i < cases.length; i++) {
		if(!caseHasRequiredOptions(cases[i]))
			return; // нашли подходящий кейс
	}

	// каких-то опций не хватает, формируем список
	var notSpecified = [];

	for(var i = 0; i < cases.length; i++) {
		var list = [];

		for(var oi = 0; oi < cases[i].length; oi++) {
			if(!cases[i][oi].isOptional)
				list.push('-' + cases[i][oi].id);
		}

		if(list.length)
			notSpecified.push(list.join(', '));
	}

	throw new Error('Mandatory option(s) is not specified: ' + notSpecified.join(' or '));
};
