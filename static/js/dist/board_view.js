"use strict";
//board_view.ts
let isDrawing = false;
let currentPath = [];
let board; // z window.INITIAL_BOARD
function isNeighbor(p1, p2) {
    const dr = Math.abs(p1.row - p2.row);
    const dc = Math.abs(p1.col - p2.col);
    return dr + dc === 1;
}
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function updateVisualPath(container) {
    container.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('path-cell');
    });
    currentPath.forEach(point => {
        const index = (point.row - 1) * board.cols + (point.col - 1);
        const cell = container.children[index];
        cell.classList.add('path-cell');
    });
}
// NOWA FUNKCJA: Rysuje ścieżki przekazane jako lista {id, steps: [{x, y}]}
function drawUserPaths(paths) {
    const container = document.getElementById('grid-container');
    if (!container)
        return;
    // Podświetl każdą ścieżkę — tu można rozszerzyć, np. różne kolory dla różnych ścieżek
    paths.forEach(path => {
        path.steps.forEach(step => {
            // Konwersja współrzędnych (x = col, y = row)
            const row = step.y;
            const col = step.x;
            const index = (row - 1) * board.cols + (col - 1);
            const cell = container.children[index];
            if (cell) {
                cell.classList.add('path-cell');
            }
        });
    });
}
function handleCellClick(row, col, container) {
    if (!isDrawing)
        return;
    const clicked = { row, col };
    const index = currentPath.findIndex(p => p.row === row && p.col === col);
    if (index !== -1) {
        currentPath = currentPath.slice(0, index + 1);
    }
    else {
        const last = currentPath[currentPath.length - 1];
        if (!last || isNeighbor(last, clicked)) {
            currentPath.push(clicked);
        }
        else {
            alert("Można kliknąć tylko sąsiednie pole.");
        }
    }
    updateVisualPath(container);
}
function enableDrawing(container) {
    isDrawing = true;
    currentPath = [];
    updateVisualPath(container);
    const saveBtn = document.getElementById("savePathBtn");
    saveBtn.removeAttribute("disabled");
}
function savePath() {
    fetch("/api/save_path/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") || ""
        },
        body: JSON.stringify({
            board_id: board.id,
            steps: currentPath.map(p => ({ x: p.col, y: p.row }))
        })
    })
        .then(res => res.json())
        .then(data => {
        alert("Ścieżka zapisana!");
        isDrawing = false;
        const saveBtn = document.getElementById("savePathBtn");
        saveBtn.setAttribute("disabled", "true");
        // Opcjonalnie: dodaj nową ścieżkę do wyświetlanych (jeśli backend zwraca id i kroki)
        if (data.path_id) {
            drawUserPaths([{ id: data.path_id, steps: currentPath.map(p => ({ x: p.col, y: p.row })) }]);
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    var _a, _b;
    board = window.INITIAL_BOARD;
    if (!board)
        return;
    const container = document.getElementById('grid-container');
    container.style.gridTemplateRows = `repeat(${board.rows}, 1fr)`;
    container.style.gridTemplateColumns = `repeat(${board.cols}, 1fr)`;
    // Wypełnij siatkę
    for (let i = 0; i < board.rows * board.cols; i++) {
        const row = Math.floor(i / board.cols) + 1;
        const col = (i % board.cols) + 1;
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row.toString();
        cell.dataset.col = col.toString();
        cell.addEventListener('click', () => {
            handleCellClick(row, col, container);
        });
        container.appendChild(cell);
    }
    // Dodaj kropki
    board.dots.forEach((dot) => {
        const index = (dot.row - 1) * board.cols + (dot.col - 1);
        const cell = container.children[index];
        const dotEl = document.createElement('div');
        dotEl.className = 'dot';
        dotEl.style.backgroundColor = dot.color;
        cell.appendChild(dotEl);
    });
    const userPaths = window.USER_PATHS;
    if (userPaths && userPaths.length) {
        drawUserPaths(userPaths);
    }
    (_a = document.getElementById("startPathBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        enableDrawing(container);
    });
    (_b = document.getElementById("savePathBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        savePath();
    });
});
//# sourceMappingURL=board_view.js.map