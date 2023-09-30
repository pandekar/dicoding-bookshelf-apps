class Book {
  constructor(id, title, author, year, isComplete) {
    this.id = id,
    this.title = title,
    this.author = author,
    this.year = year,
    this.isComplete = isComplete
  }
};

const RENDER_EVENT = 'render-event';
const STORAGE_KEY = 'bookshelf-apps';
const SAVED_EVENT = 'saved-event';
const SEARCH_EVENT_START = 'search-event-start';
const SEARCH_EVENT_END = 'search-event-end';

let books = [];

/**
 * check browser storage availability
 * @returns {boolean}
 */
const isStorageAvailable = () => {
  if (typeof Storage === undefined) {
    alert('Local storage is not available')
    return false;
  }

  return true;
};

/**
 * load data from local storage
 */
const loadFromLocalStorage = () => {
  const datas = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (datas !== null) {
    for (const book of datas) {
      books.push(book)
    }
  }
  
  document.dispatchEvent(new Event(RENDER_EVENT));
};

// polish lagi
/**
 * snackbar trigger
 */
document.addEventListener(SAVED_EVENT, () => {
  const snackbar = document.getElementById('snackbar');
  snackbar.innerText = "BERHASIL"
  snackbar.className = "show-success";
  setTimeout(() => {
    snackbar.className = snackbar.className.replace('show', '');
  }, 3000);
});

/**
 * save to local storage
 */
const saveToStorage = () => {
  if (isStorageAvailable()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    document.dispatchEvent(new Event(SAVED_EVENT));
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
};

/**
 * find book with book id
 * @param {number} id 
 * @returns 
 */
const findBook = (id) => {
  for (const book of books) {
    if (book.id === id) {
      return book;
    }
  }

  return null;
};

/**
 * update book status
 * @param {number} id 
 * @returns 
 */
const updateBookStatus = (id) => {
  let book = findBook(id);

  if (book === null) return;

  book.isComplete = !book.isComplete;

  saveToStorage();
  document.dispatchEvent(new Event(RENDER_EVENT));
};

/**
 * findBookIndex
 * @param {number} id 
 */
const findBookIndex = (id) => {
  for (const index in books) {
    if (books[index].id === id) {
      return index;
    }
  }

  return -1;
};

/**
 * edit book data
 * @param {number} id 
 */
const editBookData = (id) => {
  const modalForm = document.getElementsByClassName('edit_section')[0];
  modalForm.style.display = 'flex';

  // close modal when user click anywhere outside of modal
  window.onclick = (e) => {
    if (e.target == modalForm) {
      modalForm.style.display = 'none';
    }
  };

  let closeCrossSymbol = document.getElementsByClassName('close')[0];
  closeCrossSymbol.onclick = () => {
    modalForm.style.display = 'none';
    document.dispatchEvent(new Event(RENDER_EVENT));
  };

  const bookData = findBook(id);
  const editBookTitleField = document.getElementById('editBookTitle');
  const editBookAuthorField = document.getElementById('editBookAuthor');
  const editBookYearField = document.getElementById('editBookYear');
  const editBookBookIsCompleteField = document.getElementById('editBookIsComplete')

  editBookTitleField.value = bookData.title;
  editBookAuthorField.value = bookData.author;
  editBookYearField.value = bookData.year;
  editBookBookIsCompleteField.checked = bookData.isComplete;
  
  document.getElementById('editBook').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(books)
    const newTitle = editBookTitleField.value;
    const newAuthor = editBookAuthorField.value;
    const newYear = editBookYearField.value;
    const newIsComplete = editBookBookIsCompleteField.checked;
    
    const updatedBook = new Book(id, newTitle, newAuthor, newYear, newIsComplete);
    
    const bookDataIndex = findBookIndex(id);
  
    books.splice(bookDataIndex, 1);
    books.push(updatedBook);
  
    saveToStorage();
    modalForm.style.display = 'none';
  });
  document.getElementById('editBook').removeEventListener('submit');
};

// coba polish lagi disini
/**
 * delete book
 * @param {number} id
 */
const deleteBook = (id) => {
  const bookIndex = findBookIndex(id);

  if (bookIndex === null) return;

  books.splice(bookIndex, 1);
  saveToStorage();
  document.dispatchEvent(new Event(RENDER_EVENT));
};

/**
 * make book element
 * @param {Book} book 
 */
