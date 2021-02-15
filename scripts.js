const Modal = {
  open() {
    document
      .querySelector('.modal-overlay')
      .classList.add('active');    
  },
  close() {
    document
      .querySelector('.modal-overlay')
      .classList.remove('active');
  },
  toggle() {
    document
      .querySelector('.modal-overlay')
      .classList.toggle('active');    
  }
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances:transaction')) || [];
  },
  set(transaction) {
    localStorage.setItem('dev.finances:transaction', JSON.stringify(transaction));
  },
  download(e) {
    e.preventDefault();

    const data = JSON.stringify(Storage.get(), null, 4);
    const blob = new Blob([data], {type: 'application/json'});
    const url = window.URL.createObjectURL(blob);

    const date = new Date();
    const today = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    const link = document.createElement('a');
    link.download = `devfinances-${today}.json`;
    link.href = url;
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  },
  upload() {
    // code here
  }
}

const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },
  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },
  removeAll(){
    Transaction.all.splice(0, Transaction.all.length);
    App.reload();
  },
  incomes() {
    let income = 0;
    Transaction.all.forEach( transaction => {
      if(transaction.amount > 0) income += transaction.amount;
    })
    return income;
  },
  expenses() {
    let expense = 0;
    Transaction.all.forEach( transaction => {
      if(transaction.amount < 0) expense += transaction.amount;
    })
    return expense;
  },
  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
};

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },
  innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? 'income' : 'expense';
    const amount = Utils.formatCurrency(transaction.amount);
    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${cssClass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img src="./assets/minus.svg" alt="Remover Transação" onclick="Transaction.remove(${index})">
      </td>
    `;

    return html;
  },
  updateBalance() {
    const totalDisplay = document.querySelector('#totalDisplay');

    document
      .querySelector('#incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes());

    document
      .querySelector('#expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses());

    totalDisplay.innerHTML = Utils.formatCurrency(Transaction.total());

    Transaction.total() < 0
      ? totalDisplay.parentElement.classList.add('negative')
      : totalDisplay.parentElement.classList.remove('negative');
    
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = '';
  }
}

const Sort = {
  table: document.querySelector('table'),
  description(asc = true) {
    const thDescription = document.querySelector('#th-description');
    if(thDescription.classList.contains('th-sort-asc')) asc = false;
    
    const dirOrder = asc ? 1 : -1;
    const tBody = Sort.table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll('tr'));

    const sortedRows = rows.sort((a, b) => {
      const aColContent = a.querySelector(`td:nth-child(${1})`).textContent.trim();
      const bColContent = b.querySelector(`td:nth-child(${1})`).textContent.trim();

      return aColContent > bColContent ? (1 * dirOrder) : (-1 * dirOrder);
    })

    while(tBody.firstChild) {
      tBody.removeChild(tBody.firstChild);
    }

    tBody.append(...sortedRows);

    Sort.table.querySelectorAll('th')
    .forEach(th => th.classList.remove('th-sort-asc', 'th-sort-desc'));
    
    Sort.table.querySelector(`th:nth-child(${1})`).classList.toggle('th-sort-asc', asc);
    Sort.table.querySelector(`th:nth-child(${1})`).classList.toggle('th-sort-desc', !asc);
  },
  value(asc = true) {
    const thValue = document.querySelector('#th-value');
    if(thValue.classList.contains('th-sort-asc')) asc = false;
    
    const dirOrder = asc ? 1 : -1;
    const tBody = Sort.table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll('tr'));

    const sortedRows = rows.sort((a, b) => {
      const aColContent = a.querySelector(`td:nth-child(${2})`).textContent.trim();
      const aValue = parseFloat(aColContent.replace('R$','').replace('-','').replace('.','').replace(',','.').trim());
      const bColContent = b.querySelector(`td:nth-child(${2})`).textContent.trim();
      const bValue = parseFloat(bColContent.replace('R$','').replace('-','').replace('.','').replace(',','.').trim());

      return aValue > bValue ? (1 * dirOrder) : (-1 * dirOrder);
    })

    while(tBody.firstChild) {
      tBody.removeChild(tBody.firstChild);
    }

    tBody.append(...sortedRows);

    Sort.table.querySelectorAll('th')
    .forEach(th => th.classList.remove('th-sort-asc', 'th-sort-desc'));
    
    Sort.table.querySelector(`th:nth-child(${2})`).classList.toggle('th-sort-asc', asc);
    Sort.table.querySelector(`th:nth-child(${2})`).classList.toggle('th-sort-desc', !asc);
  },
  date(asc = true){
    const thDate = document.querySelector('#th-date');
    if(thDate.classList.contains('th-sort-asc')) asc = false;
    
    const dirOrder = asc ? 1 : -1;
    const tBody = Sort.table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll('tr'));

    const sortedRows = rows.sort((a, b) => {
      const aColContent = a.querySelector(`td:nth-child(${3})`).textContent.trim().split('/').reverse().join('-');
      const aDate = new Date(aColContent);
      const bColContent = b.querySelector(`td:nth-child(${3})`).textContent.trim().split('/').reverse().join('-');
      const bDate = new Date(bColContent);

      return aDate > bDate ? (1 * dirOrder) : (-1 * dirOrder);
    })

    while(tBody.firstChild) {
      tBody.removeChild(tBody.firstChild);
    }

    tBody.append(...sortedRows);

    Sort.table.querySelectorAll('th')
    .forEach(th => th.classList.remove('th-sort-asc', 'th-sort-desc'));
    
    Sort.table.querySelector(`th:nth-child(${3})`).classList.toggle('th-sort-asc', asc);
    Sort.table.querySelector(`th:nth-child(${3})`).classList.toggle('th-sort-desc', !asc);
  }
}

const Utils = {
  formatAmount(value) {
    value = value * 100;
    return Math.round(value);
  },
  formatDate(date) {
    const splittedDate = date.split('-');
    splittedDate.reverse();
    return splittedDate.join('/');
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ' ';
    value = String(value).replace(/\D/g, '');
    value = Number(value) / 100;

    value = value.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL'
    });

    return signal + value;
  },
  createPDF() {
    const table = document.querySelector('#data-table').innerHTML;
    console.log(table);
    const style = `
      <style>

      </style>
    `;
    const pdf = window.open('', '', 'height=300 ,width=300');
    pdf.document.write(`
      <html>
        <head>
          <title>dev.finances PDF</title>
          ${style}
        </head>
        <body>
          ${table}
        </body>
      </html>
    `);
    pdf.document.close();
    
  }
}

const Form = {
  fields: document.querySelectorAll('[required]'),
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  verifyErrors(field) {
    let foundError = false;

    for(error in field.validity)
      if(field.validity[error] && !field.validity.valid)
        foundError = error;

    return foundError;
  },
  customFeedback(field, typeError) {
    const spanError = field.parentNode.querySelector('span.error');
    
    const messages = {
      text: {
        valueMissing: 'Uma descrição é necessária!',
        typeMismatch: 'Por favor, insira uma descrição válida!',
        tooLong: 'Descrição muito longa!',
        tooShort: 'Descrição muito curta!',
        badInput: 'Ops... Descrição incompreensível!',
      },
      number: {
        valueMissing: 'O valor é obrigatório!',
        typeMismatch: 'Por favor, insira um valor válido!',
        rangeUnderflow: 'Valor muito baixo!',
        rangeOverflow: 'Valor muito alto!',
        stepMismatch: 'Frações de centavos não são válidos!',
        badInput: 'Ops... Valor incompreensível!',
      },
      date: {
        valueMissing: 'A data é obrigatória!',
        typeMismatch: 'Por favor, insira uma data válida!',
        rangerUnderflow: 'Data invalida!',
        rangerOverflow: 'Data invalida!',
        badInput: 'Ops... Data incompreensível!',
      }
    }

    if(typeError) {
      spanError.classList.add('active')
      spanError.innerHTML = messages[field.type][typeError]
      field.style.borderColor = 'var(--red)';
    } else {
      spanError.classList.remove('active')
      spanError.innerHTML = ''
      field.style.borderColor = 'var(--green)';
    }

  },
  validateField(event) {
    event.preventDefault();
    const field = event.target;
    const hasError = Form.verifyErrors(field);
    Form.customFeedback(field, hasError);
  },
  fieldsListener() {
    for(field of Form.fields) {
      field.addEventListener('invalid', Form.validateField);
      field.addEventListener('blur', Form.validateField);
    }
  },
  formatValues() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date
    };
  },
  saveTransaction(transaction) {
    Transaction.add(transaction)
  },
  clearFields() {
    Form.description.value = '';
    Form.amount.value = '';
    Form.date.value = '';
    for(field of Form.fields) 
      Form.customFeedback(field, false);
  },
  cancel(){
    Form.clearFields();
    Modal.toggle();
  },
  submit(event) {
    event.preventDefault();
    
    try {
      const transaction = Form.formatValues();
      Form.saveTransaction(transaction);
      Form.clearFields();
      Modal.toggle();
    } catch (error) {
      alert(error.message);
    }
  }
}

const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();
    Storage.set(Transaction.all);
    Form.fieldsListener();
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  }
}

App.init();
