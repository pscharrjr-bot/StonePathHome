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

function resetAffordabilityForm() {
  const defaults = {
    targetMonthlyPayment: 2600,
    affordInterestRate: 6.75,
    affordLoanTerm: 30,
    affordDownPayment: 60000,
    affordPropertyTaxes: 4200,
    affordHomeInsurance: 1600,
    affordHoa: 0,
    affordPmi: 0,
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });

  runAffordabilityCalculator();
}

function runAffordabilityCalculator() {
  const targetMonthlyPayment = getInputValue('targetMonthlyPayment');
  const interestRate = getInputValue('affordInterestRate');
  const loanTerm = getInputValue('affordLoanTerm');
  const downPayment = getInputValue('affordDownPayment');
  const propertyTaxes = getInputValue('affordPropertyTaxes');
  const homeInsurance = getInputValue('affordHomeInsurance');
  const hoa = getInputValue('affordHoa');
  const pmi = getInputValue('affordPmi');

  if ([targetMonthlyPayment, interestRate, loanTerm, downPayment, propertyTaxes, homeInsurance, hoa, pmi].some((v) => !Number.isFinite(v) || v < 0)) {
    return;
  }

  const monthlyTaxes = propertyTaxes / 12;
  const monthlyInsurance = homeInsurance / 12;
  const budgetForPrincipalInterest = targetMonthlyPayment - monthlyTaxes - monthlyInsurance - hoa - pmi;

  if (budgetForPrincipalInterest <= 0) {
    setText('estimatedHomePrice', '$0');
    setText('estimatedLoanAmount', '$0');
    setText('estimatedPrincipalInterest', '$0');
    setText('estimatedMonthlyTaxes', formatCurrency(monthlyTaxes));
    setText('estimatedMonthlyInsurance', formatCurrency(monthlyInsurance));
    setText('estimatedMonthlyHoa', formatCurrency(hoa));
    setText('estimatedMonthlyPmi', formatCurrency(pmi));
    setText('budgetForPrincipalInterest', '$0');
    return;
  }

  const totalMonths = loanTerm * 12;
  const monthlyRate = interestRate / 100 / 12;
  let estimatedLoanAmount = 0;

  if (monthlyRate === 0) {
    estimatedLoanAmount = budgetForPrincipalInterest * totalMonths;
  } else {
    estimatedLoanAmount = budgetForPrincipalInterest * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)));
  }

  const estimatedHomePrice = estimatedLoanAmount + downPayment;

  setText('estimatedHomePrice', formatCurrency(estimatedHomePrice));
  setText('estimatedLoanAmount', formatCurrency(estimatedLoanAmount));
  setText('estimatedPrincipalInterest', formatCurrency(budgetForPrincipalInterest));
  setText('estimatedMonthlyTaxes', formatCurrency(monthlyTaxes));
  setText('estimatedMonthlyInsurance', formatCurrency(monthlyInsurance));
  setText('estimatedMonthlyHoa', formatCurrency(hoa));
  setText('estimatedMonthlyPmi', formatCurrency(pmi));
  setText('budgetForPrincipalInterest', formatCurrency(budgetForPrincipalInterest));
}

function formatMonths(months) {
  if (!Number.isFinite(months) || months <= 0) return '0 months';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years <= 0) return `${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
  if (remainingMonths === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
}

function runExtraPaymentScenario(balance, monthlyRate, scheduledPayment, extraMonthly, oneTimeExtra) {
  let currentBalance = balance - oneTimeExtra;
  if (currentBalance < 0) currentBalance = 0;
  let totalInterest = 0;
  let months = 0;
  let totalExtraPaid = oneTimeExtra > 0 ? oneTimeExtra : 0;

  while (currentBalance > 0 && months < 1000) {
    const interest = currentBalance * monthlyRate;
    const payment = scheduledPayment + extraMonthly;
    const principalPaid = payment - interest;
    if (principalPaid <= 0) break;

    totalInterest += interest;
    currentBalance -= principalPaid;
    months += 1;
    totalExtraPaid += extraMonthly;
  }

  return {
    months,
    totalInterest,
    totalExtraPaid: Math.max(totalExtraPaid, 0),
  };
}

function resetExtraPaymentForm() {
  const defaults = {
    extraCurrentBalance: 280000,
    extraInterestRate: 6.75,
    extraRemainingTerm: 30,
    extraMonthlyPayment: 1816,
    extraMonthlyAmount: 200,
    extraOneTimeAmount: 5000,
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });

  runExtraPaymentCalculator();
}

function runExtraPaymentCalculator() {
  const balance = getInputValue('extraCurrentBalance');
  const interestRate = getInputValue('extraInterestRate');
  const remainingTerm = getInputValue('extraRemainingTerm');
  const monthlyPayment = getInputValue('extraMonthlyPayment');
  const extraMonthly = getInputValue('extraMonthlyAmount');
  const oneTimeExtra = getInputValue('extraOneTimeAmount');

  if ([balance, interestRate, remainingTerm, monthlyPayment, extraMonthly, oneTimeExtra].some((v) => !Number.isFinite(v) || v < 0)) {
    return;
  }

  const monthlyRate = interestRate / 100 / 12;
  const originalMonths = remainingTerm * 12;
  const originalInterest = monthlyPayment * originalMonths - balance;

  const accelerated = runExtraPaymentScenario(balance, monthlyRate, monthlyPayment, extraMonthly, oneTimeExtra);
  const monthsSaved = Math.max(originalMonths - accelerated.months, 0);
  const interestSaved = Math.max(originalInterest - accelerated.totalInterest, 0);

  setText('extraOriginalPayoffTime', formatMonths(originalMonths));
  setText('extraNewPayoffTime', formatMonths(accelerated.months));
  setText('extraMonthsSaved', `${monthsSaved}`);
  setText('extraOriginalInterest', formatCurrency(originalInterest));
  setText('extraNewInterest', formatCurrency(accelerated.totalInterest));
  setText('extraInterestSaved', formatCurrency(interestSaved));
  setText('extraTotalExtraPaid', formatCurrency(accelerated.totalExtraPaid));
}

document.addEventListener('DOMContentLoaded', () => {
  const calculateButton = document.getElementById('calculateMortgage');
  const resetButton = document.getElementById('resetMortgage');
  const calculateAffordabilityButton = document.getElementById('calculateAffordability');
  const resetAffordabilityButton = document.getElementById('resetAffordability');
  const calculateExtraPaymentButton = document.getElementById('calculateExtraPayment');
  const resetExtraPaymentButton = document.getElementById('resetExtraPayment');

  if (calculateButton) calculateButton.addEventListener('click', runMortgageCalculator);
  if (resetButton) resetButton.addEventListener('click', resetMortgageForm);
  if (calculateAffordabilityButton) calculateAffordabilityButton.addEventListener('click', runAffordabilityCalculator);
  if (resetAffordabilityButton) resetAffordabilityButton.addEventListener('click', resetAffordabilityForm);
  if (calculateExtraPaymentButton) calculateExtraPaymentButton.addEventListener('click', runExtraPaymentCalculator);
  if (resetExtraPaymentButton) resetExtraPaymentButton.addEventListener('click', resetExtraPaymentForm);

  if (document.getElementById('monthlyPayment')) {
    runMortgageCalculator();
  }

  if (document.getElementById('estimatedHomePrice')) {
    runAffordabilityCalculator();
  }

  if (document.getElementById('extraInterestSaved')) {
    runExtraPaymentCalculator();
  }
});
