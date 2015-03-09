function ParsedOptstring() {
	/**
	 * @type {OptionDescription[]}
	 */
	this.options = {};

	/**
	 * @type {Array[]}
	 */
	this.cases = [];
};

module.exports = ParsedOptstring;
