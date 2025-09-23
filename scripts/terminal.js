document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.querySelector('.terminal');
    let isDragging = false;
    let offsetX, offsetY;

    terminal.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - terminal.offsetLeft;
        offsetY = e.clientY - terminal.offsetTop;
        terminal.style.position = 'absolute';
        terminal.style.zIndex = 1000;
        terminal.classList.add('dragging');
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            terminal.style.left = `${e.clientX - offsetX}px`;
            terminal.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        terminal.classList.remove('dragging');
    });
});