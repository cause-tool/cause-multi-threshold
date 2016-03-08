'use strict';

const sf = require('sf');
const chalk = require('chalk');


/*
detects, if a threshold is crossed upwards or downwards.
arbitrary intervals can be specified:
	threshold = `offset` + n * `step`
for instance "every 7.5 units, relative to 0.33"
*/

function main(step, context, config, input, done) {
	const data = step.data;

	const floorPrev = Math.floor((data.prevValue - config.offset) / config.step);
	const floorCurrent = Math.floor((input - config.offset) / config.step);

	const didCrossUp = (floorPrev < floorCurrent);
	const didCrossDown = (floorCurrent < floorPrev);
	const didCross = didCrossDown || didCrossUp;

	const threshold = (didCrossDown)
		? (floorPrev * config.step) + config.offset
		: (floorCurrent * config.step) + config.offset;

	if (didCross) {
		const arrow = (didCrossUp) ? '▲' : '▼';
		context.debug(
			sf('crossed the {0} mark: {1} {3} {2}',
				chalk.inverse(threshold),
				data.prevValue,
				input,
				chalk.inverse(arrow))
		);
	}

	const output = {
		up: didCrossUp,
		down: didCrossDown,
		threshold: threshold,
		value: input
	};

	data.prevValue = input;
	context.saveTask();

	done(null, output, didCross);
}


module.exports = {
	main: main,
	defaults: {
		config: {
			offset: 0,
			step: 1
		},
		data: {
			prevValue: 0
		},
		// description: '<%=config.comparison%> <%=config.value%>'
	},
};
