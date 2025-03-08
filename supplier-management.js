// Gestion des fournisseurs pour Cigar Scanner

// Liste des fournisseurs par défaut
const defaultSuppliers = [
    "Flor de Selva",
    "STG",
    "SODITAB",
    "Davidoff",
    "Coprova",
    "Eurotab",
    "Oliva",
    "Tournefeuille",
    "Cigares du monde",
    "Albana Tobacco"
];

// Fonction pour initialiser les fournisseurs
function initializeSuppliers() {
    // Vérifier si les fournisseurs existent déjà dans le localStorage
    let suppliers = localStorage.getItem('cigarSuppliers');
    if (!suppliers) {
        // Si non, créer la liste par défaut
        suppliers = defaultSuppliers;
        localStorage.setItem('cigarSuppliers', JSON.stringify(suppliers));
    } else {
        suppliers = JSON.parse(suppliers);
    }
    return suppliers;
}

// Récupérer la liste des fournisseurs
function getSuppliers() {
    let suppliers = localStorage.getItem('cigarSuppliers');
    return suppliers ? JSON.parse(suppliers) : initializeSuppliers();
}

// Sauvegarder la liste des fournisseurs
function saveSuppliers(suppliers) {
    localStorage.setItem('cigarSuppliers', JSON.stringify(suppliers));
}

// Ajouter un fournisseur
function addSupplier(name) {
    const suppliers = getSuppliers();
    // Vérifier si le fournisseur existe déjà
    if (!suppliers.includes(name)) {
        suppliers.push(name);
        saveSuppliers(suppliers);
        return true;
    }
    return false;
}

// Supprimer un fournisseur
function removeSupplier(name) {
    let suppliers = getSuppliers();
    // Vérifier si le fournisseur est utilisé dans le catalogue
    const isUsed = productCatalog.some(product => product.supplier === name);
    if (isUsed) {
        showToast(`Impossible de supprimer "${name}" : ce fournisseur est utilisé dans le catalogue.`, 'warning');
        return false;
    }
    
    // Filtrer pour retirer le fournisseur
    suppliers = suppliers.filter(supplier => supplier !== name);
    saveSuppliers(suppliers);
    return true;
}

// Modifier un fournisseur
function updateSupplier(oldName, newName) {
    let suppliers = getSuppliers();
    const index = suppliers.indexOf(oldName);
    if (index !== -1) {
        suppliers[index] = newName;
        saveSuppliers(suppliers);
        
        // Mettre également à jour tous les produits associés à ce fournisseur
        productCatalog.forEach(product => {
            if (product.supplier === oldName) {
                product.supplier = newName;
            }
        });
        saveToLocalStorage(); // Sauvegarder le catalogue mis à jour
        return true;
    }
    return false;
}

// Ajouter l'onglet de gestion des fournisseurs
function addSuppliersTab() {
    // Vérifier si l'onglet existe déjà
    if (document.getElementById('suppliers-tab')) {
        return;
    }
    
    // Trouver l'onglet qui précédera le nouvel onglet (Catalogue)
    const catalogTab = document.getElementById('catalog-tab');
    if (!catalogTab) {
        return;
    }
    
    // Créer le nouvel onglet
    const catalogTabLi = catalogTab.closest('li.nav-item');
    const suppliersTabLi = document.createElement('li');
    suppliersTabLi.className = 'nav-item';
    suppliersTabLi.setAttribute('role', 'presentation');
    
    suppliersTabLi.innerHTML = `
        <button class="nav-link" id="suppliers-tab" data-bs-toggle="tab" data-bs-target="#suppliers" type="button" role="tab" aria-controls="suppliers" aria-selected="false">
            <i class="fas fa-truck"></i> Fournisseurs
        </button>
    `;
    
    // Insérer après l'onglet Catalogue
    if (catalogTabLi.nextSibling) {
        catalogTabLi.parentNode.insertBefore(suppliersTabLi, catalogTabLi.nextSibling);
    } else {
        catalogTabLi.parentNode.appendChild(suppliersTabLi);
    }
    
    // Créer le contenu de l'onglet
    const tabContent = document.getElementById('mainTabContent');
    const suppliersTabContent = document.createElement('div');
    suppliersTabContent.className = 'tab-pane fade';
    suppliersTabContent.id = 'suppliers';
    suppliersTabContent.setAttribute('role', 'tabpanel');
    suppliersTabContent.setAttribute('aria-labelledby', 'suppliers-tab');
    
    suppliersTabContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3>Gestion des Fournisseurs</h3>
            <button class="btn btn-success" onclick="showAddSupplierModal()">
                <i class="fas fa-plus"></i> Ajouter un fournisseur
            </button>
        </div>
        
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped table-hover" id="suppliers-table">
                        <thead>
                            <tr>
                                <th>Nom du fournisseur</th>
                                <th>Nombre de produits</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="suppliers-list">
                            <!-- La liste des fournisseurs sera ajoutée ici dynamiquement -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    tabContent.appendChild(suppliersTabContent);
    
    // Ajouter les modals pour la gestion des fournisseurs
    addSupplierModals();
    
    // Ajouter un écouteur d'événements pour charger les fournisseurs quand l'onglet est affiché
    document.getElementById('suppliers-tab').addEventListener('shown.bs.tab', function() {
        renderSuppliers();
    });
}

