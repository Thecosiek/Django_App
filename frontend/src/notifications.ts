// Moduł do obsługi SSE i wyświetlania toastów w aplikacji

export {};

interface SSEBoardData {
  board_id: number;
  board_name: string;
  creator_username: string;
}

interface SSEPathData {
  board_id: number;
  board_name: string;
  path_id: number;
  user_username: string;
}

class Notifier {
  private source: EventSource;

  constructor(url: string) {
    this.source = new EventSource(url);
    this.source.addEventListener('open', this.onOpen.bind(this));
    this.source.addEventListener('error', this.onError.bind(this));
    this.source.addEventListener('newBoard', this.onNewBoard.bind(this));
    this.source.addEventListener('newPath', this.onNewPath.bind(this));
  }

  private onOpen(): void {
    console.log('SSE: połączenie otwarte');
  }

  private onError(): void {
    console.error('SSE: błąd lub rozłączenie, spróbuję ponownie...');
  }

  private onNewBoard(e: MessageEvent): void {
    console.log(e.data)
    const data = JSON.parse(e.data) as SSEBoardData;
    // Kliknięcie przeniesie do widoku edycji planszy w trybie rysowania ścieżki
    this.toast(
      `Użytkownik ${data.creator_username} utworzył planszę: ${data.board_name}`,
      () => window.location.href = `/boards/${data.board_id}/edit?mode=path`
    );
  }

  private onNewPath(e: MessageEvent): void {
    const data = JSON.parse(e.data) as SSEPathData;
    // Kliknięcie przeniesie również do tej samej planszy, żeby zobaczyć ścieżkę
    this.toast(
      `Użytkownik ${data.user_username} zapisał ścieżkę na planszy: ${data.board_name}`,
      () => window.location.href = `/boards/${data.board_id}/edit?mode=path`
    );
  }

  private toast(message: string, onClick?: () => void): void {
    // Prosty mechanizm toast
    const containerId = 'sse-toast-container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'fixed';
      container.style.top = '1rem';
      container.style.right = '1rem';
      container.style.zIndex = '1000';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.background = 'rgba(0,0,0,0.7)';
    toast.style.color = '#fff';
    toast.style.padding = '0.5rem 1rem';
    toast.style.marginTop = '0.5rem';
    toast.style.borderRadius = '0.25rem';
    toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

    if (onClick) {
      toast.style.cursor = 'pointer';
      toast.addEventListener('click', onClick);
    }

    container.appendChild(toast);
    // Usuwaj po 5 sekundach
    setTimeout(() => container?.removeChild(toast), 5000);
  }
}

// Inicjalizacja po załadowaniu strony
window.addEventListener('DOMContentLoaded', () => {
  new Notifier('/sse/notifications/');
});