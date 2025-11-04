// **----------------------------------------------------**
// ** VARIABLES GLOBALES DE JUEGO **
// **----------------------------------------------------**

let currentMana = 0; 
let maxMana = 5;
let draggedCard = null; 

// Variables para el Mazo y el control de turnos
let deck = []; // Mazo completo del jugador
let isPlayerTurn = true; // Controla quién está jugando

// **----------------------------------------------------**
// ** GESTIÓN DE RECURSOS (MANÁ) **
// **----------------------------------------------------**

function updateManaDisplay() {
    const manaDisplay = document.getElementById('player-mana');
    if (manaDisplay) {
        manaDisplay.textContent = `✨ ${currentMana} / ${maxMana}`;
    }
}

function startTurn() {
    // La energía se recarga a su máximo al inicio del turno
    currentMana = maxMana;
    updateManaDisplay();
    console.log(`Turno iniciado. Recursos: ${currentMana}/${maxMana}`);
}

function payCardCost(cost) {
    if (currentMana >= cost) {
        currentMana -= cost;
        updateManaDisplay();
        return true; // Se pudo pagar
    } else {
        console.warn(`¡ALERTA! Maná insuficiente. Requerido: ${cost}, Disponible: ${currentMana}`);
        return false; // No se pudo pagar
    }
}

// **----------------------------------------------------**
// ** LÓGICA DE DRAG AND DROP (ARRRASTRAR Y SOLTAR) **
// **----------------------------------------------------**

function handleDragStart(e) {
    draggedCard = this;
    const cost = this.getAttribute('data-cost');
    e.dataTransfer.setData('text/plain', cost);

    // Oculta visualmente la carta arrastrada
    setTimeout(() => (this.style.visibility = 'hidden'), 0); 
}

function handleDragEnd(e) {
    // Si la carta no se soltó en un drop zone válido, vuelve a ser visible
    this.style.visibility = 'visible';
    draggedCard = null;
}

function handleDragOver(e) {
    e.preventDefault(); 
}

function handleDrop(e) {
    e.preventDefault();
    
    const dropZone = this;

    // 1. Verificar si el slot ya está ocupado
    if (dropZone.querySelector('.card-visual')) {
        console.log("Slot ya ocupado. No se puede jugar aquí.");
        return;
    }

    // 2. Obtener el costo y verificar si se puede pagar
    const cost = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (payCardCost(cost)) {
        // Éxito:
        draggedCard.style.visibility = 'visible'; 
        draggedCard.parentNode.removeChild(draggedCard);
        dropZone.appendChild(draggedCard);
        
        // Deshabilitamos el drag para la carta que ya está en juego
        draggedCard.setAttribute('draggable', 'false');
        draggedCard.removeEventListener('dragstart', handleDragStart);
        draggedCard.removeEventListener('dragend', handleDragEnd);

        console.log(`¡Carta jugada con éxito! Costo: ${cost}. Maná restante: ${currentMana}`);
    } else {
        // Fracaso:
        console.log("No se pudo jugar la carta, costo insuficiente.");
    }
}

function addDragDropListeners() {
    // A) Inicializa Eventos de Arrastre en las Cartas de la Mano
    const cards = document.querySelectorAll('#player-hand .card-visual');
    cards.forEach(card => {
        // Evita añadir el listener si ya fue jugado y se le quitó el draggable
        if (card.getAttribute('draggable') === 'true') {
             card.addEventListener('dragstart', handleDragStart);
             card.addEventListener('dragend', handleDragEnd);
        }
    });

    // B) Inicializa Eventos en las Zonas de Soltar
    const dropZones = document.querySelectorAll('.drop-zone');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
    });
    console.log("Eventos de Drag and Drop inicializados.");
}

// **----------------------------------------------------**
// ** LÓGICA DE COMBATE Y CONTROL DE TURNOS **
// **----------------------------------------------------**

function getCardStats(slotElement) {
    const cardVisual = slotElement.querySelector('.card-visual');
    if (!cardVisual) return null;

    // Lee el Ataque (⚔️)
    const attackSpan = cardVisual.querySelector('.stat-atk');
    const attackValue = attackSpan ? parseInt(attackSpan.textContent.replace('⚔️', '').trim()) : 0;
    
    // Lee el tipo de la carta (Luchador, Habilidad, etc.)
    const cardId = cardVisual.getAttribute('data-id'); 
    
    // NOTA: Para obtener el tipo, tendríamos que buscar el ID en el mazo original,
    // pero por ahora, solo verificamos si tiene Ataque para asumir que es Luchador.
    // Si necesitas el tipo exacto para las habilidades, necesitaríamos añadir el tipo
    // como data-attribute en la función createCardElement.
    
    return { 
        ataque: attackValue,
        tipo: attackValue > 0 ? 'Luchador' : 'Habilidad' 
    };
}


function processCombatPhase() {
    console.log("----------------------");
    console.log("INICIO DE FASE DE COMBATE");
    
    const playerSlots = document.querySelectorAll('.player-field-row .drop-zone');
    
    playerSlots.forEach((playerSlot, index) => {
        const playerCardStats = getCardStats(playerSlot);
        
        if (playerCardStats && playerCardStats.tipo === 'Luchador') {
            const damage = playerCardStats.ataque;
            
            if (damage > 0) {
                // Simulación de daño directo al oponente (pérdida de cartas)
                console.log(`Carta del jugador en Slot ${index + 1} ataca con ${damage}.`);
                
                // Lógica de daño al oponente (pérdida de cartas del mazo/mano)
                opponentLosesCards(damage); 
            }
        }
        // TODO: En futuras etapas, aquí se implementará la lógica para cartas de Habilidad
    });
    
    console.log("FIN DE FASE DE COMBATE");
    console.log("----------------------");
}