// Ajouter les modals pour la gestion des fournisseurs
function addSupplierModals() {
    const body = document.querySelector('body');
    
    // Modal d'ajout de fournisseur
    const addSupplierModal = document.createElement('div');
    addSupplierModal.className = 'modal fade';
    addSupplierModal.id = 'addSupplierModal';
    addSupplierModal.setAttribute('tabindex', '-1');
    addSupplierModal.setAttribute('aria-labelledby', 'addSupplierModalLabel');
    addSupplierModal.setAttribute('aria-hidden', 'true');
    
    addSupplierModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addSupplierModalLabel">Ajouter un fournisseur</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="addSupplierForm">
                        <div class="mb-3">
                            <label for="supplierName" class="form-label">Nom du fournisseur</label>
                            <input type="text" class="form-control" id="supplierName" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="button" class="btn btn-primary" onclick="submitAddSupplier()">Ajouter</button>
                </div>
            </div>
        </div>
    `;
    
    // Modal d'édition de fournisseur
    const editSupplierModal = document.createElement('div');
    editSupplierModal.className = 'modal fade';
    editSupplierModal.id = 'editSupplierModal';
    editSupplierModal.setAttribute('tabindex', '-1');
    editSupplierModal.setAttribute('aria-labelledby', 'editSupplierModalLabel');
    editSupplierModal.setAttribute('aria-hidden', 'true');
    
    editSupplierModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editSupplierModalLabel">Modifier un fournisseur</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="editSupplierForm">
                        <input type="hidden" id="oldSupplierName">
                        <div class="mb-3">
                            <label for="editSupplierName" class="form-label">Nom du fournisseur</label>
                            <input type="text" class="form-control" id="editSupplierName" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="button" class="btn btn-primary" onclick="submitEditSupplier()">Enregistrer</button>
                </div>
            </div>
        </div>
    `;
    
    body.appendChild(addSupplierModal);
    body.appendChild(editSupplierModal);
}

// Afficher les fournisseurs dans le tableau
function renderSuppliers() {
    const suppliersList = document.getElementById('suppliers-list');
    if (!suppliersList) return;
    
    const suppliers = getSuppliers();
    
    if (suppliers.length === 0) {
        suppliersList.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">Aucun fournisseur enregistré</td>
            </tr>
        `;
        return;
    }
    
    suppliersList.innerHTML = '';
    
    suppliers.forEach(supplier => {
        // Compter le nombre de produits associés à ce fournisseur
        const productCount = productCatalog.filter(product => product.supplier === supplier).length;
        
        suppliersList.innerHTML += `
            <tr>
                <td>${supplier}</td>
                <td>${productCount}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showEditSupplierModal('${supplier}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteSupplier('${supplier}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// Afficher la modal d'ajout de fournisseur
function showAddSupplierModal() {
    document.getElementById('addSupplierForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('addSupplierModal'));
    modal.show();
}

// Soumettre l'ajout d'un fournisseur
function submitAddSupplier() {
    const supplierName = document.getElementById('supplierName').value.trim();
    
    if (!supplierName) {
        showToast('Veuillez saisir un nom de fournisseur.', 'warning');
        return;
    }
    
    if (addSupplier(supplierName)) {
        showToast(`Fournisseur "${supplierName}" ajouté avec succès.`, 'success');
        renderSuppliers();
        
        // Fermer la modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSupplierModal'));
        modal.hide();
    } else {
        showToast(`Le fournisseur "${supplierName}" existe déjà.`, 'warning');
    }
}

// Afficher la modal d'édition de fournisseur
function showEditSupplierModal(supplierName) {
    document.getElementById('oldSupplierName').value = supplierName;
    document.getElementById('editSupplierName').value = supplierName;
    
    const modal = new bootstrap.Modal(document.getElementById('editSupplierModal'));
    modal.show();
}

// Soumettre la modification d'un fournisseur
function submitEditSupplier() {
    const oldName = document.getElementById('oldSupplierName').value;
    const newName = document.getElementById('editSupplierName').value.trim();
    
    if (!newName) {
        showToast('Veuillez saisir un nom de fournisseur.', 'warning');
        return;
    }
    
    if (oldName !== newName) {
        if (updateSupplier(oldName, newName)) {
            showToast(`Fournisseur renommé de "${oldName}" à "${newName}" avec succès.`, 'success');
            renderSuppliers();
            renderCatalog(); // Mettre à jour le catalogue aussi
            
            // Fermer la modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editSupplierModal'));
            modal.hide();
        } else {
            showToast('Erreur lors de la modification du fournisseur.', 'danger');
        }
    } else {
        // Fermer la modal si aucun changement
        const modal = bootstrap.Modal.getInstance(document.getElementById('editSupplierModal'));
        modal.hide();
    }
}

// Confirmer la suppression d'un fournisseur
function confirmDeleteSupplier(supplierName) {
    showConfirmDialog(
        'Supprimer le fournisseur',
        `Êtes-vous sûr de vouloir supprimer le fournisseur "${supplierName}" ?`,
        () => {
            if (removeSupplier(supplierName)) {
                showToast(`Fournisseur "${supplierName}" supprimé avec succès.`, 'success');
                renderSuppliers();
            }
        }
    );
}

// Initialiser le module de gestion des fournisseurs
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les fournisseurs
    initializeSuppliers();
    
    // Ajouter l'onglet de gestion des fournisseurs
    setTimeout(() => {
        addSuppliersTab();
    }, 1000);
});