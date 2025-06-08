"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function loadBoards() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const response = yield fetch('/api/boards/', { credentials: 'same-origin' });
            if (!response.ok) {
                alert('Błąd przy pobieraniu listy plansz');
                return;
            }
            const boards = yield response.json();
            const currentUser = (_a = document.body.getAttribute('data-current-user')) !== null && _a !== void 0 ? _a : '';
            const tbody = document.getElementById('boards-tbody');
            tbody.innerHTML = '';
            // Pobieramy token CSRF ze strony (np. z ukrytego inputa)
            const csrfTokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
            const csrfToken = (_b = csrfTokenInput === null || csrfTokenInput === void 0 ? void 0 : csrfTokenInput.value) !== null && _b !== void 0 ? _b : '';
            boards.forEach((board) => {
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
                viewLink.href = `/boards/${board.id}/view/`; // link do widoku podglądu planszy
                viewLink.textContent = '🔍 Podgląd';
                viewLink.style.marginRight = '10px'; // opcjonalnie dla odstępu
                actionsTd.appendChild(viewLink);
                tr.appendChild(actionsTd);
                tbody.appendChild(tr);
            });
        }
        catch (error) {
            console.error('Błąd:', error);
            alert('Coś poszło nie tak podczas ładowania plansz.');
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    loadBoards();
});
//# sourceMappingURL=board_list.js.map