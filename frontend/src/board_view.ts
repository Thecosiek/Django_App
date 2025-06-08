//board_view.ts
let isDrawing = false;
let currentPath: { row: number; col: number }[] = [];
let board: any; // z window.INITIAL_BOARD

function isNeighbor(p1: any, p2: any): boolean {
  const dr = Math.abs(p1.row - p2.row);
  const dc = Math.abs(p1.col - p2.col);
  return dr + dc === 1;
}

function getCookie(name: string) {
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

function updateVisualPath(container: HTMLElement) {
  container.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('path-cell');
  });

  currentPath.forEach(point => {
    const index = (point.row - 1) * board.cols + (point.col - 1);
    const cell = container.children[index] as HTMLElement;
    cell.classList.add('path-cell');
  });
}

// NOWA FUNKCJA: Rysuje ścieżki przekazane jako lista {id, steps: [{x, y}]}
function drawUserPaths(paths: { id: number; steps: { x: number; y: number }[] }[]) {
  const container = document.getElementById('grid-container');
  if (!container) return;

  // Podświetl każdą ścieżkę — tu można rozszerzyć, np. różne kolory dla różnych ścieżek
  paths.forEach(path => {
    path.steps.forEach(step => {
      // Konwersja współrzędnych (x = col, y = row)
      const row = step.y;
      const col = step.x;
      const index = (row - 1) * board.cols + (col - 1);
      const cell = container.children[index] as HTMLElement;
      if (cell) {
        cell.classList.add('path-cell');
      }
    });
  });
}

function handleCellClick(row: number, col: number, container: HTMLElement) {
  if (!isDrawing) return;

  const clicked = { row, col };
  const index = currentPath.findIndex(p => p.row === row && p.col === col);

  if (index !== -1) {
    currentPath = currentPath.slice(0, index + 1);
  } else {
    const last = currentPath[currentPath.length - 1];
    if (!last || isNeighbor(last, clicked)) {
      currentPath.push(clicked);
    } else {
      alert("Można kliknąć tylko sąsiednie pole.");
    }
  }

  updateVisualPath(container);
}

function enableDrawing(container: HTMLElement) {
  isDrawing = true;
  currentPath = [];
  updateVisualPath(container);

  const saveBtn = document.getElementById("savePathBtn")!;
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
      const saveBtn = document.getElementById("savePathBtn")!;
      saveBtn.setAttribute("disabled", "true");
      
      // Opcjonalnie: dodaj nową ścieżkę do wyświetlanych (jeśli backend zwraca id i kroki)
      if (data.path_id) {
        drawUserPaths([{ id: data.path_id, steps: currentPath.map(p => ({ x: p.col, y: p.row })) }]);
      }
    });
}

document.addEventListener('DOMContentLoaded', () => {
  board = (window as any).INITIAL_BOARD;
  if (!board) return;

  const container = document.getElementById('grid-container')!;
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
  board.dots.forEach((dot: { row: number; col: number; color: string })  => {
    const index = (dot.row - 1) * board.cols + (dot.col - 1);
    const cell = container.children[index] as HTMLElement;

    const dotEl = document.createElement('div');
    dotEl.className = 'dot';
    dotEl.style.backgroundColor = dot.color;
    cell.appendChild(dotEl);
  });

  const userPaths = (window as any).USER_PATHS;
  if (userPaths && userPaths.length) {
    drawUserPaths(userPaths);
  }
  document.getElementById("startPathBtn")?.addEventListener("click", () => {
    enableDrawing(container);
  });
  document.getElementById("savePathBtn")?.addEventListener("click", () => {
    savePath();
  });
});
