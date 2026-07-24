// Paste your production Google Web App URL inside these quotes
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzmMYaRUCd0MZno9L6nN5AoOXNjrzuzFUvBVM40jUbAEYniyDZ1Da_ynR021pT5KyKf/exec";
const playerContainer = document.getElementById('playerContainer');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const previewModal = document.getElementById('previewModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const finalSubmitBtn = document.getElementById('finalSubmitBtn');
let rowCounter = 1;
let globalFormData = {};

// ==========================================================================
// NEW: HEX COLOR GRID SELECTION CORE ENGINE BLOCK
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const colorCards = document.querySelectorAll(".color-card");
    const textColorInput = document.getElementById("textColor");

    function selectColor(hexValue) {
        if (!textColorInput) return;
        textColorInput.value = hexValue;

        colorCards.forEach(card => {
            if (card.getAttribute("data-value") === hexValue) {
                card.classList.add("selected");
            } else {
                card.classList.remove("selected");
            }
        });
    }

    // Set initial baseline color default to BLACK (#000000)
    selectColor("#000000");

    colorCards.forEach(card => {
        card.addEventListener("click", () => {
            const selectedHex = card.getAttribute("data-value");
            selectColor(selectedHex);
        });
    });

    // Reset picker back to black default upon full form clean execution
    const teamFormElement = document.getElementById('teamForm');
    if (teamFormElement) {
        teamFormElement.addEventListener("reset", () => {
            setTimeout(() => selectColor("#000000"), 0);
        });
    }
});

function attachRemoveEvent(rowElement) {
    const removeBtn = rowElement.querySelector('.remove-btn');
    if(removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (playerContainer.children.length > 1) {
                rowElement.remove();
            } else {
                alert("You must include at least one player.");
            }
        });
    }
}

// Map row event to initial default template layout instance
attachRemoveEvent(playerContainer.querySelector('.player-row'));

// Generates secondary player blocks with checked configurations set to Last Name
addPlayerBtn.addEventListener('click', () => {
    rowCounter++;
    const newRow = document.createElement('div');
    newRow.className = 'player-row';
    newRow.setAttribute('data-id', rowCounter);
    newRow.innerHTML = `
        <div class="row-inputs">
            <input type="number" placeholder="Jersey #" class="jersey" min="0" max="99" required>
            <input type="text" placeholder="First Name" class="firstName" required>
            <input type="text" placeholder="Last Name" class="lastName" required>
            <input type="text" placeholder="Nickname (Optional)" class="nickname">
        </div>
        <div class="print-options">
            <span>Print on Jersey:</span>
            <label><input type="radio" name="printTarget_${rowCounter}" value="first"> First Name</label>
            <label><input type="radio" name="printTarget_${rowCounter}" value="last" checked> Last Name</label>
            <label><input type="radio" name="printTarget_${rowCounter}" value="nick"> Nickname</label>
        </div>
        <button type="button" class="remove-btn">✕ Remove</button>
    `;
    attachRemoveEvent(newRow);
    playerContainer.appendChild(newRow);
});

closeModalBtn.addEventListener('click', () => {
    previewModal.style.display = 'none';
});

// Real-time listener that automatically formats 10-digit dashes (XXX-XXX-XXXX) as the user types
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Strip all non-digits
    
    // Slice and re-format into structural pattern: XXX-XXX-XXXX
    if (value.length > 3 && value.length <= 6) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 6) {
        value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
    }
    
    e.target.value = value;
});

