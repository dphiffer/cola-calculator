import { parseISO } from 'date-fns';

function formatAmount(num) {
	return num.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD'
	});
}

function formatPercent(num) {
	num = num * 100;
	return num.toFixed(1);
}

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

function calculate(start, salary) {
	var result = [];
	var cola = {
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
	start = start.replace(/[^0-9-]/g, '');
	salary = salary.replace(/\D/g, '');
	salary = parseInt(salary, 10);
	if (! start.match(/^\d{4}-\d{2}-\d{2}$/)) {
		result.push('Error: Enter your start date in YYYY-MM-DD format.');
	}
	if (start < '2011-01-01') {
		result.push('Error: Enter a start date after 2011-01-01.');
	}
	if (isNaN(salary) || salary < 1000) {
		result.push('Error: Enter an annual salary of at least $1,000. To calculate from an hourly wage, <a href="https://www.indeed.com/career-advice/pay-salary/convert-hourly-to-salary">try this converter</a>.');
	}
	if (result.length > 0) {
		return result.join('<br>');
	}
	var colaSalary = salary;
	result.push(`${start}: ${formatAmount(salary)}`);
	var when = parseISO(start).getTime();
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
		result.push(`add ${formatAmount(proRatedCola)} [${formatPercent(colaPercent)}% &times; ${formatAmount(colaSalary)} = ${formatAmount(annualCola)}, ` +
		            `pro-rated over ${formatPercent(yearPercent)}% of the year]`);
		colaSalary += proRatedCola;
		result.push(`${year}-12-31: ${formatAmount(colaSalary)}`);
		when = yearEnd;
	}

	var base = `${location.protocol}//${location.host}${location.pathname}`;
	result.push(`<br><a href="${base}?start=${escape(start)}&salary=${escape(salary)}">Link to this result</a>`);

	return result.join('<br>');
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
