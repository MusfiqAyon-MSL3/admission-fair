// src/app.js
import { db } from '../firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
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

  const visitorId = form.visitorId.value; // hidden input
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
    if (visitorId) {
      await updateDoc(doc(db, "visitors", visitorId), data);
      alert("Visitor updated!");
    } else {
      await addDoc(collection(db, "visitors"), data);
      alert("Visitor saved!");
    }

    form.reset();
    form.visitorId.value = '';
    document.getElementById('saveBtn').textContent = 'Save';
    document.getElementById('cancelBtn').hidden = true;
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

// ===== Edit Visitor =====
window.editVisitor = async function (id) {
  const docRef = doc(db, "visitors", id);
  const docSnap = await getDocs(collection(db, 'visitors'));

  let data;
  docSnap.forEach(d => {
    if (d.id === id) {
      data = d.data();
    }
  });

  if (!data) return alert("Visitor not found!");

  // Prefill form
  form.name.value = data.name;
  form.phone.value = data.phone;
  form.address.value = data.address;
  form.sscGPA.value = data.sscGPA;
  form.hscGPA.value = data.hscGPA;
  form.formPurchased.checked = data.formPurchased;
  form.formSubmitted.checked = data.formSubmitted;
  form.volunteer.value = data.volunteer;

  form.visitorId.value = id; // hidden input
  document.getElementById('saveBtn').textContent = 'Update';
  document.getElementById('cancelBtn').hidden = false;
};

// ===== Cancel Button =====
document.getElementById('cancelBtn').addEventListener('click', () => {
  form.reset();
  form.visitorId.value = '';
  document.getElementById('saveBtn').textContent = 'Save';
  document.getElementById('cancelBtn').hidden = true;
});

document.getElementById('printBtn').addEventListener('click', async () => {
  const snapshot = await getDocs(collection(db, 'visitors'));

  let content = `
    <html>
    <head>
      <title>Visitor Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #999; padding: 8px; text-align: center; }
        th { background: #f4f4f4; }
      </style>
    </head>
    <body>
      <h2>Visitor Report – Admission Fair</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Total GPA</th>
            <th>Form Purchased</th>
            <th>Form Submitted</th>
            <th>Volunteer</th>
            <th>Entry Time</th>
          </tr>
        </thead>
        <tbody>
  `;

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    content += `
      <tr>
        <td>${data.name}</td>
        <td>${data.phone}</td>
        <td>${data.address}</td>
        <td>${data.totalGPA}</td>
        <td>${data.formPurchased ? '✔️' : '❌'}</td>
        <td>${data.formSubmitted ? '✔️' : '❌'}</td>
        <td>${data.volunteer}</td>
        <td>${data.time.toDate().toLocaleString()}</td>
      </tr>
    `;
  });

  content += `</tbody></table></body></html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
});
