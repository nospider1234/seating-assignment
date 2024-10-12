let namePool = [];
let pregnantGroup = [];
let assignedSeats = {};
let extraPeople = [];
let shortcuts = {};
let shortcutCounter = 1; // Start numbering from 1

// Add a name to the pool
function addName() {
    const newName = document.getElementById('newName').value;
    if (newName) {
        namePool.push({ name: newName, isPregnant: false });
        updateNameList();
        document.getElementById('newName').value = ''; // Clear input
    }
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

// Remove selected name
function removeSelectedName() {
    const select = document.getElementById('nameList');
    if (select.selectedIndex > -1) {
        namePool.splice(select.selectedIndex, 1); // Remove selected item from namePool
        updateNameList();
    }
}

// Update the name list UI
function updateNameList() {
    const select = document.getElementById('nameList');
    select.innerHTML = ''; // Clear current list
    namePool.forEach(person => {
        let option = document.createElement('option');
        option.text = person.name;
        select.add(option);
    });
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
        document.getElementById('shortcutName').value = ''; // Clear input
    }
}

// Update the shortcut table UI
function updateShortcutTable() {
    const table = document.getElementById('shortcutTable');
    table.innerHTML = ''; // Clear current shortcuts
    for (let number in shortcuts) {
        const row = `<tr><td>${number}</td><td>${shortcuts[number]}</td></tr>`;
        table.innerHTML += row;
    }
}

// Assign seats based on the rules and shortcuts
function assignSeats() {
    const seat1Name = document.getElementById('seat1').value;
    const restrictedPair = {
        name1: document.getElementById('name1').value,
        name2: document.getElementById('name2').value
    };

    // Clear previous seating assignment
    assignedSeats = {};
    extraPeople = [];

    // Handle seat 1 assignment if specific person is selected
    if (seat1Name && shortcuts[seat1Name]) {
        assignedSeats[1] = { name: shortcuts[seat1Name], isPregnant: false };
        namePool = namePool.filter(p => p.name !== assignedSeats[1].name); // Remove from pool
    }

    // Assign pregnant group to seats 9-12, but normal names can also be in those seats
    for (let i = 12; i >= 9; i--) {
        if (pregnantGroup.length > 0) {
            assignedSeats[i] = pregnantGroup.shift();
        }
    }

    // Randomly assign remaining people to other seats
    let remainingPeople = [...namePool];
    for (let i = 1; i <= 12; i++) {
        if (!assignedSeats[i] && remainingPeople.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingPeople.length);
            assignedSeats[i] = remainingPeople[randomIndex];
            remainingPeople.splice(randomIndex, 1); // Remove from pool
        }
    }

    // People without seats (standing)
    extraPeople = remainingPeople;

    // Validate that restricted pair is not seated next to each other
    validateNoAdjacentRestrictions(restrictedPair);

    // Display the seating chart and extra people
    displaySeatingChart();
    displayExtraPeople();
}

// Validate no restricted pair is seated next to each other
function validateNoAdjacentRestrictions(restrictedPair) {
    for (let i = 1; i <= 11; i++) {
        if (assignedSeats[i] && assignedSeats[i + 1]) {
            if ((assignedSeats[i].name === restrictedPair.name1 && assignedSeats[i + 1].name === restrictedPair.name2) ||
                (assignedSeats[i].name === restrictedPair.name2 && assignedSeats[i + 1].name === restrictedPair.name1)) {
                // Handle this case, perhaps swap with another seat
                alert(`Error: ${restrictedPair.name1} and ${restrictedPair.name2} cannot sit next to each other.`);
                return false;
            }
        }
    }
    return true;
}

// Display seating chart result
function displaySeatingChart() {
    const seatingResult = document.getElementById('seatingResult');
    seatingResult.innerHTML = ''; // Clear previous results
    for (let i = 1; i <= 12; i++) {
        const seatInfo = assignedSeats[i] ? assignedSeats[i].name : 'Empty';
        seatingResult.innerHTML += `<p>Seat ${i}: ${seatInfo}</p>`;
    }
}

// Display people without seats (standing)
function displayExtraPeople() {
    const extraResult = document.getElementById('extraResult');
    extraResult.innerHTML = ''; // Clear previous results
    if (extraPeople.length > 0) {
        extraPeople.forEach(person => {
            extraResult.innerHTML += `<p>${person.name}</p>`;
        });
    } else {
        extraResult.innerHTML += `<p>No extra people. Everyone has a seat.</p>`;
    }
}
