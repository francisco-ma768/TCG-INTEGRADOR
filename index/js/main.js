// **====================================================**
// ** VARIABLES GLOBALES DE JUEGO (SPRINT 5) **
// **====================================================**

let currentMana = 0; 
let maxMana = 5;
let draggedCard = null; 

// Variables para el Mazo y el control de turnos
let deck = []; // Mazo completo del jugador
let isPlayerTurn = true; 

// Variables de Puntos de Vida y Mazo
let playerHealth = 30;  // Vida inicial del Jugador
let opponentHealth = 30; // Vida inicial del Oponente
let playerDeckSize = 0; // Se actualiza después de initializeDeckAndHand
// NOTA: Para simulación, el oponente no necesita un mazo y mano completos por ahora.

// **====================================================**
// ** GESTIÓN DE RECURSOS (MANÁ) Y TURNOS **
// **====================================================**

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

// **====================================================**
// ** LÓGICA DE DRAG AND DROP (ARRRASTRAR Y SOLTAR) **
// **====================================================**

function handleDragStart(e) {
    // 1. Guarda la carta que está siendo arrastrada
    draggedCard = this;
    
    // 2. Transfiere la información clave de la carta (Coste, Tipo, Valor, Efecto)
    const cost = this.getAttribute('data-cost');
    const type = this.getAttribute('data-type'); 
    const value = this.getAttribute('data-value'); 
    const effect = this.getAttribute('data-effect');

    e.dataTransfer.setData('text/cost', cost);
    e.dataTransfer.setData('text/type', type); 
    e.dataTransfer.setData('text/value', value); 
    e.dataTransfer.setData('text/effect', effect);

    // 3. Oculta visualmente la carta arrastrada
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
    // La zona de soltar del jugador debe tener la clase 'player-field-row' o 'drop-zone'
    const isPlayerField = dropZone.closest('.player-field-row') !== null; 

    // 1. Obtener la información de la carta arrastrada
    const cost = parseInt(e.dataTransfer.getData('text/cost'));
    const type = e.dataTransfer.getData('text/type');
    
    // 2. Comprobar si se puede pagar
    if (!payCardCost(cost)) {
        return; 
    }
    
    // 3. Lógica específica según el TIPO de carta
    if (type === 'Luchador') {
        // A) LUCHADOR: Se queda en el campo si el slot está libre
        if (dropZone.querySelector('.card-visual')) {
            console.log("Slot ya ocupado. No se puede jugar aquí.");
            // Restaurar maná si no se juega
            currentMana += cost;
            updateManaDisplay();
            return;
        }

        draggedCard.style.visibility = 'visible'; 
        draggedCard.parentNode.removeChild(draggedCard);
        dropZone.appendChild(draggedCard);
        
        // Deshabilitar Drag en el campo
        draggedCard.setAttribute('draggable', 'false');
        draggedCard.removeEventListener('dragstart', handleDragStart);
        draggedCard.removeEventListener('dragend', handleDragEnd);

        console.log(`¡Luchador jugado con éxito! Costo: ${cost}. Maná restante: ${currentMana}`);
        
    } else if (type === 'Habilidad' || type === 'Curación') {
        // B) HABILIDAD: Aplicar efecto inmediatamente y desechar la carta.
        
        if (isPlayerField) { 
            const value = parseInt(e.dataTransfer.getData('text/value'));
            const effect = e.dataTransfer.getData('text/effect');
            applyAbility(effect, value); 
            
            // Eliminar la carta del DOM (se desecha)
            draggedCard.parentNode.removeChild(draggedCard);
            console.log(`¡Habilidad jugada! Efecto: ${effect}. Carta desechada.`);
        } else {
             console.warn("Las habilidades solo se pueden jugar en el campo del jugador.");
             // Restaurar maná si no se juega en la zona correcta
             currentMana += cost;
             updateManaDisplay();
             return;
        }
    }
}

