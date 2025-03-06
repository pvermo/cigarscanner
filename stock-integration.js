// Intégration du système de gestion des stocks
let stockTabInitialized = false;
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter le nouvel onglet Stocks après l'onglet Catalogue
    // Ajouter le nouvel onglet Stocks après l'onglet Catalogue
const catalogTab = document.querySelector('#catalog-tab');
if (catalogTab) {
    // Obtenir l'élément <li> parent qui contient l'onglet Catalogue
    const catalogTabLi = catalogTab.closest('li.nav-item');
    
    if (catalogTabLi) {
        // Créer un nouvel élément li pour l'onglet Stocks
        const inventoryTabLi = document.createElement('li');
        inventoryTabLi.className = 'nav-item';
        inventoryTabLi.setAttribute('role', 'presentation');
        
        // Définir le contenu HTML pour l'onglet
        inventoryTabLi.innerHTML = `
            <button class="nav-link" id="inventory-tab" data-bs-toggle="tab" data-bs-target="#inventory" type="button" role="tab" aria-controls="inventory" aria-selected="false">
                <i class="fas fa-boxes"></i> Stocks
            </button>
        `;
        
        // Insérer après l'élément li du catalogue
        if (catalogTabLi.nextSibling) {
            // S'il y a un élément après, insérer avant celui-ci
            catalogTabLi.parentNode.insertBefore(inventoryTabLi, catalogTabLi.nextSibling);
        } else {
            // Sinon, ajouter à la fin
            catalogTabLi.parentNode.appendChild(inventoryTabLi);
        }
    }
}
    
    // Ajouter le contenu de l'onglet Stocks
    const tabContent = document.getElementById('mainTabContent');
    if (tabContent) {
        const inventoryTabContent = `
            <div class="tab-pane fade" id="inventory" role="tabpanel" aria-labelledby="inventory-tab">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3>Gestion des Stocks</h3>
                    <div>
                        <button class="btn btn-outline-primary me-2" onclick="exportInventoryCSV()">
                            <i class="fas fa-file-csv"></i> Exporter CSV
                        </button>
                        <button class="btn btn-outline-primary me-2" onclick="importInventoryCSV()">
                            <i class="fas fa-file-upload"></i> Importer CSV
                        </button>
                        <button class="btn btn-success" onclick="showAdjustStockModal()">
                            <i class="fas fa-plus"></i> Ajuster Stock
                        </button>
                    </div>
                </div>
                
                <!-- Tableau de bord des stocks -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card bg-primary text-white">
                            <div class="card-body text-center">
                                <h5 class="card-title">Valeur Totale du Stock</h5>
                                <h3 id="total-stock-value">0.00€</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-success text-white">
                            <div class="card-body text-center">
                                <h5 class="card-title">Produits en Stock</h5>
                                <h3 id="total-items-count">0</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-warning text-white">
                            <div class="card-body text-center">
                                <h5 class="card-title">Alertes de Stock</h5>
                                <h3 id="low-stock-count">0</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-info text-white">
                            <div class="card-body text-center">
                                <h5 class="card-title">Rotation du Stock</h5>
                                <div class="d-flex justify-content-around">
                                    <div>
                                        <span>A</span>
                                        <h4 id="a-category-count">0</h4>
                                    </div>
                                    <div>
                                        <span>B</span>
                                        <h4 id="b-category-count">0</h4>
                                    </div>
                                    <div>
                                        <span>C</span>
                                        <h4 id="c-category-count">0</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Filtres et recherche -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="mb-3">
                                    <label for="stock-filter" class="form-label">Filtrer par</label>
                                    <select class="form-select" id="stock-filter" onchange="filterInventory()">
                                        <option value="all">Tous les produits</option>
                                        <option value="low">Stock faible</option>
                                        <option value="out">Rupture de stock</option>
                                        <option value="category-a">Catégorie A</option>
                                        <option value="category-b">Catégorie B</option>
                                        <option value="category-c">Catégorie C</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="mb-3">
                                    <label for="stock-sort" class="form-label">Trier par</label>
                                    <select class="form-select" id="stock-sort" onchange="filterInventory()">
                                        <option value="name-asc">Nom (A-Z)</option>
                                        <option value="name-desc">Nom (Z-A)</option>
                                        <option value="quantity-asc">Quantité (Croissant)</option>
                                        <option value="quantity-desc">Quantité (Décroissant)</option>
                                        <option value="rotation-asc">Rotation (Lente-Rapide)</option>
                                        <option value="rotation-desc">Rotation (Rapide-Lente)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="stock-search" class="form-label">Rechercher</label>
                                    <input type="text" class="form-control" id="stock-search" placeholder="Rechercher par marque, nom ou pays..." oninput="filterInventory()">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tableau d'inventaire -->
                <div class="card">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover" id="inventory-table">
                                <thead>
                                    <tr>
                                        <th>Marque</th>
                                        <th>Nom</th>
                                        <th>Pays</th>
                                        <th>Quantité</th>
                                        <th>Alerte à</th>
                                        <th>Prix</th>
                                        <th>Valeur</th>
                                        <th>Catégorie</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="inventory-items">
                                    <!-- Les produits de l'inventaire seront ajoutés ici dynamiquement -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Historique des commandes -->
                <div class="card mt-4">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Historique des Commandes</h5>
                        <button class="btn btn-sm btn-primary" onclick="showAddOrderModal()">
                            <i class="fas fa-plus"></i> Nouvelle Commande
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover" id="orders-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Fournisseur</th>
                                        <th>Produits</th>
                                        <th>Quantité</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="orders-items">
                                    <!-- Les commandes seront ajoutées ici dynamiquement -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter le contenu
        tabContent.insertAdjacentHTML('beforeend', inventoryTabContent);
    }
    
    // Ajouter les modals nécessaires
    const body = document.querySelector('body');
    
    // Modal d'ajustement de stock
    const adjustStockModal = `
        <div class="modal fade" id="adjustStockModal" tabindex="-1" aria-labelledby="adjustStockModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="adjustStockModalLabel">Ajuster le Stock</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="adjustStockForm">
                            <input type="hidden" id="adjustStockId">
                            <div class="mb-3">
                                <label for="adjustStockProduct" class="form-label">Produit</label>
                                <select class="form-select" id="adjustStockProduct" required>
                                    <option value="">Sélectionnez un produit</option>
                                    <!-- Les produits seront ajoutés ici dynamiquement -->
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="adjustStockQuantity" class="form-label">Quantité actuelle</label>
                                <input type="number" class="form-control" id="adjustStockCurrentQuantity" readonly>
                            </div>
                            <div class="mb-3">
                                <label for="adjustStockQuantity" class="form-label">Nouvelle quantité</label>
                                <input type="number" class="form-control" id="adjustStockQuantity" min="0" required>
                            </div>
                            <div class="mb-3">
                                <label for="adjustStockThreshold" class="form-label">Seuil d'alerte</label>
                                <input type="number" class="form-control" id="adjustStockThreshold" min="0" required>
                                <small class="text-muted">Vous serez alerté lorsque le stock descend en dessous de ce seuil.</small>
                            </div>
                            <div class="mb-3">
                                <label for="adjustStockReason" class="form-label">Raison de l'ajustement</label>
                                <select class="form-select" id="adjustStockReason" required>
                                    <option value="initial">Stock initial</option>
                                    <option value="restock">Réapprovisionnement</option>
                                    <option value="correction">Correction d'inventaire</option>
                                    <option value="damaged">Produits endommagés</option>
                                    <option value="returned">Produits retournés</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="adjustStockNotes" class="form-label">Notes</label>
                                <textarea class="form-control" id="adjustStockNotes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" onclick="submitStockAdjustment()">Enregistrer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Modal de nouvelle commande
    const addOrderModal = `
        <div class="modal fade" id="addOrderModal" tabindex="-1" aria-labelledby="addOrderModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addOrderModalLabel">Nouvelle Commande</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addOrderForm">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="orderSupplier" class="form-label">Fournisseur</label>
                                    <input type="text" class="form-control" id="orderSupplier" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="orderDate" class="form-label">Date de commande</label>
                                    <input type="date" class="form-control" id="orderDate" required>
                                </div>
                            </div>
                            
                            <h6>Produits</h6>
                            <div id="orderProductsContainer">
                                <!-- Les lignes de produits seront ajoutées ici dynamiquement -->
                            </div>
                            
                            <div class="mb-3">
                                <button type="button" class="btn btn-outline-primary" onclick="addOrderProductRow()">
                                    <i class="fas fa-plus"></i> Ajouter un produit
                                </button>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="orderStatus" class="form-label">Statut</label>
                                    <select class="form-select" id="orderStatus" required>
                                        <option value="pending">En attente</option>
                                        <option value="ordered">Commandé</option>
                                        <option value="shipped">Expédié</option>
                                        <option value="delivered">Livré</option>
                                        <option value="cancelled">Annulé</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label for="orderETA" class="form-label">Date de livraison estimée</label>
                                    <input type="date" class="form-control" id="orderETA">
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="orderNotes" class="form-label">Notes</label>
                                <textarea class="form-control" id="orderNotes" rows="2"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" onclick="submitOrder()">Enregistrer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Modal de détails de commande
    const orderDetailsModal = `
        <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="orderDetailsModalLabel">Détails de la Commande</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="orderDetailsContent">
                        <!-- Le contenu sera généré dynamiquement -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-success" id="orderReceiveBtn" onclick="receiveOrder()">
                            <i class="fas fa-check"></i> Marquer comme reçu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Input File caché pour l'import CSV
    const csvFileInput = `
        <input type="file" id="csvFileInput" accept=".csv" style="display: none;" onchange="handleFileSelect(event)">
    `;
    
    // Ajouter les modals au corps de la page
    body.insertAdjacentHTML('beforeend', adjustStockModal);
    body.insertAdjacentHTML('beforeend', addOrderModal);
    body.insertAdjacentHTML('beforeend', orderDetailsModal);
    body.insertAdjacentHTML('beforeend', csvFileInput);
    
    // Initialiser le module de gestion des stocks
    // Gérer l'initialisation plus prudemment
if (typeof initializeInventoryModule === 'function' && !stockTabInitialized) {
    // Initialiser seulement lors du premier chargement
    initializeInventoryModule();
    stockTabInitialized = true;
    
    // Ajouter un gestionnaire d'événements pour les clics d'onglets
    document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            // Si on revient sur l'onglet Stock, juste rafraîchir l'affichage
            if (event.target.id === 'inventory-tab') {
                // Mettre à jour l'affichage sans réinitialiser complètement
                if (typeof renderInventory === 'function') renderInventory();
                if (typeof renderOrders === 'function') renderOrders();
                if (typeof updateInventoryStats === 'function') updateInventoryStats();
            }
        });
    });
}
});