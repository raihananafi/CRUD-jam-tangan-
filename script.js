/* ==========================================================================
   CHRONO.HERITAGE - CRUD System Logic with File Manager Upload (Base64)
   ========================================================================== */

const initialData = [
    {
        id: "1",
        title: "CHRONO.H Imperial Tourbillon",
        category: "Tourbillon",
        price: "$190,000",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800",
        desc: "Exquisite 18K gold finished timepiece featuring an open-work tourbillon movement."
    },
    {
        id: "2",
        title: "CHRONO.H Crown Jewel Edition",
        category: "Chronograph",
        price: "Price Upon Request",
        image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800",
        desc: "CHRONO.H introduces its most exclusive masterpiece crafted for discerning collectors."
    }
];

let watchCatalog = JSON.parse(localStorage.getItem('chrono_catalog')) || initialData;
let currentBase64Image = "";

// DOM Elements
const watchListContainer = document.getElementById('watch-list');
const watchModal = document.getElementById('watch-modal');
const watchForm = document.getElementById('watch-form');
const btnOpenModal = document.getElementById('btn-open-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancel = document.getElementById('btn-cancel');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');

const fileInput = document.getElementById('watch-image-file');
const imgPreviewBox = document.getElementById('img-preview-box');
const imgPreview = document.getElementById('img-preview');

// Save Data to LocalStorage
function saveData() {
    localStorage.setItem('chrono_catalog', JSON.stringify(watchCatalog));
}

// Convert File from File Manager to Base64 String
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentBase64Image = event.target.result;
            imgPreview.src = currentBase64Image;
            imgPreviewBox.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Render Catalog Grid
function renderCatalog(data = watchCatalog) {
    watchListContainer.innerHTML = '';

    if (data.length === 0) {
        watchListContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Tidak ada jam tangan ditemukan.</p>`;
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'watch-card';
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                <span class="badge-category">${item.category}</span>
            </div>
            <div class="card-body">
                <h3>${item.title}</h3>
                <div class="card-price">${item.price}</div>
                <p class="card-desc">${item.desc}</p>
                <div class="card-actions">
                    <button class="btn-action btn-edit" onclick="editWatch('${item.id}')">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteWatch('${item.id}')">
                        <i class="fa-solid fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `;
        watchListContainer.appendChild(card);
    });
}

// Modal Handlers
function openModal(isEdit = false) {
    document.getElementById('modal-title').innerText = isEdit ? "Edit Koleksi Jam" : "Tambah Koleksi Jam";
    watchModal.classList.add('active');
}

function closeModal() {
    watchModal.classList.remove('active');
    watchForm.reset();
    document.getElementById('watch-id').value = '';
    currentBase64Image = "";
    imgPreviewBox.style.display = 'none';
    imgPreview.src = "";
}

// Save / Update Handler
watchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('watch-id').value;
    const title = document.getElementById('watch-title').value;
    const category = document.getElementById('watch-category').value;
    const price = document.getElementById('watch-price').value;
    const desc = document.getElementById('watch-desc').value;

    if (!id && !currentBase64Image) {
        alert("Silakan upload gambar jam terlebih dahulu!");
        return;
    }

    if (id) {
        // Mode Update
        const index = watchCatalog.findIndex(item => item.id === id);
        if (index !== -1) {
            watchCatalog[index] = {
                id,
                title,
                category,
                price,
                image: currentBase64Image ? currentBase64Image : watchCatalog[index].image,
                desc
            };
        }
    } else {
        // Mode Tambah
        const newItem = {
            id: Date.now().toString(),
            title,
            category,
            price,
            image: currentBase64Image,
            desc
        };
        watchCatalog.push(newItem);
    }

    saveData();
    renderCatalog();
    closeModal();
});

// Edit Watch
window.editWatch = function(id) {
    const item = watchCatalog.find(watch => watch.id === id);
    if (!item) return;

    document.getElementById('watch-id').value = item.id;
    document.getElementById('watch-title').value = item.title;
    document.getElementById('watch-category').value = item.category;
    document.getElementById('watch-price').value = item.price;
    document.getElementById('watch-desc').value = item.desc;

    if (item.image) {
        currentBase64Image = item.image;
        imgPreview.src = item.image;
        imgPreviewBox.style.display = 'block';
    }

    openModal(true);
};

// Delete Watch
window.deleteWatch = function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus koleksi ini?')) {
        watchCatalog = watchCatalog.filter(item => item.id !== id);
        saveData();
        renderCatalog();
    }
};

// Search & Filter Logic
function filterCatalog() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;

    const filtered = watchCatalog.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm) || item.desc.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    renderCatalog(filtered);
}

// Listeners
btnOpenModal.addEventListener('click', () => openModal(false));
btnCloseModal.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);
searchInput.addEventListener('input', filterCatalog);
filterCategory.addEventListener('change', filterCatalog);

// Initial Load
renderCatalog();