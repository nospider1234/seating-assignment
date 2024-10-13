let namePool = [];
let pregnantGroup = [];
let assignedSeats = {};
let extraPeople = [];
let shortcuts = {};
let shortcutCounter = 1; // Start numbering from 1
let schedule = [];
let restrictedPair = { name1: "", name2: "" };

// Load saved shortcuts from localStorage
window.onload = function () {
    const savedShortcuts = localStorage.getItem('shortcuts');
    if (savedShortcuts) {
        shortcuts = JSON.parse(savedShortcuts);
        shortcutCounter = Math.max(...Object.keys(shortcuts)) + 1; // Set shortcutCounter to the next available number
        updateShortcutTable();
    }
};

// Add a name to the pool and display in the list
function addName() {
    const newName = document.getElementById('newName').value;
    if (newName) {
        namePool.push(newName);
        updateNameList();
        document.getElementById('newName').value = ''; // Clear input
    }
}

// Remove selected name from the pool
function removeSelectedName() {
    const select = document.getElementById('nameList');
    if (select.selectedIndex > -1) {
        namePool.splice(select.selectedIndex, 1); // Remove selected item from namePool
        updateNameList();
    }
}

// Update the name pool list UI
function updateNameList() {
    const select = document.getElementById('nameList');
    select.innerHTML = ''; // Clear current list
    namePool.forEach(name => {
        let option = document.createElement('option');
        option.text = name;
        select.add(option);
    });
}

// Add a name to the pregnant group
function addPregnant() {
    const pregnantName = document.getElementById('pregnantName').value;
    if (pregnantName) {
        pregnantGroup.push({ name: pregnantName, isPregnant: true });
        updatePregnantList();
        document.getElementById('pregnantName').value = ''; // Clear input
    }
}

// Update the pregnant group list UI
function updatePregnantList() {
    const select = document.getElementById('pregnantList');
    select.innerHTML = ''; // Clear current list
    pregnantGroup.forEach(person => {
        let option = document.createElement('option');
        option.text = person.name;
        select.add(option);
    });
}

// Add a shortcut to the table with auto-numbering
function addShortcut() {
    const name = document.getElementById('shortcutName').value;
    if (name) {
        shortcuts[shortcutCounter] = name;
        shortcutCounter++; // Increment counter for the next shortcut
        updateShortcutTable();
        saveShortcuts(); // Save to localStorage
        document.getElementById('shortcutName').value = ''; // Clear input
    }
}

// Update the shortcut table UI and enable manual changes
function updateShortcutTable() {
    const table = document.getElementById('shortcutTable');
    table.innerHTML = ''; // Clear current shortcuts
    for (let number in shortcuts) {
        const row = `<tr>
                        <td><input type="number" value="${number}" onchange="changeShortcutPosition(${number}, this.value)"></td>
                        <td><input type="text" value="${shortcuts[number]}" onchange="changeShortcutName(${number}, this.value)"></td>
                        <td><button onclick="deleteShortcut(${number})">Delete</button></td>
                     </tr>`;
        table.innerHTML += row;
    }
}

// Save shortcuts to localStorage
function saveShortcuts() {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
}

// Change the position of the shortcut manually
function changeShortcutPosition(oldNumber, newNumber) {
    if (shortcuts[newNumber]) {
        alert('This position is already taken.');
        return;
    }
    shortcuts[newNumber] = shortcuts[oldNumber];
    delete shortcuts[oldNumber];
    updateShortcutTable();
    saveShortcuts(); // Save updated table
}

// Change the name of the shortcut manually
function changeShortcutName(number, newName) {
    shortcuts[number] = newName;
    updateShortcutTable();
    saveShortcuts(); // Save updated table
}

// Delete a shortcut manually
function deleteShortcut(number) {
    delete shortcuts[number];
    updateShortcutTable();
    saveShortcuts(); // Save updated table
}

// Assign a shift for generation
function assignShift() {
    const seat1Name = document.getElementById('seat1').value;
    const name1 = document.getElementById('name1').value;
    const name2 = document.getElementById('name2').value;

    restrictedPair = { name1, name2 }; // Set restricted pair
    const shiftSeats = generateShift(seat1Name);
    updateSchedule(shiftSeats);
}

// Generate seat assignments
function generateShift(seat1Name) {
    let shiftSeats = {};
    let remainingPeople = [...namePool];

    // Assign seat 1 if a specific name is selected
    if (seat1Name) {
        shiftSeats[1] = { name: seat1Name };
        remainingPeople = remainingPeople.filter(p => p !== seat1Name); // Remove seat 1 person from the pool
    }

    // Pregnant group seating in seats 9-12
    for (let i = 12; i >= 9; i--) {
        if (pregnantGroup.length > 0) {
            shiftSeats[i] = pregnantGroup.shift();
        }
    }

    // Assign the remaining people to seats, ensuring the restricted pair rule is respected
    for (let i = 1; i <= 12; i++) {
        if (!shiftSeats[i] && remainingPeople.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingPeople.length);
            const person = remainingPeople[randomIndex];

            // Ensure restricted pair are not next to each other
            if (
                (shiftSeats[i - 1] && shiftSeats[i - 1].name === restrictedPair.name1 && person === restrictedPair.name2) ||
                (shiftSeats[i - 1] && shiftSeats[i - 1].name === restrictedPair.name2 && person === restrictedPair.name1)
            ) {
                continue; // Skip this person and try again
            }

            shiftSeats[i] = { name: person };
            remainingPeople.splice(randomIndex, 1); // Remove from pool
        }
    }
    return shiftSeats;
}

// Update the schedule with the generated shift
function updateSchedule(shiftSeats) {
    schedule.push(shiftSeats);
    displaySchedule();
}

// Display the seating chart for all generated shifts
function displaySchedule() {
    const scheduleBody = document.getElementById('scheduleBody');
    scheduleBody.innerHTML = ''; // Clear the current schedule

    schedule.forEach((shiftSeats, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Generation ${index + 1}</td>
            <td>${formatShift(shiftSeats)}</td>
        `;
        scheduleBody.appendChild(row);
    });
}

// Format the shift to display seat assignments nicely using names from shortcuts
function formatShift(shiftSeats) {
    let result = '';
    for (let i = 1; i <= 12; i++) {
        const person = shiftSeats[i];
        if (person) {
            const name = shortcuts[person.name] || person.name; // Use the name from shortcut, if available
            result += `Seat ${i}: ${name}<br>`;
        } else {
            result += `Seat ${i}: Empty<br>`;
        }
    }
    return result;
}

// Handle "Enter" keypress events
document.getElementById('newName').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') addName();
});

document.getElementById('pregnantName').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') addPregnant();
});

document.getElementById('seat1').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') assignShift();
});

document.getElementById('name1').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') assignShift();
});

document.getElementById('name2').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') assignShift();
});

document.getElementById('shortcutName').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') addShortcut();
});