function addDragDropListeners() {
    // A) Inicializa Eventos de Arrastre en las Cartas de la Mano
    const cards = document.querySelectorAll('#player-hand .card-visual');
    cards.forEach(card => {
        if (card.getAttribute('draggable') === 'true') {
             card.addEventListener('dragstart', handleDragStart);
             card.addEventListener('dragend', handleDragEnd);
        }
    });

    // B) Inicializa Eventos en las Zonas de Soltar
    // NOTA: Asegúrate de que las zonas del jugador tengan la clase 'drop-zone'
    const dropZones = document.querySelectorAll('.player-field-row .drop-zone');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
    });
    console.log("Eventos de Drag and Drop inicializados.");
}

// **====================================================**
// ** LÓGICA DE HABILIDADES **
// **====================================================**

function applyAbility(effect, value) {
    if (effect === 'Maná') {
        currentMana = Math.min(currentMana + value, 10); 
        updateManaDisplay();
        
    } else if (effect === 'Robo') {
        for (let i = 0; i < value; i++) {
            drawCard();
        }
        
    } else if (effect === 'Curación') {
        // Lógica de Curación: Curar la carta con menos vida, por ejemplo
        console.log(`¡Curación no implementada! Curar ${value}`);
    } 
}


// **====================================================**
// ** GESTIÓN DE PUNTOS DE VIDA Y VICTORIA/DERROTA **
// ** (SPRINT 5) **
// **====================================================**

function updateHealthDisplay() {
    // Asegúrate de que tienes un elemento con ID 'player-health' y 'opponent-health' en tu HTML
    const playerHealthDisplay = document.getElementById('player-health');
    const opponentHealthDisplay = document.getElementById('opponent-health');

    if (playerHealthDisplay) playerHealthDisplay.textContent = `❤️ ${playerHealth}`;
    if (opponentHealthDisplay) opponentHealthDisplay.textContent = `❤️ ${opponentHealth}`;
}

function checkGameEnd() {
    if (playerHealth <= 0) {
        alert("¡DERROTA! Tus Puntos de Vida han llegado a 0.");
        disableGameControls();
        return true;
    }
    if (opponentHealth <= 0) {
        alert("¡VICTORIA! Los Puntos de Vida del Oponente han llegado a 0.");
        disableGameControls();
        return true;
    }
    // Condición de derrota por mazo vacío (Si no puedes robar y no hay cartas en mano)
    if (deck.length === 0 && document.getElementById('player-hand').children.length === 0 && playerHealth > 0) {
        alert("¡DERROTA! Te quedaste sin cartas para robar y sin mano.");
        disableGameControls();
        return true;
    }
    return false;
}

function disableGameControls() {
    const endTurnButton = document.querySelector('.end-turn-button');
    if (endTurnButton) endTurnButton.disabled = true;
    // Desactivar drag and drop en la mano si el juego termina
    document.querySelectorAll('#player-hand .card-visual').forEach(card => card.setAttribute('draggable', 'false'));
}


function playerLosesHealth(damage) {
    playerHealth -= damage;
    if (playerHealth < 0) playerHealth = 0;
    updateHealthDisplay();
    console.log(`El Jugador pierde ${damage} de vida. Vida restante: ${playerHealth}`);
    checkGameEnd();
}

function opponentLosesHealth(damage) {
    opponentHealth -= damage;
    if (opponentHealth < 0) opponentHealth = 0;
    updateHealthDisplay();
    console.log(`El Oponente pierde ${damage} de vida. Vida restante: ${opponentHealth}`);
    checkGameEnd();
}

// Función obsoleta, ahora el daño directo va a la vida.
function opponentLosesCards(count) { 
    opponentLosesHealth(count); 
}


// **====================================================**
// ** LÓGICA DE COMBATE DIRECTO **
// ** (SPRINT 5) **
// **====================================================**

function getCardStats(slotElement) {
    const cardVisual = slotElement.querySelector('.card-visual');
    if (!cardVisual) return null;

    const attackSpan = cardVisual.querySelector('.stat-atk');
    const attackValue = attackSpan ? parseInt(attackSpan.textContent.replace('⚔️', '').trim()) : 0;
    const cardType = cardVisual.getAttribute('data-type');
    
    return { 
        ataque: attackValue,
        tipo: cardType 
    };
}

