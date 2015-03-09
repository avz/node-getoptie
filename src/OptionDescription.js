/**
 * @param {string} id название опции (например, "v" для опции -v)
 * @returns {OptionDescription}
 */
function OptionDescription(id) {
	this.id = id;
	this.isOptional = false;
	this.argumentRequired = false;
};

module.exports = OptionDescription;

/**
 * Проверяет, эквивалентны ли два описания опции
 * @param {OptionDescription} optionInfo
 * @returns {boolean}
 */
OptionDescription.prototype.isEqual = function(optionInfo) {
	if(optionInfo === this)
		return true;

	return
		this.id === optionInfo.id
		&& this.isOptional === optionInfo.isOptional
		&& this.argumentRequired === optionInfo.argumentRequired
	;
};
