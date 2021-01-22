const modal = {
  open() {
    document
      .querySelector('.modal-overlay')
      .classList.add('active');    
  },
  close() {
    document
      .querySelector('.modal-overlay')
      .classList.remove('active');
  }
}

//document.querySelector('.modal-overlay').addEventListener('click', modal.close);
