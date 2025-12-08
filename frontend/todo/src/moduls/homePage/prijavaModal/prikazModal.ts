const MODAL_ID = 'login-modal';
const MODAL_VISIBLE_CLASS = 'modal--visible';

function getLoginModal(): HTMLElement | null {
    return document.getElementById(MODAL_ID);
}

export function openLoginModal(): void {
    const modal = getLoginModal();
    if (!modal) return;

    modal.classList.add(MODAL_VISIBLE_CLASS);
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('body--modal-open');

    const firstInput = modal.querySelector<HTMLInputElement>('input[type="text"]');
    firstInput?.focus();
}

function closeLoginModal(): void {
    const modal = getLoginModal();
    if (!modal) return;

    modal.classList.remove(MODAL_VISIBLE_CLASS);
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('body--modal-open');
}



document.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (target.closest('[data-close-modal]')) {
        closeLoginModal();
    }
});