import { parseISO } from 'date-fns';

// See: https://www.ssa.gov/oact/cola/colaseries.html
var cola = {
	'1975': 0.08,
	'1976': 0.064,
	'1977': 0.059,
	'1978': 0.065,
	'1979': 0.099,
	'1980': 0.143,
	'1981': 0.112,
	'1982': 0.074,
	'1983': 0.035,
	'1984': 0.035,
	'1985': 0.031,
	'1986': 0.013,
	'1987': 0.042,
	'1988': 0.04,
	'1989': 0.047,
	'1990': 0.054,
	'1991': 0.037,
	'1992': 0.03,
	'1993': 0.026,
	'1994': 0.028,
	'1995': 0.026,
	'1996': 0.029,
	'1997': 0.021,
	'1998': 0.013,
	'1999': 0.025,
	'2000': 0.035,
	'2001': 0.026,
	'2002': 0.014,
	'2003': 0.021,
	'2004': 0.027,
	'2005': 0.041,
	'2006': 0.033,
	'2007': 0.023,
	'2008': 0.058,
	'2009': 0,
	'2010': 0,
	'2011': 0.036,
	'2012': 0.017,
	'2013': 0.015,
	'2014': 0.017,
	'2015': 0,
	'2016': 0.003,
	'2017': 0.02,
	'2018': 0.028,
	'2019': 0.016,
	'2020': 0.013,
	'2021': 0.059
};

// Takes a number like 1234567 and returns $12,345.67
function formatAmount(num) {
	return num.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD'
	});
}

// Takes a number like 0.012345 and returns a percent like 1.2%
function formatPercent(num) {
	num = num * 100;
	return num.toFixed(1) + '%';
}

// Defend against XSS attacks
function escape(value) {
	if (! value) {
		return '';
	}
	return ('' + value)
		.replace(/&/g, '&amp;')
		.replace(/'/g, '&apos;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

// Returns an HTML string with COLA adjusted wages (or a list of errors)
function calculate(start, salary) {

	start = start.replace(/[^0-9-]/g, '');
	salary = salary.replace(/[,\$]/g, '');
	salary = parseInt(salary, 10);

	var result = validate(start, salary);
	if (result.length > 0) {
		return result.join('<br>');
	}

	var colaSalary = salary;
	var when = parseISO(start).getTime();
	result.push(`${start}: ${formatAmount(salary)}`);

	for (let year in cola) {

		let yearStart = parseISO(`${year}-01-01T00:00:00Z`).getTime();
		let yearEnd = parseISO(`${year}-12-31T23:59:59Z`).getTime();

		if (when > yearEnd) {
			continue;
		}

		let yearPercent = (yearEnd - when) / (yearEnd - yearStart);
		let colaPercent = cola[year];
		let annualCola = colaSalary * colaPercent;
		let proRatedCola = yearPercent * annualCola;

		let delta = `add ${formatAmount(proRatedCola)} [${formatPercent(colaPercent)} &times; ${formatAmount(colaSalary)}`;
		if (1 - yearPercent > 1/365) {
			delta += ` = ${formatAmount(annualCola)}, ` +
			         `pro-rated over ${formatPercent(yearPercent)} of the year`;
		}
		delta += ']';
		result.push(delta);
		colaSalary += proRatedCola;
		result.push(`${year}-12-31: ${formatAmount(colaSalary)}`);
		when = yearEnd;
	}

	var base = `${location.protocol}//${location.host}${location.pathname}`;
	var url = `${base}?start=${escape(start)}&salary=${escape(salary)}`;
	result.push(`<br><a href="${url}">Link to this result</a>`);

	return result.join('<br>');
}

// Make sure the inputs are valid
function validate(start, salary) {
	var result = [];
	if (! start.match(/^\d{4}-\d{2}-\d{2}$/)) {
		result.push('Error: Enter your start date in YYYY-MM-DD format.');
	}
	if (start < '1975-01-01') {
		result.push('Error: Enter a start date after 1975-01-01.');
	}
	if (start > '2022-01-01') {
		result.push('Error: Enter a start date before 2022-01-01.');
	}
	if (isNaN(salary) || salary < 1000) {
		result.push('Error: Enter an annual salary of at least $1,000. To calculate from an hourly wage, <a href="https://www.indeed.com/career-advice/pay-salary/convert-hourly-to-salary">try this converter</a>.');
	}
	return result;
}

(() => {

	var startInput = document.getElementById('start');
	var salaryInput = document.getElementById('salary');
	var start = null;
	var salary = null;

	var params = new URLSearchParams(window.location.search);
	if (params.has('start')) {
		start = params.get('start');
		startInput.value = start;
	}
	if (params.has('salary')) {
		salary = params.get('salary');
		salaryInput.value = salary;
	}

	var handleSubmit = (start, salary) => {
		var result = calculate(start, salary);
		document.getElementById('result').innerHTML = result;
		document.getElementById('result').classList.add('visible');
	};
	var form = document.getElementById('cola');
	form.addEventListener('submit', e => {
		e.preventDefault();
		handleSubmit(startInput.value, salaryInput.value);
	}, false);

	if (start && salary) {
		handleSubmit(start, salary);
	}

})();