// Processes data mapping inputs to verification template window
document.getElementById('teamForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear out any stale input error states before calculating new validation runs
    const errorContainers = document.querySelectorAll('.error-message');
    errorContainers.forEach(container => {
        container.innerText = "";
        container.style.display = "none";
    });
    
    const errorInputs = document.querySelectorAll('.field-error-border');
    errorInputs.forEach(input => input.classList.remove('field-error-border'));
    
    // ----------------------------------------------------------------------
    // 1. INLINE FIELD RULE: 10-DIGIT PHONE NUMBER VALIDATION PIPELINE
    // ----------------------------------------------------------------------
    const phoneElement = document.getElementById('phone');
    const phoneInput = phoneElement.value;
    const cleanPhone = phoneInput.replace(/\D/g, ''); // Strip out dashes for calculation
    
    if (cleanPhone.length !== 10) {
        const phoneError = document.getElementById('phoneError');
        phoneError.innerText = `Phone number must be exactly 10 digits long! (You entered ${cleanPhone.length} digits)`;
        phoneError.style.display = "block";
        phoneElement.classList.add('field-error-border');
        phoneElement.focus();
        return; // Halt form execution cleanly without pop-ups
    }
    
    // ----------------------------------------------------------------------
    // 2. FIELD RULE: DUPLICATE JERSEY NUMBER VALIDATION PIPELINE
    // ----------------------------------------------------------------------
    const jerseyInputs = playerContainer.getElementsByClassName('jersey');
    const seenJerseys = {};
    let duplicateDetected = false;
    
    // Gather track paths for structural rows first
    for (let i = 0; i < jerseyInputs.length; i++) {
        const currentNumber = jerseyInputs[i].value.trim();
        if (currentNumber !== "") {
            if (seenJerseys[currentNumber] !== undefined) {
                // Duplicate discovered! Mark both active rows visually
                jerseyInputs[seenJerseys[currentNumber]].classList.add('field-error-border');
                jerseyInputs[i].classList.add('field-error-border');
                duplicateDetected = true;
            } else {
                seenJerseys[currentNumber] = i; // Save element index lookup point
            }
        }
    }
    
    if (duplicateDetected) {
        alert("Validation Error: Duplicate jersey numbers discovered! Multiple players cannot share the same jersey number layout.");
        return; // Halt form execution
    }

    const players = [];
    const rows = playerContainer.getElementsByClassName('player-row');
    
    for (let row of rows) {
        const id = row.getAttribute('data-id');
        const first = row.querySelector('.firstName').value;
        const last = row.querySelector('.lastName').value;
        const nick = row.querySelector('.nickname').value;
        const choice = row.querySelector(`input[name="printTarget_${id}"]:checked`).value;
        
        let finalPrintName = first;
        if (choice === 'last') finalPrintName = last;
        if (choice === 'nick') {
            if(!nick.trim()) {
                alert(`Error: Player with Jersey #${row.querySelector('.jersey').value} has "Nickname" selected for jersey print, but the field is empty!`);
                return;
            }
            finalPrintName = nick;
        }
        
        players.push({
            jersey: row.querySelector('.jersey').value,
            firstName: first,
            lastName: last,
            nickname: nick,
            nameOnJersey: finalPrintName
        });
    }

    // Extract the human-readable name attribute from the selected card
    const activeColorCard = document.querySelector(".color-card.selected");
    let chosenColorWord = "BLACK"; 
    let colorHex = "#000000";

    if (activeColorCard) {
        chosenColorWord = activeColorCard.getAttribute("data-name"); 
        colorHex = activeColorCard.getAttribute("data-value"); 
    }

    globalFormData = {
        teamName: document.getElementById('teamName').value,
        contactName: document.getElementById('contactName').value,
        phone: phoneInput, // Passes containing dashes out: XXX-XXX-XXXX
        email: document.getElementById('email').value,
        textColor: chosenColorWord, 
        players: players
    };

    document.getElementById('pTeamName').innerText = globalFormData.teamName;
    document.getElementById('pContactName').innerText = globalFormData.contactName;
    document.getElementById('pPhone').innerText = globalFormData.phone;
    document.getElementById('pEmail').innerText = globalFormData.email;
    
    // ----------------------------------------------------------------------
    // 3. HOOK: DISPLAY ONLY COLOR WORD NAME (NO HEX CODE IN PREVIEW)
    // ----------------------------------------------------------------------
    const pTextColorName = document.getElementById("pTextColorName");
    const pTextColorSwatch = document.getElementById("pTextColorSwatch");

    if (pTextColorName && pTextColorSwatch) {
        pTextColorName.textContent = globalFormData.textColor;
        pTextColorSwatch.style.backgroundColor = colorHex;
        pTextColorSwatch.style.border = colorHex.toLowerCase() === "#ffffff" ? "1px solid #ddd" : "1px solid #ccc";
    } else {
        const pTextColorFallback = document.getElementById('pTextColor');
        if (pTextColorFallback) pTextColorFallback.innerText = globalFormData.textColor;
    }

    const tbody = document.getElementById('p_rosterBody');
    tbody.innerHTML = "";
    globalFormData.players.forEach(p => {
        const nickLabel = p.nickname ? `"${p.nickname}"` : "-";
        tbody.innerHTML += `<tr>
            <td>#${p.jersey}</td>
            <td>${p.firstName} ${p.lastName}</td>
            <td><i>${nickLabel}</i></td>
            <td style="font-weight:bold; color:#007BFF;">${p.nameOnJersey}</td>
        </tr>`;
    });

    previewModal.style.display = 'block';
});


// Pushes localized data straight out to spreadsheet service script URL endpoint
finalSubmitBtn.addEventListener('click', () => {
    finalSubmitBtn.disabled = true;
    finalSubmitBtn.innerText = "Sending Data...";

    // Explicitly append the logo reference inside the payload object structure
    // This allows your Google Apps Script backend email layout engine to read and attach it
    globalFormData.logoUrl = "MMPLogo.jpg"; 
    
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(globalFormData),
        mode: 'no-cors'
    })
    .then(() => {
        // CHANGED: Custom form submission popup notification response text block message
        alert("Registration successfully submitted!\n\nThank you for the opportunity to serve you!");
        
        previewModal.style.display = 'none';
        document.getElementById('teamForm').reset();
        rowCounter = 1;
        playerContainer.innerHTML = `
            <div class="player-row" data-id="1">
                <div class="row-inputs">
                    <input type="number" placeholder="Jersey #" class="jersey" min="0" max="99" required>
                    <input type="text" placeholder="First Name" class="firstName" required>
                    <input type="text" placeholder="Last Name" class="lastName" required>
                    <input type="text" placeholder="Nickname (Optional)" class="nickname">
                </div>
                <div class="print-options">
                    <span>Print on Jersey:</span>
                    <label><input type="radio" name="printTarget_1" value="first"> First Name</label>
                    <label><input type="radio" name="printTarget_1" value="last" checked> Last Name</label>
                    <label><input type="radio" name="printTarget_1" value="nick"> Nickname</label>
                </div>
                <button type="button" class="remove-btn">✕ Remove</button>
            </div>
        `;
        attachRemoveEvent(playerContainer.querySelector('.player-row'));
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error saving your data.');
    })
    .finally(() => {
        finalSubmitBtn.disabled = false;
        finalSubmitBtn.innerText = "Confirm & Submit";
    });
});
