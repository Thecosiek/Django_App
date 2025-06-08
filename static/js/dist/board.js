var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let state = { rows: 0, cols: 0, dots: [] };
let activeColor = null;
const form = document.getElementById('board-form');
const genBtn = document.getElementById('generate-grid');
const gridContainer = document.getElementById('grid-container');
const colorBtns = Array.from(document.getElementsByClassName('color-btn'));
genBtn.addEventListener('click', () => {
    const rowsInput = form.querySelector('[name="rows"]');
    const colsInput = form.querySelector('[name="cols"]');
    const rows = parseInt(rowsInput.value, 10);
    const cols = parseInt(colsInput.value, 10);
    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
        alert('Podaj poprawne liczby wierszy i kolumn.');
        return;
    }
    state.rows = rows;
    state.cols = cols;
    state.dots = [];
    renderGrid();
});
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        activeColor = btn.dataset.color || null;
        colorBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});
function renderGrid() {
    gridContainer.innerHTML = '';
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateRows = `repeat(${state.rows}, 1fr)`;
    gridContainer.style.gridTemplateColumns = `repeat(${state.cols}, 1fr)`;
    for (let r = 1; r <= state.rows; r++) {
        for (let c = 1; c <= state.cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r.toString();
            cell.dataset.col = c.toString();
            cell.addEventListener('click', onCellClick);
            gridContainer.appendChild(cell);
        }
    }
    updateDotsInDOM();
}
function onCellClick(e) {
    if (!activeColor) {
        alert('Wybierz kolor kropek przed kliknięciem na siatkę.');
        return;
    }
    const cell = e.currentTarget;
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const existingIndex = state.dots.findIndex(d => d.row === row && d.col === col);
    if (existingIndex !== -1) {
        state.dots.splice(existingIndex, 1);
        updateDotsInDOM();
        return;
    }
    const usedCount = state.dots.filter(d => d.color === activeColor).length;
    if (usedCount >= 2) {
        alert('Ten kolor jest już użyty dla dwóch kropek.');
        return;
    }
    state.dots.push({ row, col, color: activeColor });
    updateDotsInDOM();
}
function updateDotsInDOM() {
    gridContainer.querySelectorAll('.dot').forEach(el => el.remove());
    state.dots.forEach(d => {
        const selector = `.grid-cell[data-row="${d.row}"][data-col="${d.col}"]`;
        const cell = gridContainer.querySelector(selector);
        if (cell) {
            const dotEl = document.createElement('div');
            dotEl.classList.add('dot');
            dotEl.style.background = d.color;
            cell.appendChild(dotEl);
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        const nameInput = form.querySelector('[name="name"]');
        if (!nameInput) {
            console.error('Nie znaleziono pola name');
            return;
        }
        const name = nameInput.value.trim();
        if (!name || state.rows < 1 || state.cols < 1) {
            alert('Uzupełnij tytuł, wymiary planszy oraz przynajmniej wygeneruj siatkę.');
            return;
        }
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const payload = {
            name,
            rows: state.rows,
            cols: state.cols,
            dots: state.dots.map(d => ({ row: d.row, col: d.col, color: d.color }))
        };
        const isEdit = !!window.INITIAL_BOARD;
        const boardUrl = isEdit
            ? `/api/boards/${window.INITIAL_BOARD.id}/`
            : `/api/boards/`;
        const method = isEdit ? 'PUT' : 'POST';
        const boardResp = yield fetch(boardUrl, {
            method,
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(payload)
        });
        if (!boardResp.ok) {
            alert('Błąd przy zapisie planszy.');
            return;
        }
        // Można dodać dodatkowe logowanie lub przekierowanie
        window.location.href = '/boards/';
    }));
    const initial = window.INITIAL_BOARD;
    if (initial) {
        form.querySelector('[name="name"]').value = initial.name;
        form.querySelector('[name="rows"]').value = initial.rows.toString();
        form.querySelector('[name="cols"]').value = initial.cols.toString();
        state.rows = initial.rows;
        state.cols = initial.cols;
        state.dots = initial.dots.map(d => ({ row: d.row, col: d.col, color: d.color }));
        renderGrid();
    }
});
export {};
//# sourceMappingURL=board.js.map