function updateCardDefense(cardElement, damage) {
    let currentDefense = parseInt(cardElement.getAttribute('data-current-defense'));
    const cardId = cardElement.getAttribute('data-id');

    currentDefense -= damage;
    
    if (currentDefense <= 0) {
        // 1. Carta Destruida
        console.log(`¡Carta ${cardElement.querySelector('.card-name').textContent} DESTRUIDA!`);
        // Opcional: Añadir clase 'destroyed' para animación de CSS antes de eliminarla
        cardElement.classList.add('destroyed'); 
        
        // Eliminar el elemento del DOM después de un breve delay para la animación
        setTimeout(() => {
             // Resetea el slot a su estado inicial (ej. "Tu Slot 1")
             const slotId = cardElement.parentNode.getAttribute('data-slot-id');
             const slotType = cardElement.parentNode.classList.contains('opponent-drop-zone') ? 'Oponente Slot ' : 'Tu Slot ';
             cardElement.parentNode.innerHTML = slotType + slotId.slice(-1); 
        }, 500);
        
    } else {
        // 2. Actualiza la vida
        cardElement.setAttribute('data-current-defense', currentDefense);
        
        // Actualizar el valor visual (el span 🛡️)
        const defenseDisplay = cardElement.querySelector(`#def-${cardId}`);
        if (defenseDisplay) {
            defenseDisplay.textContent = `🛡️ ${currentDefense}`;
        }
    }
}


function processCombatPhase() {
    if (checkGameEnd()) return;

    console.log("----------------------");
    console.log("INICIO DE FASE DE COMBATE");
    
    const playerSlots = document.querySelectorAll('.player-field-row .drop-zone');
    // Asumimos que los slots del oponente tienen la clase 'opponent-drop-zone'
    const opponentSlots = document.querySelectorAll('.opponent-row .drop-zone'); 
    
    playerSlots.forEach((playerSlot, index) => {
        const playerCardVisual = playerSlot.querySelector('.card-visual');
        const opponentSlot = opponentSlots[index]; // Slot opuesto
        
        if (playerCardVisual) {
            const playerCardStats = getCardStats(playerSlot);
            
            if (playerCardStats && playerCardStats.tipo === 'Luchador') {
                const playerAttack = playerCardStats.ataque;
                
                const opponentCardVisual = opponentSlot ? opponentSlot.querySelector('.card-visual') : null;
                
                if (opponentCardVisual && getCardStats(opponentSlot).tipo === 'Luchador') {
                    // 1. COMBATE CUERPO A CUERPO
                    const opponentAttack = getCardStats(opponentSlot).ataque;
                    
                    // Jugador ataca al Oponente
                    updateCardDefense(opponentCardVisual, playerAttack); 
                    
                    // Oponente contraataca al Jugador
                    updateCardDefense(playerCardVisual, opponentAttack);
                    
                } else if (playerAttack > 0) {
                    // 2. ATAQUE DIRECTO (Si no hay enemigo enfrente)
                    opponentLosesHealth(playerAttack); 
                }
            }
        }
    });
    
    console.log("FIN DE FASE DE COMBATE");
    console.log("----------------------");
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
        // Si el mazo está vacío, verifica si el juego debe terminar
        checkGameEnd(); 
    }
}

function endTurn() {
    if (checkGameEnd()) return;

    console.log("======================================");
    console.log("FIN DEL TURNO DEL JUGADOR");
    
    processCombatPhase();
    
    isPlayerTurn = false;
    document.querySelector('.end-turn-button').disabled = true;

    // Simulación de Turno del Oponente
    setTimeout(() => {
        console.log("... Simulación de Turno del Oponente...");
        opponentTurnSimulation(); // NUEVO: Llamada a la simulación del turno enemigo
        startPlayerTurn();
    }, 2000); 
}

function opponentTurnSimulation() {
            // 1. Prioridad: Jugar una carta Luchadora si hay un slot vacío.
            const opponentSlots = document.querySelectorAll('.opponent-row .drop-zone');
            const availableSlot = Array.from(opponentSlots).find(slot => !slot.querySelector('.card-visual'));
            
            if (availableSlot) {
                // Simular que el oponente juega una carta Luchadora de fuerza media (Ataque 2, Vida 10)
                availableSlot.innerHTML = createOpponentCardHTML({
                    id: 'op' + availableSlot.getAttribute('data-slot-id').slice(-1), 
                    nombre: 'Guerrero Oscuro', 
                    ataque: 2, 
                    defensa: 10, // <--- AHORA SIEMPRE ES 10
                    tipo: 'Luchador'
                });
                console.log("Oponente jugó un Guerrerro Oscuro en un slot vacío.");
            }
            else {
                console.log("Campo del Oponente lleno. No juega cartas adicionales.");
            }
        }

