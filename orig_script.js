// Paste your production Google Web App URL inside these quotes
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_4lw1FSYR8bG5R1HNvtqEIyNC7XH7PaktKnCbpngF-7L75ZS8hxUDE5ziaSumCeZ4Ng/exec";

const playerContainer = document.getElementById('playerContainer');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const previewModal = document.getElementById('previewModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const finalSubmitBtn = document.getElementById('finalSubmitBtn');

let rowCounter = 1; 
let globalFormData = {}; 

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

// Processes data mapping inputs to verification template window
document.getElementById('teamForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
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

    globalFormData = {
        teamName: document.getElementById('teamName').value,
        contactName: document.getElementById('contactName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        textColor: document.getElementById('textColor').value,
        players: players
    };

    document.getElementById('pTeamName').innerText = globalFormData.teamName;
    document.getElementById('pContactName').innerText = globalFormData.contactName;
    document.getElementById('pPhone').innerText = globalFormData.phone;
    document.getElementById('pEmail').innerText = globalFormData.email;
    document.getElementById('pTextColor').innerText = globalFormData.textColor;

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

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(globalFormData),
        mode: 'no-cors'
    })
    .then(() => {
        alert('Registration successfully submitted!');
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
