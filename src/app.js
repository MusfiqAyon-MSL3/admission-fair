// src/app.js
import { db } from '../firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// ===== Modal Open/Close =====
document.querySelectorAll('.fab').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.id === 'devBtn' ? 'devModal' : 'volModal';
    document.getElementById(targetId).classList.add('show');
  });
});
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.close).classList.remove('show');
  });
});

// ===== Load Volunteers Grid =====
const volGrid = document.getElementById('volGrid');
for (let i = 1; i <= 12; i++) {
  const img = document.createElement('img');
  const padded = i.toString().padStart(2, '0');
  img.src = `src/assets/volunteers/v${padded}.jpg`;
  img.alt = `Volunteer ${padded}`;
  volGrid.appendChild(img);
}

// ===== Form Submission =====
const form = document.getElementById('entryForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    name: form.name.value,
    phone: form.phone.value,
    address: form.address.value,
    sscGPA: parseFloat(form.sscGPA.value),
    hscGPA: parseFloat(form.hscGPA.value),
    totalGPA: (parseFloat(form.sscGPA.value) + parseFloat(form.hscGPA.value)).toFixed(2),
    formPurchased: form.formPurchased.checked,
    formSubmitted: form.formSubmitted.checked,
    volunteer: form.volunteer.value,
    time: Timestamp.now()
  };

  try {
    await addDoc(collection(db, "visitors"), data);
    alert("Visitor saved!");
    form.reset();
    loadVisitors();
  } catch (err) {
    console.error("Error saving:", err);
    alert("Error! See console.");
  }
});

// ===== Load Visitor Table =====
async function loadVisitors() {
  const tableBody = document.querySelector('#dataTable tbody');
  tableBody.innerHTML = '';

  const snapshot = await getDocs(collection(db, 'visitors'));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${data.name}</td>
      <td>${data.phone}</td>
      <td>${data.address}</td>
      <td>${data.totalGPA}</td>
      <td>${data.formPurchased ? '✔️' : '❌'}</td>
      <td>${data.formSubmitted ? '✔️' : '❌'}</td>
      <td>${data.volunteer}</td>
      <td>${data.time.toDate().toLocaleString()}</td>
      <td><button class="action-btn" onclick="editVisitor('${docSnap.id}')">Edit</button></td>
      <td><button class="action-btn" onclick="deleteVisitor('${docSnap.id}')">Delete</button></td>
    `;
    tableBody.appendChild(tr);
  });
}
loadVisitors();

// ===== Delete Visitor =====
window.deleteVisitor = async function (id) {
  if (!confirm("Are you sure you want to delete this entry?")) return;
  try {
    await deleteDoc(doc(db, "visitors", id));
    alert("Deleted successfully.");
    loadVisitors();
  } catch (err) {
    console.error(err);
    alert("Delete failed!");
  }
};

// ===== Edit Visitor (Optional Placeholder) =====
window.editVisitor = function (id) {
  alert("Edit not implemented yet.");
};
