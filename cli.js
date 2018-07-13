#!/usr/bin/env node
const apod = require('apod-nasa')
const asciify = require('asciify-image')
const ora = require('ora')
const chalk = require('chalk')
const inquirer = require('inquirer')
const Configstore = require('configstore')
const pkg = require('./package.json')
const spinner = ora({
	text: chalk.white.bold(
		'Fetching ' +
		chalk.green('Astronomy Picture of the Day') +
		' from ' +
		chalk.blue('NASA')
	),
	color: 'green',
	interval: 80,
	spinner: 'dots'
})
const conf = new Configstore(pkg.name, {
	isConfirmed: 'No'
})

if (conf.get('isConfirmed') == 'No') {
	ShowSettings()
} else {
	CheckArguments()
}

function CheckArguments() {
	let type = process.argv[2]

	if (type == '-h' || type == '--help') {
		ShowHelp()
	} else if (type == '-s' || type == '--settings') {
		ShowSettings()
	}
	else {
		FetchImage()
	}
}

function ShowSettings() {
	inquirer
		.prompt([
			{
				message: 'Image Width:',
				type: 'input',
				name: 'width',
				default: function () {
					return 60
				},
				validate: ValidateInteger
			},
			{
				message: 'Image Height:',
				type: 'input',
				name: 'height',
				default: function () {
					return 60
				},
				validate: ValidateInteger
			}
		])
		.then(answers => {
			conf.set('isConfirmed', true)
			conf.set('options.width', answers.width)
			conf.set('options.height', answers.height)
			FetchImage()
			console.log('')
		})
}

function ShowHelp() {
	console.log('')
	console.log(chalk.white.bold('APoD Help'))
	console.log('')
	console.log('Commands:')
	console.log('  apod		Get APoD into your terminal')
	console.log('  apod -s 	Set ASCII display settings')
	console.log('  apod -h 	Display this help')
	console.log('')
}

function FetchImage() {
	spinner.start()
	apod().then(data => {
		ConvertImageToASCII(data.image)
	})
}

function ConvertImageToASCII(link) {
	var options = {
		fit: 'box',
		width: conf.get('options.width'),
		height: conf.get('options.height')
	}

	asciify(link, options)
		.then(function (asciified) {
			console.log('\n\n')
			console.log(asciified)
			console.log('')
			spinner.info('Astronomy Picture of the Day: ' + link + '\n')
			spinner.stop()
		})
		.catch(function (err) {
			spinner.fail('Couldn\'t fetch Astronomy Picture of the Day from NASA')
		})
}

function ValidateInteger(int) {
	return int % 1 === 0;
}
