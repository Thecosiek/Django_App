document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('formset-container') as HTMLElement;
  const addBtn = document.getElementById('btn-add-point') as HTMLButtonElement;
  const mapImg = document.getElementById('bg-image') as HTMLImageElement;
  const overlayElement = document.getElementById('overlay');
    if (!(overlayElement instanceof SVGSVGElement)) {
        throw new Error('Element #overlay is not an SVGSVGElement');
    }
  const overlay: SVGSVGElement = overlayElement;

  const formPrefix = (document.getElementById('id_' + 'form-TOTAL_FORMS') as HTMLInputElement).name.split('-')[0];

  let formCount: number = parseInt(
    (document.getElementById(`id_${formPrefix}-TOTAL_FORMS`) as HTMLInputElement).value
  );

  function resizeOverlay() {
    overlay.setAttribute('width', mapImg.clientWidth.toString());
    overlay.setAttribute('height', mapImg.clientHeight.toString());
    overlay.style.width = mapImg.clientWidth + 'px';
    overlay.style.height = mapImg.clientHeight + 'px';
  }

  mapImg.onload = resizeOverlay;
  window.addEventListener('resize', resizeOverlay);

  function renderRoute() {
    while (overlay.firstChild) overlay.removeChild(overlay.firstChild);

    const points: { x: number; y: number; formIndex: string }[] = [];

    document.querySelectorAll<HTMLElement>('.point-form').forEach(div => {
      const del = div.querySelector<HTMLInputElement>('input[name$="-DELETE"]');
      if (del && del.checked) return;

      const xInput = div.querySelector<HTMLInputElement>('input[name$="-x"]');
      const yInput = div.querySelector<HTMLInputElement>('input[name$="-y"]');

      const x = parseFloat(xInput?.value || '');
      const y = parseFloat(yInput?.value || '');

      if (!isNaN(x) && !isNaN(y)) {
        points.push({
          x,
          y,
          formIndex: div.dataset.formIndex || '0'
        });
      }
    });

    const scaleX = mapImg.clientWidth / mapImg.naturalWidth;
    const scaleY = mapImg.clientHeight / mapImg.naturalHeight;

    if (points.length > 1) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#0074D9');
      path.setAttribute('stroke-width', '2');
      const pts = points.map(p => `${p.x * scaleX},${p.y * scaleY}`).join(' ');
      path.setAttribute('points', pts);
      overlay.appendChild(path);
    }

    points.forEach(p => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', (p.x * scaleX).toString());
      circle.setAttribute('cy', (p.y * scaleY).toString());
      circle.setAttribute('r', '6');
      circle.setAttribute('class', 'point-circle');
      circle.dataset.formIndex = p.formIndex;

      circle.addEventListener('mouseenter', () => {
        circle.setAttribute('fill', 'green');
      });

      circle.addEventListener('mouseleave', () => {
        circle.removeAttribute('fill');
      });

      overlay.appendChild(circle);
    });

    overlay.style.pointerEvents = 'auto';
  }

  function addForm(x: number | null = null, y: number | null = null) {
    const idx = formCount;
    const div = document.createElement('div');
    div.className = 'point-form';
    div.dataset.formIndex = idx.toString();

    div.innerHTML = `
      <input type="hidden" name="${formPrefix}-${idx}-id" id="id_${formPrefix}-${idx}-id" />
      <label>Kolejność: <input type="number" name="${formPrefix}-${idx}-order" id="id_${formPrefix}-${idx}-order" value="${idx + 1}" /></label>
      <label>X: <input type="number" step="any" name="${formPrefix}-${idx}-x" id="id_${formPrefix}-${idx}-x" value="${x !== null ? x.toFixed(1) : ''}" /></label>
      <label>Y: <input type="number" step="any" name="${formPrefix}-${idx}-y" id="id_${formPrefix}-${idx}-y" value="${y !== null ? y.toFixed(1) : ''}" /></label>
      <input type="checkbox" name="${formPrefix}-${idx}-DELETE" id="id_${formPrefix}-${idx}-DELETE" style="display:none;" />
      <button type="button" class="btn-remove-point">Usuń ten punkt</button>
    `;

    container.appendChild(div);
    formCount++;
    (document.getElementById(`id_${formPrefix}-TOTAL_FORMS`) as HTMLInputElement).value = formCount.toString();
    renderRoute();
  }

  addBtn.addEventListener('click', () => addForm());

  overlay.addEventListener('click', e => {
    if ((e.target as Element).id === 'overlay') {
      const rect = mapImg.getBoundingClientRect();
      const px = (e.clientX - rect.left) * (mapImg.naturalWidth / mapImg.clientWidth);
      const py = (e.clientY - rect.top) * (mapImg.naturalHeight / mapImg.clientHeight);
      addForm(px, py);
    }
  });

  container.addEventListener('click', e => {
    if ((e.target as HTMLElement).matches('.btn-remove-point')) {
      const div = (e.target as HTMLElement).closest('.point-form') as HTMLElement;
      const del = div.querySelector<HTMLInputElement>('input[type="checkbox"][name$="-DELETE"]');
      if (del) del.checked = true;
      div.style.display = 'none';
      renderRoute();
    }
  });

  overlay.addEventListener('click', e => {
    const el = e.target as HTMLElement;
    if (el.matches('.point-circle')) {
      const idx = el.dataset.formIndex;
      const div = container.querySelector(`.point-form[data-form-index="${idx}"]`) as HTMLElement;
      const del = div.querySelector<HTMLInputElement>('input[type="checkbox"][name$="-DELETE"]');
      if (del) del.checked = true;
      div.style.display = 'none';
      renderRoute();
    }
  });

  let draggingCircle: SVGCircleElement | null = null;
let dragOffset = { x: 0, y: 0 };

overlay.addEventListener('mousedown', e => {
  if (e.target instanceof SVGCircleElement) {
    draggingCircle = e.target;
    const rect = overlay.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left - parseFloat(draggingCircle.getAttribute('cx') || '0');
    dragOffset.y = e.clientY - rect.top - parseFloat(draggingCircle.getAttribute('cy') || '0');
    e.preventDefault();
  }
});

overlay.addEventListener('mousemove', e => {
  if (draggingCircle) {
    const rect = overlay.getBoundingClientRect();
    const cx = e.clientX - rect.left - dragOffset.x;
    const cy = e.clientY - rect.top - dragOffset.y;

    const scaleX = mapImg.naturalWidth / mapImg.clientWidth;
    const scaleY = mapImg.naturalHeight / mapImg.clientHeight;

    const newX = cx * scaleX;
    const newY = cy * scaleY;

    const formIndex = draggingCircle.dataset.formIndex!;
    const xInput = document.querySelector<HTMLInputElement>(`input[name="${formPrefix}-${formIndex}-x"]`);
    const yInput = document.querySelector<HTMLInputElement>(`input[name="${formPrefix}-${formIndex}-y"]`);
    if (xInput && yInput) {
      xInput.value = newX.toFixed(2);
      yInput.value = newY.toFixed(2);
    }
    draggingCircle.setAttribute('cx', cx.toString());
    draggingCircle.setAttribute('cy', cy.toString());
    renderRoute();
  }
});

window.addEventListener('mouseup', () => {
  draggingCircle = null;
});
  renderRoute();
});
