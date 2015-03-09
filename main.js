var OptstringParser = require('./src/OptstringParser');
var ArgvParser = require('./src/ArgvParser');

function Getoptie(optstring) {
	throw new Error('Not implemented');
};

function getoptie(optstring, args) {
	if(this instanceof getoptie)
		return new Getoptie(optstring);

	if(!args)
		args = process.argv.slice(2);

	var parser = new OptstringParser();

	return (new ArgvParser(parser.parse(optstring))).parse(args);
};

module.exports = getoptie;
