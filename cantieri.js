/* ================= RUBRICA LOTTI ================= QUALITY FEATURE */
const RUBRICA_LOTTI = {
    "HERGO_FOGGIA_66MW": ["Lotto B", "Lotto C", "Lotto D"],
    "TEST_TEST_12MW": ["Lotto ZETA", "Lotto CAIO", "Lotto DUE"],
    "DEFAULT": ["LOTTO UNICO", "LOTTO A", "LOTTO B"] 
};

/* ================= FUNZIONE GLOBALE CANTIERE ================= */
function aggiornaDatiCantiere(nomeCantiereGrezzo) {
    if (!nomeCantiereGrezzo) nomeCantiereGrezzo = "";

    // 1. Pulizia base
    const nomePulito = nomeCantiereGrezzo.replace(/[\/\\]/g, '').trim();

    // 2. AGGIORNAMENTO LOTTI
    const selectLotto = document.getElementById('stato'); 
    if (selectLotto) {
        const nomeSicuro = nomePulito.toUpperCase();
        const lotti = RUBRICA_LOTTI[nomeSicuro] || RUBRICA_LOTTI["DEFAULT"] || [];
        
        selectLotto.innerHTML = '<option value="" disabled selected>Seleziona lotto...</option>';
        lotti.forEach(lotto => {
            selectLotto.innerHTML += `<option value="${lotto}">${lotto}</option>`;
        });
    }

    // 3. AUTO-COMPILAZIONE LUOGO E POTENZA
    const parti = nomePulito.split('_');
    const campoLuogo = document.getElementById('luogo');
    const campoPotenza = document.getElementById('potenza');

    // Compila il Luogo (es. "Foggia")
    if (campoLuogo) {
        campoLuogo.value = parti[1] ? parti[1] : '';
    }

    // Compila la Potenza isolando solo il numero (es. da "66MW" estrae "66")
    if (campoPotenza) {
        if (parti[2]) {
            // Sostituisce un'eventuale virgola italiana con il punto decimale
            let stringaPotenza = parti[2].replace(',', '.');
            let numeroPotenza = parseFloat(stringaPotenza);
            
            // Se è un numero valido, lo inserisce, altrimenti svuota
            campoPotenza.value = !isNaN(numeroPotenza) ? numeroPotenza : '';
        } else {
            campoPotenza.value = '';
        }
    }
}

/* ================= COLLEGAMENTO AL CANTIERE ================= */
// Aggiorna la tendina, gestisce il campo nascosto e lancia l'autocompilazione
function handleImpiantoChange() {
    const select = document.getElementById('impiantoSelect');
    const input = document.getElementById('impianto');
    
    if (select.value === '_NEW_') {
        input.classList.remove('hidden');
        input.value = '';
        input.focus();
        // Richiama DEFAULT: carica i lotti standard e lascia vuoti Luogo e Potenza
        aggiornaDatiCantiere("DEFAULT"); 
    } else {
        input.classList.add('hidden');
        input.value = select.value;
        // Richiama il cantiere: carica i lotti blindati ed estrae Luogo e Potenza
        aggiornaDatiCantiere(select.value); 
    }
}