function createOpponentCardHTML(card) {
    // HTML simple para un luchador oponente (para simulación)
    return `
        <div class="card-visual opponent-card" data-id="${card.id}" data-type="${card.tipo}" data-current-defense="${card.defensa}">
            <div class="card-cost">?</div>
            <div class="card-name">${card.nombre}</div>
            <div class="card-image-placeholder" style="background-color: #3a1e1e;">OPONENTE</div>
            <div class="card-stats">
                 <span class="stat-value stat-atk">⚔️ ${card.ataque}</span>
                 <span class="stat-value stat-def" id="def-${card.id}">🛡️ ${card.defensa}</span>
            </div>
        </div>
    `;
}

function startPlayerTurn() {
    if (checkGameEnd()) return;

    console.log("======================================");
    console.log("INICIO DEL TURNO DEL JUGADOR");
    isPlayerTurn = true;
    
    const endTurnButton = document.querySelector('.end-turn-button');
    if (endTurnButton) {
        endTurnButton.disabled = false;
    }
    
    drawCard(); 
    
    maxMana = Math.min(maxMana + 1, 10); 
    startTurn(); // Resetea el maná
    
    addDragDropListeners(); 
    
    console.log(`¡Tu turno! Maná máximo ahora es: ${maxMana}`);
}

// **====================================================**
// ** CARGA Y DIBUJO DE CARTAS **
// **====================================================**

async function loadCardData() {
    try {
        const response = await fetch('data/carta.json'); 
        if (!response.ok) {
            console.error(`Error de red al cargar JSON: HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("No se pudieron cargar los datos de las cartas (Verifique data/carta.json y la sintaxis):", error);
        return []; 
    }
}

function createCardElement(card) {
            // ... (código previo)

            const defenseValue = card.defensa || 10; // <<-- AHORA USA 10 POR DEFECTO
            if (card.tipo === 'Luchador') {
                cardElement.setAttribute('data-current-defense', defenseValue); 
            }
            
            // Contenido HTML de la carta
            cardElement.innerHTML = `
                <div class="card-cost">${card.costo}</div>
                <div class="card-name">${card.nombre}</div>
                <div class="card-image-placeholder">
                    ${card.imagen ? `<img src="assets/${card.imagen}" alt="${card.nombre}" style="width: 100%; height: 100%; object-fit: cover;">` : card.tipo}
                </div>
                <div class="card-stats">
                    ${card.tipo === 'Luchador' ? 
                        `<span class="stat-value stat-atk">⚔️ ${card.ataque}</span>
                         <span class="stat-value stat-def" id="def-${card.id}">🛡️ ${defenseValue}</span>` 
                        : `<span class="stat-value stat-habilidad">${card.efecto} ${card.valor || ''}</span>`
                    }
                </div>
            `;
            return cardElement;
        }
async function initializeDeckAndHand() {
    const allCards = await loadCardData();
    
    deck = allCards.sort(() => Math.random() - 0.5); 
    
    const handContainer = document.getElementById('player-hand');
    
    for (let i = 0; i < 5; i++) {
        if (deck.length > 0) {
            const cardData = deck.shift(); 
            const cardElement = createCardElement(cardData);
            handContainer.appendChild(cardElement);
        }
    }
    
    console.log(`Mazo inicializado. Cartas en el mazo: ${deck.length}`);
    return Promise.resolve();
}

// **====================================================**
// ** INICIALIZACIÓN PRINCIPAL **
// **====================================================**

window.onload = function() {
    
    // 1. Inicializa Vida y Maná
    updateHealthDisplay();
    startTurn();
    
    // 2. Inicializa mazo y mano
    initializeDeckAndHand().then(() => {
        // 3. Añade los eventos de Drag and Drop
        addDragDropListeners(); 
    });
};