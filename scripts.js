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
    document
      .querySelector('#incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes());
    document
      .querySelector('#expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses());
    document
      .querySelector('#totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total());
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
  }
}

const Form = {
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
  validateFields() {
    const { description, amount, date } = Form.getValues();
    
    if(description.trim() === '' || amount.trim() === '' || date.trim() === '')
      throw new Error('Por favor, preencha todos os campos!')
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
  },
  submit(event) {
    event.preventDefault();
    
    try {
      Form.validateFields();
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
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  }

}

App.init();


