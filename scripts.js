function toNumber(value) {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : NaN;
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function calculateMortgagePayment(principal, monthlyRate, totalMonths) {
  if (principal <= 0 || totalMonths <= 0) return 0;
  if (monthlyRate === 0) return principal / totalMonths;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
}

function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? toNumber(el.value) : NaN;
}

function resetMortgageForm() {
  const defaults = {
    homePrice: 350000,
    downPayment: 70000,
    interestRate: 6.75,
    loanTerm: 30,
    propertyTaxes: 4200,
    homeInsurance: 1600,
    hoa: 0,
    pmi: 0,
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });

  runMortgageCalculator();
}

function runMortgageCalculator() {
  const homePrice = getInputValue('homePrice');
  const downPayment = getInputValue('downPayment');
  const interestRate = getInputValue('interestRate');
  const loanTerm = getInputValue('loanTerm');
  const propertyTaxes = getInputValue('propertyTaxes');
  const homeInsurance = getInputValue('homeInsurance');
  const hoa = getInputValue('hoa');
  const pmi = getInputValue('pmi');

  if ([homePrice, downPayment, interestRate, loanTerm, propertyTaxes, homeInsurance, hoa, pmi].some((v) => !Number.isFinite(v) || v < 0)) {
    return;
  }

  const loanAmount = Math.max(homePrice - downPayment, 0);
  const totalMonths = loanTerm * 12;
  const monthlyRate = interestRate / 100 / 12;
  const principalInterest = calculateMortgagePayment(loanAmount, monthlyRate, totalMonths);
  const monthlyTaxes = propertyTaxes / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyHoa = hoa;
  const monthlyPmi = pmi;
  const monthlyPayment = principalInterest + monthlyTaxes + monthlyInsurance + monthlyHoa + monthlyPmi;
  const totalInterest = principalInterest * totalMonths - loanAmount;
  const totalPaid = principalInterest * totalMonths + propertyTaxes * loanTerm + homeInsurance * loanTerm + (monthlyHoa * 12 * loanTerm) + (monthlyPmi * 12 * loanTerm);
  const firstMonthInterest = loanAmount * monthlyRate;
  const firstMonthPrincipal = principalInterest - firstMonthInterest;

  let balance = loanAmount;
  for (let i = 0; i < 12; i += 1) {
    const interestPortion = balance * monthlyRate;
    const principalPortion = principalInterest - interestPortion;
    balance -= principalPortion;
  }

  setText('monthlyPayment', formatCurrency(monthlyPayment));
  setText('principalInterest', formatCurrency(principalInterest));
  setText('monthlyTaxes', formatCurrency(monthlyTaxes));
  setText('monthlyInsurance', formatCurrency(monthlyInsurance));
  setText('monthlyHoa', formatCurrency(monthlyHoa));
  setText('monthlyPmi', formatCurrency(monthlyPmi));
  setText('loanAmount', formatCurrency(loanAmount));
  setText('totalInterest', formatCurrency(totalInterest));
  setText('totalPaid', formatCurrency(totalPaid));
  setText('firstMonthInterest', formatCurrency(firstMonthInterest));
  setText('firstMonthPrincipal', formatCurrency(firstMonthPrincipal));
  setText('balanceAfterYearOne', formatCurrency(balance));
}

document.addEventListener('DOMContentLoaded', () => {
  const calculateButton = document.getElementById('calculateMortgage');
  const resetButton = document.getElementById('resetMortgage');

  if (calculateButton) calculateButton.addEventListener('click', runMortgageCalculator);
  if (resetButton) resetButton.addEventListener('click', resetMortgageForm);

  if (document.getElementById('monthlyPayment')) {
    runMortgageCalculator();
  }
});