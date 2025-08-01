// Główny plik JavaScript dla aplikacji Projektant Ogrodu

window.addEventListener('load', () => {
    // Elementy DOM
    const canvas = document.getElementById('garden-canvas');
    const ctx = canvas.getContext('2d');
    const toolButtons = document.querySelectorAll('.tool-button');
    const controlsPanel = document.getElementById('controls');
    const sprinklerRangeInput = document.getElementById('sprinkler-range-input');

    // Ustawienia
    canvas.width = 800;
    canvas.height = 600;

    // Stan aplikacji
    let currentTool = 'draw_border';
    let gardenVertices = [];
    let gardenObjects = [];

    // --- RYSOWANIE ---
    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Narysuj obszar ogrodu (tło i granice)
        drawGardenArea();

        // 2. Narysuj obiekty fizyczne (drzewa, patio, korpusy spryskiwaczy)
        drawObjects();

        // 3. Narysuj pokrycie przez spryskiwacze z uwzględnieniem granic ogrodu
        ctx.save(); // Zapisz stan kontekstu (ważne przed clippingiem)

        // Stwórz ścieżkę do przycinania na podstawie granic ogrodu
        if (gardenVertices.length > 2) {
            ctx.beginPath();
            ctx.moveTo(gardenVertices[0].x, gardenVertices[0].y);
            for (let i = 1; i < gardenVertices.length; i++) {
                ctx.lineTo(gardenVertices[i].x, gardenVertices[i].y);
            }
            ctx.closePath();
            ctx.clip(); // Aktywuj przycinanie do tej ścieżki
        }

        // Narysuj zasięg spryskiwaczy, który teraz będzie przycięty do granic
        drawSprinklerCoverage();

        ctx.restore(); // Przywróć kontekst, aby usunąć ścieżkę przycinania
    }

    function drawGardenArea() {
        if (gardenVertices.length < 1) return;

        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(144, 238, 144, 0.3)';

        ctx.beginPath();
        ctx.moveTo(gardenVertices[0].x, gardenVertices[0].y);
        for (let i = 1; i < gardenVertices.length; i++) {
            ctx.lineTo(gardenVertices[i].x, gardenVertices[i].y);
        }

        if (gardenVertices.length > 2) {
            ctx.closePath();
            ctx.fill();
        }
        ctx.stroke();

        ctx.fillStyle = '#FF0000';
        gardenVertices.forEach(vertex => {
            ctx.beginPath();
            ctx.arc(vertex.x, vertex.y, 5, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    function drawObjects() {
        gardenObjects.forEach(obj => {
            if (obj.type === 'tree') {
                ctx.fillStyle = '#8B4513'; // Brązowy (pień)
                ctx.fillRect(obj.x - 5, obj.y, 10, 20);
                ctx.fillStyle = '#228B22'; // Zielony (korona)
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, 20, 0, 2 * Math.PI);
                ctx.fill();
            } else if (obj.type === 'patio') {
                ctx.fillStyle = '#C2B280'; // Piaskowy
                ctx.strokeStyle = '#8C7853';
                ctx.lineWidth = 2;
                ctx.fillRect(obj.x - 40, obj.y - 25, 80, 50);
                ctx.strokeRect(obj.x - 40, obj.y - 25, 80, 50);
            } else if (obj.type === 'sprinkler') {
                // Rysowanie samego korpusu spryskiwacza
                ctx.fillStyle = '#0000FF'; // Niebieski
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, 6, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    }

    function drawSprinklerCoverage() {
        ctx.fillStyle = 'rgba(0, 100, 255, 0.3)'; // Półprzezroczysty niebieski
        gardenObjects.forEach(obj => {
            if (obj.type === 'sprinkler') {
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.range, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    }

    // --- OBSŁUGA NARZĘDZI ---
    function setActiveTool(tool) {
        currentTool = tool;

        // Zarządzanie widocznością panelu kontrolnego
        if (tool === 'sprinkler') {
            controlsPanel.classList.add('visible');
        } else {
            controlsPanel.classList.remove('visible');
        }

        toolButtons.forEach(button => {
            if (button.id.includes(tool)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.id === 'draw-border-tool') {
                setActiveTool('draw_border');
            } else if (button.id === 'add-tree-tool') {
                setActiveTool('tree');
            } else if (button.id === 'add-patio-tool') {
                setActiveTool('patio');
            } else if (button.id === 'add-sprinkler-tool') {
                setActiveTool('sprinkler');
            }
        });
    });

    // --- OBSŁUGA PŁÓTNA (CANVAS) ---
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (currentTool === 'draw_border') {
            gardenVertices.push({ x, y });
        } else if (currentTool === 'tree' || currentTool === 'patio') {
            gardenObjects.push({ type: currentTool, x, y });
        } else if (currentTool === 'sprinkler') {
            const range = parseInt(sprinklerRangeInput.value, 10);
            gardenObjects.push({ type: 'sprinkler', x, y, range: range });
        }

        redraw();
    });

    // Początkowe info na canvasie
    function showInitialMessage() {
        if (gardenVertices.length === 0 && gardenObjects.length === 0) {
            ctx.font = "18px Arial";
            ctx.fillStyle = "#888";
            ctx.textAlign = "center";
            ctx.fillText("Wybierz 'Rysuj Granice' i klikaj, aby zdefiniować ogród.", canvas.width/2, canvas.height/2);
        }
    }

    setActiveTool('draw_border');
    showInitialMessage();
});