const makeBookElement = (book) => {
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = book.title;

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = book.author;

  const bookYear = document.createElement('p');
  bookYear.innerText = book.year;

  const actionButtonContainer = document.createElement('div');
  actionButtonContainer.classList.add('action');

  const greenButton = document.createElement('button');
  greenButton.classList.add('green');
  greenButton.innerText = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  greenButton.addEventListener('click', () => {
    updateBookStatus(book.id);
  });

  const redButton = document.createElement('button');
  redButton.classList.add('red');
  redButton.innerText = 'Hapus Buku';
  redButton.addEventListener('click', () => {
    deleteBook(book.id);
  });

  const blueButton = document.createElement('button');
  blueButton.classList.add('blue');
  blueButton.innerText = 'Update Buku';
  blueButton.addEventListener('click', () => {
    editBookData(book.id);
  })
  
  actionButtonContainer.append(greenButton, redButton, blueButton);

  const articleContainer = document.createElement('article');
  articleContainer.classList.add('book_item');
  articleContainer.setAttribute('id', `book-${book.id}`);
  articleContainer.append(bookTitle, bookAuthor, bookYear, actionButtonContainer);

  return articleContainer;
}

/**
 * update submit button text
 */
const updateButtonStatus = () => {
  const inputBookIsComplete = document.getElementById('inputBookIsComplete').checked;
  document.getElementById('button-status').innerText = inputBookIsComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
}

/**
 * RENDER_EVENT listener
 */
document.addEventListener(RENDER_EVENT, () => {
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  incompleteBookshelfList.innerHTML = '';

  const completeBookshelfList = document.getElementById('completeBookshelfList');
  completeBookshelfList.innerHTML = '';

  for (const book of books) {
    if (book.isComplete) {
      const bookElement = makeBookElement(book);
      completeBookshelfList.append(bookElement);
    } else {
      const bookElement = makeBookElement(book);
      incompleteBookshelfList.append(bookElement);
    }
  }

  document.getElementById('inputBookTitle').value = '';
  document.getElementById('inputBookAuthor').value = '';
  document.getElementById('inputBookYear').value = '';
  document.getElementById('inputBookIsComplete').checked = false;
  updateButtonStatus();
})

/**
 * add new book
 */
const addBook = () => {
  const inputBookId = +new Date();
  const inputBookTitle = document.getElementById('inputBookTitle').value;
  const inputBookAuthor = document.getElementById('inputBookAuthor').value;
  const inputBookYear = document.getElementById('inputBookYear').value;
  const inputBookIsComplete = document.getElementById('inputBookIsComplete').checked;

  const inputBookObject = new Book(
    inputBookId, inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete
  );
  
  books.push(inputBookObject);
  saveToStorage();

  document.dispatchEvent(new Event(RENDER_EVENT));
}

/**
 * button status listener
 */
document.getElementById('inputBookIsComplete').addEventListener('click', () => {
  updateButtonStatus();
});

/**
 * search event start listener
 */
document.addEventListener(SEARCH_EVENT_START, () => {
  const searchResultContainer = document.getElementById('searchResult');
  searchResultContainer.innerHTML = '';
});

/**
 * search event end listener
 */
document.addEventListener(SEARCH_EVENT_END, () => {
  document.getElementById('searchBookTitle').value = '';
});

/**
 * search book
 */
const searchBookTitle = () => {
  document.dispatchEvent(new Event(SEARCH_EVENT_START));
  const bookTitle = document.getElementById('searchBookTitle').value;
  const searchResultContainer = document.getElementById('searchResult');
  
  if (bookTitle.trim() !== '') {
    const searchResult = books.filter((book) => book.title.toLowerCase().includes(bookTitle));
    for (const book of searchResult) {
      const bookTitle = document.createElement('h3');
      bookTitle.innerText = book.title;

      const bookAuthor = document.createElement('p');
      bookAuthor.innerText = book.author;

      const bookYear = document.createElement('p');
      bookYear.innerText = book.year;

      const container = document.createElement('div');
      container.setAttribute('id', `search-result-${book.id}`);
      container.classList.add('search-result-item');
      container.append(bookTitle, bookAuthor, bookYear);

      searchResultContainer.append(container);
    }
  } 

  document.dispatchEvent(new Event(SEARCH_EVENT_END));
}

/**
 * initiate first
 */
document.addEventListener('DOMContentLoaded', () => {
  if (isStorageAvailable()) {
    loadFromLocalStorage();
  }

  // form submit listener
  const inputBook = document.getElementById('inputBook');
  inputBook.addEventListener('submit', (e) => {
    e.preventDefault();
    addBook();
  });

  // search bar submit listener
  const searchBook = document.getElementById('searchBook');
  searchBook.addEventListener('submit', (e) => {
    e.preventDefault();
    searchBookTitle();
  })
});
