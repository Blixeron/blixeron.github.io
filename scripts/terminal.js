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

function getBrowserName() {
    const userAgent = navigator.userAgent;
    if (/firefox/i.test(userAgent)) return "Firefox";
    if (/edg\//i.test(userAgent)) return "Edge";
    if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) return "Opera";
    if (/chrome/i.test(userAgent)) return "Chrome";
    if (/safari/i.test(userAgent)) return "Safari";
    return "Unknown";
}

function getOSName() {
    const userAgent = navigator.userAgent;
    if (/win/i.test(userAgent)) return "Windows";
    if (/android/i.test(userAgent)) return "Android";
    if (/iPad|iPhone|iPod/.test(userAgent)) return "iOS";
    if (/mac/i.test(userAgent)) return "macOS";
    if (/linux/i.test(userAgent)) return "Linux";
    return "Unknown";
}

document.addEventListener("DOMContentLoaded", function() {
    const browserSpan = document.getElementById("browser-name");
    if (browserSpan) {
        browserSpan.textContent = getBrowserName();
    }
    const osSpan = document.getElementById("os-name");
    if (osSpan) {
        osSpan.textContent = getOSName();
    }
});