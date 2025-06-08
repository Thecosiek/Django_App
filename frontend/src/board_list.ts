async function loadBoards(): Promise<void> {
  try {
    const response = await fetch('/api/boards/', { credentials: 'same-origin' });
    if (!response.ok) {
      alert('Błąd przy pobieraniu listy plansz');
      return;
    }
    const boards = await response.json();

    const currentUser = document.body.getAttribute('data-current-user') ?? '';

    const tbody = document.getElementById('boards-tbody')!;
    tbody.innerHTML = '';

    // Pobieramy token CSRF ze strony (np. z ukrytego inputa)
    const csrfTokenInput = document.querySelector<HTMLInputElement>('input[name="csrfmiddlewaretoken"]');
    const csrfToken = csrfTokenInput?.value ?? '';

    boards.forEach((board: { id: number; name: string; rows: number; cols: number; user__username: string }) => {
      const tr = document.createElement('tr');

      // Nazwa
      const nameTd = document.createElement('td');
      nameTd.textContent = board.name;
      tr.appendChild(nameTd);

      // Rozmiar
      const sizeTd = document.createElement('td');
      sizeTd.textContent = `${board.rows} x ${board.cols}`;
      tr.appendChild(sizeTd);

      // Akcje
      const actionsTd = document.createElement('td');
/*
      // Link do edycji
      const editLink = document.createElement('a');
      editLink.href = `/boards/${board.id}/edit/`; // Upewnij się, że URL ma slash na końcu
      editLink.textContent = '✏️ Edytuj';
      actionsTd.appendChild(editLink);

      actionsTd.appendChild(document.createTextNode(' | '));

      // Formularz usuwania
      const form = document.createElement('form');
      form.method = 'post';
      form.action = `/boards/${board.id}/delete/`;  // Z ukośnikiem na końcu
      form.style.display = 'inline';

      // CSRF token input
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'csrfmiddlewaretoken';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);

      // Przycisk usuwania
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'submit';
      deleteBtn.textContent = '🗑️ Usuń';

      // Potwierdzenie usuwania
      deleteBtn.addEventListener('click', (e) => {
        if (!confirm('Czy na pewno chcesz usunąć planszę?')) {
          e.preventDefault();
        }
      });

      form.appendChild(deleteBtn);
      actionsTd.appendChild(form);
      */

      if (board.user__username === currentUser) {
    // Link do edycji
    const editLink = document.createElement('a');
    editLink.href = `/boards/${board.id}/edit/`;
    editLink.textContent = '✏️ Edytuj';
    actionsTd.appendChild(editLink);

    actionsTd.appendChild(document.createTextNode(' | '));

    // Formularz usuwania
    const form = document.createElement('form');
    form.method = 'post';
    form.action = `/boards/${board.id}/delete/`;
    form.style.display = 'inline';

    // CSRF token input
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // Przycisk usuwania
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'submit';
    deleteBtn.textContent = '🗑️ Usuń';

    // Potwierdzenie usuwania
    deleteBtn.addEventListener('click', (e) => {
      if (!confirm('Czy na pewno chcesz usunąć planszę?')) {
        e.preventDefault();
      }
    });

    form.appendChild(deleteBtn);
    actionsTd.appendChild(form);
  } 
    // Nie właściciel — np. tylko podgląd albo nic
    const viewLink = document.createElement('a');
    viewLink.href = `/boards/${board.id}/view/`;  // link do widoku podglądu planszy
    viewLink.textContent = '🔍 Podgląd';
    viewLink.style.marginRight = '10px';  // opcjonalnie dla odstępu
    actionsTd.appendChild(viewLink);


    tr.appendChild(actionsTd);
    tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Błąd:', error);
    alert('Coś poszło nie tak podczas ładowania plansz.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadBoards();
});