function opponentLosesCards(count) {
    // Simulación: El oponente recibe "daño" al mazo/mano.
    // En un juego real, esto afectaría el array 'opponentDeck'.
    console.log(`El Oponente ha perdido la cuenta de ${count} cartas (Simulación de daño al mazo/mano).`);
    // Aquí podrías implementar la lógica para verificar si el oponente pierde al quedarse sin cartas.
}

function drawCard() {
    const handContainer = document.getElementById('player-hand');
    
    if (handContainer.children.length >= 5) {
        console.warn("Mano llena (5 cartas). No se puede robar.");
        return;
    }
    
    if (deck.length > 0) {
        const cardData = deck.shift();
        const cardElement = createCardElement(cardData);
        handContainer.appendChild(cardElement);
        
        // Vuelve a añadir los listeners de Drag and Drop a la *nueva* carta
        cardElement.addEventListener('dragstart', handleDragStart);
        cardElement.addEventListener('dragend', handleDragEnd);
        
        console.log(`Carta robada: ${cardData.nombre}. Cartas restantes en el mazo: ${deck.length}`);
        
    } else {
        console.error("¡El mazo está vacío! Deberías perder la partida.");
        alert("¡Derrota! Tu mazo se ha agotado. Fin del Juego.");
        document.querySelector('.end-turn-button').disabled = true;
    }
}

function endTurn() {
    console.log("======================================");
    console.log("FIN DEL TURNO DEL JUGADOR");
    
    processCombatPhase();
    
    isPlayerTurn = false;
    document.querySelector('.end-turn-button').disabled = true;

    // Simulación de Turno del Oponente
    setTimeout(() => {
        console.log("... Simulación de Turno del Oponente...");
        // Aquí se simularía que el oponente juega/ataca.
        startPlayerTurn();
    }, 2000); 
}

function startPlayerTurn() {
    console.log("======================================");
    console.log("INICIO DEL TURNO DEL JUGADOR");
    isPlayerTurn = true;
    document.querySelector('.end-turn-button').disabled = false;
    
    drawCard(); 
    
    maxMana = Math.min(maxMana + 1, 10); 
    startTurn();
    
    addDragDropListeners(); 
    
    console.log(`¡Tu turno! Maná máximo ahora es: ${maxMana}`);
}

// **----------------------------------------------------**
// ** CARGA Y DIBUJO DE CARTAS **
// **----------------------------------------------------**

async function loadCardData() {
    try {
        // La ruta debe ser 'data/cartas.json' si el archivo está en esa carpeta.
        const response = await fetch('data/cartas.json'); 
        if (!response.ok) {
            console.error(`Error de red al cargar JSON: HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("No se pudieron cargar los datos de las cartas (Verifique data/cartas.json):", error);
        return []; 
    }
}

function createCardElement(card) {
    const cardElement = document.createElement('div');
    
    let typeClass = (card.tipo === 'Habilidad' || card.tipo === 'Curación') ? ' habilidad' : '';
    cardElement.className = 'card-visual' + typeClass;
    
    cardElement.setAttribute('draggable', 'true'); 
    cardElement.setAttribute('data-cost', card.costo);
    cardElement.setAttribute('data-id', card.id);
    
    // Contenido HTML de la carta
    cardElement.innerHTML = `
        <div class="card-cost">${card.costo}</div>
        <div class="card-name">${card.nombre}</div>
        <div class="card-image-placeholder">
            ${card.tipo}
        </div>
        <div class="card-stats">
            ${card.tipo === 'Luchador' ? 
                // REQUERIMIENTO: La Defensa (Vida de la Carta) es fija en 10
                `<span class="stat-value stat-atk">⚔️ ${card.ataque}</span>
                 <span class="stat-value stat-def">🛡️ 10</span>` 
                : `<span class="stat-value stat-habilidad">${card.efecto} ${card.valor}</span>`
            }
        </div>
    `;
    return cardElement;
}

async function initializeDeckAndHand() {
    const allCards = await loadCardData();
    
    // Mezcla el mazo (simulación simple)
    deck = allCards.sort(() => Math.random() - 0.5); 
    
    const handContainer = document.getElementById('player-hand');
    
    // Reparte las 5 cartas iniciales
    for (let i = 0; i < 5; i++) {
        if (deck.length > 0) {
            const cardData = deck.shift(); // Quita la carta del mazo
            const cardElement = createCardElement(cardData);
            handContainer.appendChild(cardElement);
        }
    }
    
    console.log(`Mazo inicializado. Cartas en el mazo: ${deck.length}`);
    return Promise.resolve();
}

// **----------------------------------------------------**
// ** INICIALIZACIÓN PRINCIPAL **
// **----------------------------------------------------**

window.onload = function() {
    
    // 1. Inicializa los recursos del jugador (empieza con 5)
    startTurn();
    
    // 2. Inicializa el mazo, reparte la mano y luego añade los eventos.
    initializeDeckAndHand().then(() => {
        // 3. Una vez que las cartas y el DOM están listos, añade los eventos de Drag and Drop
        addDragDropListeners(); 
    });
};