// Modèles de données pour la gestion des stocks
class InventoryItem {
    constructor(productId, quantity, threshold) {
        this.productId = productId;
        this.quantity = quantity || 0;
        this.threshold = threshold || 5;
        this.lastUpdated = new Date();
        this.history = [];
        this.category = 'C'; // Par défaut, les nouveaux produits sont en catégorie C
        this.rotationScore = 0;
    }

    addHistory(adjustment) {
        this.history.push(adjustment);
        this.lastUpdated = new Date();
    }

    updateCategory() {
        // Mettre à jour la catégorie en fonction du score de rotation
        if (this.rotationScore >= 8) {
            this.category = 'A';
        } else if (this.rotationScore >= 3) {
            this.category = 'B';
        } else {
            this.category = 'C';
        }
    }
}

class StockAdjustment {
    constructor(quantity, reason, notes) {
        this.date = new Date();
        this.quantity = quantity;
        this.reason = reason;
        this.notes = notes;
    }
}

class Order {
    constructor(supplier, date, products, status, eta, notes) {
        this.id = Date.now() + Math.random().toString(36).substr(2, 9);
        this.supplier = supplier;
        this.date = date ? new Date(date) : new Date();
        this.products = products || [];
        this.status = status || 'pending';
        this.eta = eta ? new Date(eta) : null;
        this.notes = notes || '';
        this.history = [{
            date: new Date(),
            status: this.status,
            notes: 'Commande créée'
        }];
    }

    updateStatus(status, notes) {
        this.status = status;
        this.history.push({
            date: new Date(),
            status: status,
            notes: notes || ''
        });
    }
}

// Variables globales pour l'inventaire
let inventoryItems = [];
let orderHistory = [];

// Initialisation du module de gestion des stocks
function initializeInventoryModule() {
    // Charger les données d'inventaire et de commandes depuis le localStorage
    loadInventoryData();
    
    // Remplir les tableaux et mettre à jour les statistiques
    renderInventory();
    renderOrders();
    updateInventoryStats();
    
    // Vérifier si des articles sont en stock faible et afficher les alertes
    checkLowStockAlerts();
}

// Chargement des données d'inventaire
function loadInventoryData() {
    const savedInventory = localStorage.getItem('inventoryItems');
    const savedOrders = localStorage.getItem('orderHistory');
    
    if (savedInventory) {
        const parsedInventory = JSON.parse(savedInventory);
        inventoryItems = parsedInventory.map(item => {
            const inventoryItem = new InventoryItem(
                item.productId,
                item.quantity,
                item.threshold
            );
            inventoryItem.lastUpdated = new Date(item.lastUpdated);
            inventoryItem.history = item.history;
            inventoryItem.category = item.category || 'C';
            inventoryItem.rotationScore = item.rotationScore || 0;
            return inventoryItem;
        });
    }
    
    if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        orderHistory = parsedOrders.map(order => {
            const newOrder = new Order(
                order.supplier,
                order.date,
                order.products,
                order.status,
                order.eta,
                order.notes
            );
            newOrder.id = order.id;
            newOrder.history = order.history.map(h => ({
                ...h,
                date: new Date(h.date)
            }));
            return newOrder;
        });
    }
    
    // Mise à jour des rotations et catégories
    updateProductRotations();
}

// Sauvegarde des données d'inventaire
function saveInventoryData() {
    localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}

// Mise à jour des rotations des produits
function updateProductRotations() {
    // Calculer le score de rotation pour chaque produit
    // basé sur l'historique des ventes des 3 derniers mois
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // Récupérer les ventes des 3 derniers mois
    const recentSales = salesHistory.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= threeMonthsAgo && saleDate <= now;
    });
    
    // Compter les ventes par produit
    const salesCount = {};
    recentSales.forEach(sale => {
        sale.items.forEach(item => {
            // Trouver le produit dans le catalogue
            const catalogItem = productCatalog.find(
                p => p.brand === item.brand && p.name === item.name
            );
            
            if (catalogItem) {
                if (!salesCount[catalogItem.id]) {
                    salesCount[catalogItem.id] = 0;
                }
                salesCount[catalogItem.id]++;
            }
        });
    });
    
    // Mettre à jour les scores de rotation et les catégories
    inventoryItems.forEach(item => {
        const salesForProduct = salesCount[item.productId] || 0;
        item.rotationScore = salesForProduct;
        item.updateCategory();
    });
    
    saveInventoryData();
}

// Mise à jour des statistiques d'inventaire
function updateInventoryStats() {
    let totalValue = 0;
    let totalItems = 0;
    let lowStockCount = 0;
    let categoryACounts = 0;
    let categoryBCounts = 0;
    let categoryCCounts = 0;
    
    inventoryItems.forEach(item => {
        const product = productCatalog.find(p => p.id === item.productId);
        if (!product) return;
        
        // Valeur totale
        totalValue += product.price * item.quantity;
        
        // Nombre total de produits
        totalItems += 1;
        
        // Produits en alerte stock
        if (item.quantity <= item.threshold && item.quantity > 0) {
            lowStockCount++;
        }
        
        // Compter par catégorie
        if (item.category === 'A') categoryACounts++;
        else if (item.category === 'B') categoryBCounts++;
        else categoryCCounts++;
    });
    
    // Mettre à jour les indicateurs
    document.getElementById('total-stock-value').textContent = `${totalValue.toFixed(2)}€`;
    document.getElementById('total-items-count').textContent = totalItems;
    document.getElementById('low-stock-count').textContent = lowStockCount;
    document.getElementById('a-category-count').textContent = categoryACounts;
    document.getElementById('b-category-count').textContent = categoryBCounts;
    document.getElementById('c-category-count').textContent = categoryCCounts;
}

// Vérifier les alertes de stock faible
function checkLowStockAlerts() {
    const lowStockItems = inventoryItems.filter(item => 
        item.quantity <= item.threshold && item.quantity > 0
    );
    
    if (lowStockItems.length > 0) {
        const productNames = lowStockItems.map(item => {
            const product = productCatalog.find(p => p.id === item.productId);
            if (!product) return '';
            return `${product.brand} ${product.name} (${item.quantity}/${item.threshold})`;
        }).join(', ');
        
        showToast(`Alerte stock faible : ${productNames}`, 'warning');
    }
    
    // Vérifier les ruptures de stock
    const outOfStockItems = inventoryItems.filter(item => item.quantity === 0);
    if (outOfStockItems.length > 0) {
        const productNames = outOfStockItems.map(item => {
            const product = productCatalog.find(p => p.id === item.productId);
            if (!product) return '';
            return `${product.brand} ${product.name}`;
        }).join(', ');
        
        showToast(`Rupture de stock : ${productNames}`, 'danger');
    }
}

// Affichage de l'inventaire
function renderInventory() {
    const inventoryTableBody = document.getElementById('inventory-items');
    if (!inventoryTableBody) return;
    
    inventoryTableBody.innerHTML = '';
    
    if (inventoryItems.length === 0) {
        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">Aucun produit en stock</td>
            </tr>
        `;
        return;
    }
    
    // Récupérer les informations complètes des produits
    inventoryItems.forEach(item => {
        const product = productCatalog.find(p => p.id === item.productId);
        if (!product) return;
        
        const rowClass = item.quantity <= item.threshold ? 'table-warning' : '';
        const outOfStockClass = item.quantity === 0 ? 'table-danger' : '';
        
        inventoryTableBody.innerHTML += `
            <tr class="${rowClass} ${outOfStockClass}">
                <td>${product.brand}</td>
                <td>${product.name}</td>
                <td>${product.country}</td>
                <td>
                    <span class="badge ${item.quantity <= item.threshold ? 'bg-warning text-dark' : 'bg-success'} me-2">
                        ${item.quantity}
                    </span>
                </td>
                <td>${item.threshold}</td>
                <td>${product.price.toFixed(2)}€</td>
                <td>${(product.price * item.quantity).toFixed(2)}€</td>
                <td>
                    <span class="badge ${
                        item.category === 'A' ? 'bg-success' : 
                        item.category === 'B' ? 'bg-info' : 'bg-secondary'
                    }">
                        ${item.category}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showAdjustStockModal('${item.productId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="showStockHistory('${item.productId}')">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteStockItem('${item.productId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// Filtrer l'inventaire
function filterInventory() {
    const filter = document.getElementById('stock-filter').value;
    const sort = document.getElementById('stock-sort').value;
    const search = document.getElementById('stock-search').value.toLowerCase();
    
    // Récupérer tous les produits avec leurs informations
    let filteredItems = inventoryItems.map(item => {
        const product = productCatalog.find(p => p.id === item.productId);
        return { item, product };
    }).filter(({ product }) => product !== undefined);
    
    // Appliquer le filtre
    if (filter !== 'all') {
        switch (filter) {
            case 'low':
                filteredItems = filteredItems.filter(({ item }) => 
                    item.quantity <= item.threshold && item.quantity > 0
                );
                break;
            case 'out':
                filteredItems = filteredItems.filter(({ item }) => item.quantity === 0);
                break;
            case 'category-a':
                filteredItems = filteredItems.filter(({ item }) => item.category === 'A');
                break;
            case 'category-b':
                filteredItems = filteredItems.filter(({ item }) => item.category === 'B');
                break;
            case 'category-c':
                filteredItems = filteredItems.filter(({ item }) => item.category === 'C');
                break;
        }
    }
    
    // Appliquer la recherche
    if (search) {
        filteredItems = filteredItems.filter(({ product }) => 
            product.brand.toLowerCase().includes(search) ||
            product.name.toLowerCase().includes(search) ||
            product.country.toLowerCase().includes(search)
        );
    }
    
    // Appliquer le tri
    switch (sort) {
        case 'name-asc':
            filteredItems.sort((a, b) => 
                (a.product.brand + a.product.name).localeCompare(b.product.brand + b.product.name)
            );
            break;
        case 'name-desc':
            filteredItems.sort((a, b) => 
                (b.product.brand + b.product.name).localeCompare(a.product.brand + a.product.name)
            );
            break;
        case 'quantity-asc':
            filteredItems.sort((a, b) => a.item.quantity - b.item.quantity);
            break;
        case 'quantity-desc':
            filteredItems.sort((a, b) => b.item.quantity - a.item.quantity);
            break;
        case 'rotation-asc':
            filteredItems.sort((a, b) => a.item.rotationScore - b.item.rotationScore);
            break;
        case 'rotation-desc':
            filteredItems.sort((a, b) => b.item.rotationScore - a.item.rotationScore);
            break;
    }
    
    // Afficher les résultats filtrés
    const inventoryTableBody = document.getElementById('inventory-items');
    if (!inventoryTableBody) return;
    
    inventoryTableBody.innerHTML = '';
    
    if (filteredItems.length === 0) {
        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">Aucun produit ne correspond aux critères</td>
            </tr>
        `;
        return;
    }
    
    filteredItems.forEach(({ item, product }) => {
        const rowClass = item.quantity <= item.threshold ? 'table-warning' : '';
        const outOfStockClass = item.quantity === 0 ? 'table-danger' : '';
        
        inventoryTableBody.innerHTML += `
            <tr class="${rowClass} ${outOfStockClass}">
                <td>${product.brand}</td>
                <td>${product.name}</td>
                <td>${product.country}</td>
                <td>
                    <span class="badge ${item.quantity <= item.threshold ? 'bg-warning text-dark' : 'bg-success'} me-2">
                        ${item.quantity}
                    </span>
                </td>
                <td>${item.threshold}</td>
                <td>${product.price.toFixed(2)}€</td>
                <td>${(product.price * item.quantity).toFixed(2)}€</td>
                <td>
                    <span class="badge ${
                        item.category === 'A' ? 'bg-success' : 
                        item.category === 'B' ? 'bg-info' : 'bg-secondary'
                    }">
                        ${item.category}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showAdjustStockModal('${item.productId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="showStockHistory('${item.productId}')">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteStockItem('${item.productId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// Modal d'ajustement du stock
function showAdjustStockModal(productId = null) {
    // Remplir le select des produits
    const productSelect = document.getElementById('adjustStockProduct');
    productSelect.innerHTML = '<option value="">Sélectionnez un produit</option>';
    
    productCatalog.forEach(product => {
        const isSelected = productId === product.id ? 'selected' : '';
        productSelect.innerHTML += `
            <option value="${product.id}" ${isSelected}>
                ${product.brand} - ${product.name}
            </option>
        `;
    });
    
    // Si un produit est sélectionné, remplir les autres champs
    if (productId) {
        document.getElementById('adjustStockId').value = productId;
        
        // Trouver l'item d'inventaire correspondant
        const inventoryItem = inventoryItems.find(item => item.productId === productId);
        
        if (inventoryItem) {
            document.getElementById('adjustStockCurrentQuantity').value = inventoryItem.quantity;
            document.getElementById('adjustStockQuantity').value = inventoryItem.quantity;
            document.getElementById('adjustStockThreshold').value = inventoryItem.threshold;
        } else {
            // Nouveau produit
            document.getElementById('adjustStockCurrentQuantity').value = 0;
            document.getElementById('adjustStockQuantity').value = 0;
            document.getElementById('adjustStockThreshold').value = 5;
        }
    } else {
        // Réinitialiser le formulaire
        document.getElementById('adjustStockId').value = '';
        document.getElementById('adjustStockCurrentQuantity').value = 0;
        document.getElementById('adjustStockQuantity').value = 0;
        document.getElementById('adjustStockThreshold').value = 5;
    }
    
    // Afficher la modal
    const modal = new bootstrap.Modal(document.getElementById('adjustStockModal'));
    modal.show();
    
    // Ajouter un événement pour mettre à jour les champs lorsque le produit change
    productSelect.addEventListener('change', function() {
        const selectedProductId = this.value;
        if (!selectedProductId) return;
        
        document.getElementById('adjustStockId').value = selectedProductId;
        
        // Trouver l'item d'inventaire correspondant
        const inventoryItem = inventoryItems.find(item => item.productId === selectedProductId);
        
        if (inventoryItem) {
            document.getElementById('adjustStockCurrentQuantity').value = inventoryItem.quantity;
            document.getElementById('adjustStockQuantity').value = inventoryItem.quantity;
            document.getElementById('adjustStockThreshold').value = inventoryItem.threshold;
        } else {
            // Nouveau produit
            document.getElementById('adjustStockCurrentQuantity').value = 0;
            document.getElementById('adjustStockQuantity').value = 0;
            document.getElementById('adjustStockThreshold').value = 5;
        }
    });
}

// Validation de l'ajustement de stock
function submitStockAdjustment() {
    const productId = document.getElementById('adjustStockId').value;
    const quantity = parseInt(document.getElementById('adjustStockQuantity').value);
    const threshold = parseInt(document.getElementById('adjustStockThreshold').value);
    const reason = document.getElementById('adjustStockReason').value;
    const notes = document.getElementById('adjustStockNotes').value;
    
    if (!productId || isNaN(quantity) || isNaN(threshold)) {
        showToast('Veuillez remplir tous les champs correctement', 'danger');
        return;
    }
    
    // Trouver l'item d'inventaire ou en créer un nouveau
    let inventoryItem = inventoryItems.find(item => item.productId === productId);
    let isNew = false;
    
    if (!inventoryItem) {
        inventoryItem = new InventoryItem(productId, 0, threshold);
        inventoryItems.push(inventoryItem);
        isNew = true;
    }
    
    // Créer un nouvel ajustement
    const adjustment = new StockAdjustment(quantity - inventoryItem.quantity, reason, notes);
    inventoryItem.addHistory(adjustment);
    
    // Mettre à jour la quantité
    inventoryItem.quantity = quantity;
    inventoryItem.threshold = threshold;
    
    // Sauvegarder les changements
    saveInventoryData();
    
    // Mettre à jour l'affichage
    renderInventory();
    updateInventoryStats();
    
    // Fermer la modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('adjustStockModal'));
    modal.hide();
    
    // Notification
    showToast(`Stock ${isNew ? 'ajouté' : 'mis à jour'} avec succès`, 'success');
    
    // Vérifier si le stock est faible
    checkLowStockAlerts();
}

// Suppression d'un élément de stock
function deleteStockItem(productId) {
    showConfirmDialog(
        'Supprimer du stock',
        'Êtes-vous sûr de vouloir supprimer ce produit de l\'inventaire ?',
        () => {
            const index = inventoryItems.findIndex(item => item.productId === productId);
            if (index !== -1) {
                inventoryItems.splice(index, 1);
                saveInventoryData();
                renderInventory();
                updateInventoryStats();
                showToast('Produit supprimé de l\'inventaire', 'warning');
            }
        }
    );
}

// Afficher l'historique des mouvements de stock
function showStockHistory(productId) {
    const inventoryItem = inventoryItems.find(item => item.productId === productId);
    if (!inventoryItem) return;
    
    const product = productCatalog.find(p => p.id === productId);
    if (!product) return;
    
    showConfirmDialog(
        `Historique - ${product.brand} ${product.name}`,
        `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Quantité</th>
                        <th>Raison</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${inventoryItem.history.map(h => `
                        <tr>
                            <td>${new Date(h.date).toLocaleString()}</td>
                            <td>${h.quantity > 0 ? '+' : ''}${h.quantity}</td>
                            <td>${h.reason}</td>
                            <td>${h.notes || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `,
        null,
        false
    );
}

// Gestion des commandes
function renderOrders() {
    const ordersTableBody = document.getElementById('orders-items');
    if (!ordersTableBody) return;
    
    ordersTableBody.innerHTML = '';
    
    if (orderHistory.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Aucune commande dans l'historique</td>
            </tr>
        `;
        return;
    }
    
    // Trier les commandes par date (les plus récentes en premier)
    const sortedOrders = [...orderHistory].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    sortedOrders.forEach((order, index) => {
        const productsCount = order.products.length;
        const totalQuantity = order.products.reduce((total, p) => total + p.quantity, 0);
        
        const statusBadge = getStatusBadge(order.status);
        
        ordersTableBody.innerHTML += `
            <tr>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>${order.supplier}</td>
                <td>${productsCount} produit(s)</td>
                <td>${totalQuantity} unité(s)</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="showOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
                        <button class="btn btn-sm btn-outline-success me-1" onclick="updateOrderStatus('${order.id}', 'delivered', 'Livré')">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    ${order.status !== 'cancelled' ? `
                        <button class="btn btn-sm btn-outline-danger" onclick="updateOrderStatus('${order.id}', 'cancelled', 'Annulé')">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
}

// Fonctions pour les commandes
function getStatusBadge(status) {
    switch (status) {
        case 'pending':
            return '<span class="badge bg-secondary">En attente</span>';
        case 'ordered':
            return '<span class="badge bg-primary">Commandé</span>';
        case 'shipped':
            return '<span class="badge bg-info">Expédié</span>';
        case 'delivered':
            return '<span class="badge bg-success">Livré</span>';
        case 'cancelled':
            return '<span class="badge bg-danger">Annulé</span>';
        default:
            return '<span class="badge bg-secondary">Inconnu</span>';
    }
}

// Afficher les détails d'une commande
function showOrderDetails(orderId) {
    const order = orderHistory.find(o => o.id === orderId);
    if (!order) return;
    
    // Construire le contenu de la modal
    const modalContent = document.getElementById('orderDetailsContent');
    
    // En-tête
    let content = `
        <div class="mb-3">
            <h6>Informations générales</h6>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Fournisseur:</strong> ${order.supplier}</p>
                    <p><strong>Date de commande:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Statut:</strong> ${getStatusBadge(order.status)}</p>
                    <p><strong>Date de livraison estimée:</strong> ${order.eta ? new Date(order.eta).toLocaleDateString() : 'Non spécifiée'}</p>
                </div>
            </div>
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        </div>
    `;
    
    // Produits
    content += `
        <h6>Produits commandés</h6>
        <div class="table-responsive mb-3">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    let orderTotal = 0;
    order.products.forEach(product => {
        const productInfo = productCatalog.find(p => p.id === product.productId);
        const productName = productInfo ? `${productInfo.brand} - ${productInfo.name}` : 'Produit inconnu';
        const lineTotal = product.price * product.quantity;
        orderTotal += lineTotal;
        
        content += `
            <tr>
                <td>${productName}</td>
                <td>${product.quantity}</td>
                <td>${product.price.toFixed(2)}€</td>
                <td>${lineTotal.toFixed(2)}€</td>
            </tr>
        `;
    });
    
    content += `
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="3" class="text-end">Total:</th>
                        <th>${orderTotal.toFixed(2)}€</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    // Historique des statuts
    content += `
        <h6>Historique des statuts</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    order.history.forEach(h => {
        content += `
            <tr>
                <td>${new Date(h.date).toLocaleString()}</td>
                <td>${getStatusBadge(h.status)}</td>
                <td>${h.notes || '-'}</td>
            </tr>
        `;
    });
    
    content += `
                </tbody>
            </table>
        </div>
    `;
    
    modalContent.innerHTML = content;
    
    // Configurer le bouton de réception
    const receiveBtn = document.getElementById('orderReceiveBtn');
    receiveBtn.style.display = order.status === 'delivered' || order.status === 'cancelled' ? 'none' : 'block';
    receiveBtn.setAttribute('data-order-id', orderId);
    
    // Afficher la modal
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

// Mise à jour du statut d'une commande
function updateOrderStatus(orderId, newStatus, statusLabel) {
    const order = orderHistory.find(o => o.id === orderId);
    if (!order) return;
    
    // Mettre à jour le statut
    order.updateStatus(newStatus, `Statut mis à jour: ${statusLabel}`);
    
    // Si la commande est livrée, mettre à jour les stocks
    if (newStatus === 'delivered') {
        order.products.forEach(product => {
            let inventoryItem = inventoryItems.find(item => item.productId === product.productId);
            
            // Si le produit n'existe pas en stock, le créer
            if (!inventoryItem) {
                inventoryItem = new InventoryItem(product.productId, 0, 5);
                inventoryItems.push(inventoryItem);
            }
            
            // Ajouter la quantité reçue
            const newQuantity = inventoryItem.quantity + product.quantity;
            const adjustment = new StockAdjustment(
                product.quantity,
                'restock',
                `Commande reçue #${order.id}`
            );
            
            inventoryItem.quantity = newQuantity;
            inventoryItem.addHistory(adjustment);
        });
        
        // Notification
        showToast('Commande reçue et stocks mis à jour', 'success');
    } else if (newStatus === 'cancelled') {
        showToast('Commande annulée', 'warning');
    }
    
    // Sauvegarder et rafraîchir
    saveInventoryData();
    renderOrders();
    renderInventory();
    updateInventoryStats();
    
    // Fermer la modal si elle est ouverte
    const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
    if (modal) modal.hide();
}

// Recevoir une commande (depuis la modal de détails)
function receiveOrder() {
    const orderId = document.getElementById('orderReceiveBtn').getAttribute('data-order-id');
    if (!orderId) return;
    
    updateOrderStatus(orderId, 'delivered', 'Livré');
}

// Afficher la modal de nouvelle commande
function showAddOrderModal() {
    // Réinitialiser le formulaire
    document.getElementById('addOrderForm').reset();
    document.getElementById('orderDate').valueAsDate = new Date();
    
    // Ajouter au moins une ligne de produit
    const orderProductsContainer = document.getElementById('orderProductsContainer');
    orderProductsContainer.innerHTML = '';
    addOrderProductRow();
    
    // Afficher la modal
    const modal = new bootstrap.Modal(document.getElementById('addOrderModal'));
    modal.show();
}

// Ajouter une ligne de produit à la commande
function addOrderProductRow() {
    const container = document.getElementById('orderProductsContainer');
    const rowHtml = document.createElement('div');
    rowHtml.className = 'order-product-row row mb-3';
    
    rowHtml.innerHTML = `
        <div class="col-md-5">
            <select class="form-select order-product-select" required>
                <option value="">Sélectionnez un produit</option>
                ${productCatalog.map(p => `
                    <option value="${p.id}">${p.brand} - ${p.name}</option>
                `).join('')}
            </select>
        </div>
        <div class="col-md-3">
            <input type="number" class="form-control order-product-quantity" placeholder="Quantité" min="1" required>
        </div>
        <div class="col-md-3">
            <input type="number" class="form-control order-product-price" placeholder="Prix unitaire" min="0" step="0.01" required>
        </div>
        <div class="col-md-1">
            <button type="button" class="btn btn-outline-danger" onclick="removeOrderProduct(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(rowHtml);
    
    // Ajouter un événement pour pré-remplir le prix
    const selectElement = rowHtml.querySelector('.order-product-select');
    selectElement.addEventListener('change', function() {
        const productId = this.value;
        if (!productId) return;
        
        const product = productCatalog.find(p => p.id === productId);
        if (product) {
            const priceInput = this.closest('.order-product-row').querySelector('.order-product-price');
            priceInput.value = product.price.toFixed(2);
        }
    });
}

// Supprimer une ligne de produit
function removeOrderProduct(buttonElement) {
    const row = buttonElement.closest('.order-product-row');
    const container = document.getElementById('orderProductsContainer');
    
    // S'assurer qu'il reste au moins une ligne
    if (container.children.length > 1) {
        row.remove();
    } else {
        showToast('La commande doit contenir au moins un produit', 'warning');
    }
}

// Soumettre une nouvelle commande
function submitOrder() {
    const supplier = document.getElementById('orderSupplier').value.trim();
    const date = document.getElementById('orderDate').value;
    const status = document.getElementById('orderStatus').value;
    const eta = document.getElementById('orderETA').value;
    const notes = document.getElementById('orderNotes').value.trim();
    
    if (!supplier || !date) {
        showToast('Veuillez remplir tous les champs obligatoires', 'danger');
        return;
    }
    
    // Récupérer les produits
    const productRows = document.querySelectorAll('.order-product-row');
    const products = [];
    
    for (const row of productRows) {
        const productId = row.querySelector('.order-product-select').value;
        const quantity = parseInt(row.querySelector('.order-product-quantity').value);
        const price = parseFloat(row.querySelector('.order-product-price').value);
        
        if (!productId || isNaN(quantity) || isNaN(price) || quantity <= 0) {
            showToast('Veuillez remplir correctement tous les produits', 'danger');
            return;
        }
        
        products.push({
            productId,
            quantity,
            price
        });
    }
    
    // Créer la commande
    const newOrder = new Order(
        supplier,
        date,
        products,
        status,
        eta,
        notes
    );
    
    // Ajouter à l'historique
    orderHistory.push(newOrder);
    
    // Sauvegarder et rafraîchir
    saveInventoryData();
    renderOrders();
    
    // Fermer la modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addOrderModal'));
    modal.hide();
    
    showToast('Commande créée avec succès', 'success');
}

// Export et import CSV
function exportInventoryCSV() {
    if (inventoryItems.length === 0) {
        showToast('Aucune donnée à exporter', 'warning');
        return;
    }
    
    // Préparer les données
    const csvData = [];
    
    // En-têtes
    csvData.push(['Marque', 'Nom', 'Pays', 'Quantité', 'Seuil d\'alerte', 'Prix unitaire', 'Catégorie', 'ID Produit']);
    
    // Données
    inventoryItems.forEach(item => {
        const product = productCatalog.find(p => p.id === item.productId);
        if (!product) return;
        
        csvData.push([
            product.brand,
            product.name,
            product.country,
            item.quantity,
            item.threshold,
            product.price.toFixed(2),
            item.category,
            item.productId
        ]);
    });
    
    // Créer le fichier CSV
    const csv = Papa.unparse(csvData);
    downloadFile(csv, 'inventaire.csv', 'text/csv');
}

function importInventoryCSV() {
    // Déclencher le clic sur l'input file
    document.getElementById('csvFileInput').click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvContent = e.target.result;
        
        Papa.parse(csvContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    // Vérifier si le format correspond
                    const firstRow = results.data[0];
                    
                    if (!firstRow['ID Produit'] || !firstRow['Quantité'] || !firstRow['Seuil d\'alerte']) {
                        showToast('Format CSV invalide. Veuillez utiliser le format d\'export standard.', 'danger');
                        return;
                    }
                    
                    // Mettre à jour l'inventaire
                    let updatedCount = 0;
                    let newCount = 0;
                    
                    results.data.forEach(row => {
                        const productId = row['ID Produit'];
                        const quantity = parseInt(row['Quantité']);
                        const threshold = parseInt(row['Seuil d\'alerte']);
                        const category = row['Catégorie'] || 'C';
                        
                        if (!productId || isNaN(quantity) || isNaN(threshold)) return;
                        
                        let inventoryItem = inventoryItems.find(item => item.productId === productId);
                        
                        if (inventoryItem) {
                            // Mettre à jour l'existant
                            const adjustment = new StockAdjustment(
                                quantity - inventoryItem.quantity,
                                'import',
                                'Import CSV'
                            );
                            
                            inventoryItem.quantity = quantity;
                            inventoryItem.threshold = threshold;
                            inventoryItem.category = category;
                            inventoryItem.addHistory(adjustment);
                            
                            updatedCount++;
                        } else {
                            // Créer un nouvel élément
                            inventoryItem = new InventoryItem(productId, quantity, threshold);
                            inventoryItem.category = category;
                            
                            const adjustment = new StockAdjustment(
                                quantity,
                                'initial',
                                'Import CSV'
                            );
                            
                            inventoryItem.addHistory(adjustment);
                            inventoryItems.push(inventoryItem);
                            
                            newCount++;
                        }
                    });
                    
                    // Sauvegarder et rafraîchir
                    saveInventoryData();
                    renderInventory();
                    updateInventoryStats();
                    
                    showToast(`Import terminé : ${updatedCount} produits mis à jour, ${newCount} nouveaux produits.`, 'success');
                } else {
                    showToast('Aucune donnée trouvée dans le fichier CSV.', 'warning');
                }
                
                // Réinitialiser l'input file
                event.target.value = '';
            },
            error: function(error) {
                console.error('Erreur lors de l\'analyse du CSV:', error);
                showToast('Erreur lors de l\'analyse du fichier CSV.', 'danger');
                
                // Réinitialiser l'input file
                event.target.value = '';
            }
        });
    };
    
    reader.readAsText(file);
}

// Extensions de la fonction showConfirmDialog pour accepter du HTML et désactiver le bouton
function showConfirmDialog(title, message, callback, showConfirmButton = true) {
    const modalLabel = document.getElementById('confirmModalLabel');
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmModalBtn');
    
    modalLabel.textContent = title;
    modalBody.innerHTML = message; // Utiliser innerHTML pour supporter le HTML
    
    // Gérer le bouton de confirmation
    if (showConfirmButton) {
        confirmBtn.style.display = 'block';
        
        // Supprimer les anciens event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // Ajouter le nouveau event listener
        if (callback) {
            newConfirmBtn.addEventListener('click', () => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
                modal.hide();
                callback();
            });
        }
    } else {
        confirmBtn.style.display = 'none';
    }
    
    // Afficher la modal
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

// Intégration avec les ventes
// Mettre à jour le stock lors de la validation d'un panier
const originalValidateCart = validateCart;
validateCart = function() {
    if (typeof initializeInventoryModule === 'function') {
        // Vérifier si tous les articles sont en stock
        let allInStock = true;
        const outOfStockItems = [];
        
        for (const item of currentCart.items) {
            // Trouver le produit dans le catalogue
            const catalogItem = productCatalog.find(
                p => p.brand === item.brand && p.name === item.name
            );
            
            if (catalogItem) {
                // Vérifier si le produit est en stock
                const inventoryItem = inventoryItems.find(i => i.productId === catalogItem.id);
                
                if (!inventoryItem || inventoryItem.quantity <= 0) {
                    allInStock = false;
                    outOfStockItems.push(`${item.brand} ${item.name}`);
                }
            }
        }
        
        if (!allInStock) {
            showToast(`Articles en rupture de stock : ${outOfStockItems.join(', ')}`, 'danger');
            return;
        }
    }
    
    // Appeler la fonction originale si tout est en stock
    originalValidateCart();
    
// Mettre un petit délai pour s'assurer que la vente est bien enregistrée
    setTimeout(function() {
        // Mise à jour du stock après validation du panier
        if (typeof updateInventoryAfterSale === 'function') {
            updateInventoryAfterSale();
        }
    }, 500);
};

// Mettre à jour le stock après une vente
function updateInventoryAfterSale() {
    console.log("Mise à jour de l'inventaire après vente");
    // Récupérer le dernier panier validé
    const lastSale = salesHistory[salesHistory.length - 1];
    
    if (!lastSale || !lastSale.items || lastSale.items.length === 0) {
        console.log("Aucune vente valide trouvée");
        return;
    }
    
    console.log("Vente trouvée avec", lastSale.items.length, "articles");
    
    lastSale.items.forEach(item => {
        // Trouver le produit dans le catalogue
        const catalogItem = productCatalog.find(
            p => p.brand === item.brand && p.name === item.name
        );
        
        if (catalogItem) {
            console.log("Produit trouvé dans le catalogue:", catalogItem.brand, catalogItem.name);
            // Mettre à jour le stock
            const inventoryItem = inventoryItems.find(i => i.productId === catalogItem.id);
            
            if (inventoryItem) {
                console.log("État du stock avant:", inventoryItem.quantity);
                if (inventoryItem.quantity > 0) {
                    const newQuantity = inventoryItem.quantity - 1;
                    const adjustment = new StockAdjustment(
                        -1,
                        'sale',
                        `Vente #${salesHistory.length}`
                    );
                    
                    inventoryItem.quantity = newQuantity;
                    inventoryItem.addHistory(adjustment);
                    inventoryItem.rotationScore += 1; // Incrémenter le score de rotation
                    inventoryItem.updateCategory(); // Mettre à jour la catégorie
                    console.log("Stock mis à jour:", newQuantity);
                } else {
                    console.log("Impossible de déduire: stock insuffisant");
                }
            } else {
                console.log("Produit non trouvé en stock");
            }
        } else {
            console.log("Produit non trouvé dans le catalogue:", item.brand, item.name);
        }
    });
    
    // Sauvegarder et rafraîchir
    saveInventoryData();
    renderInventory();
    updateInventoryStats();
    
    // Vérifier les alertes de stock
    checkLowStockAlerts();
}

// Mettre à jour le stock après suppression d'une vente (remise en stock)
function updateInventoryAfterSaleDeletion(sale) {
    if (!sale || !sale.items || sale.items.length === 0) return;
    
    sale.items.forEach(item => {
        // Trouver le produit dans le catalogue
        const catalogItem = productCatalog.find(
            p => p.brand === item.brand && p.name === item.name
        );
        
        if (catalogItem) {
            // Mettre à jour le stock
            let inventoryItem = inventoryItems.find(i => i.productId === catalogItem.id);
            
            // Si l'article n'existe pas en stock, le créer
            if (!inventoryItem) {
                inventoryItem = new InventoryItem(catalogItem.id, 0, 5);
                inventoryItems.push(inventoryItem);
            }
            
            // Ajouter la quantité remise en stock (+1)
            const newQuantity = inventoryItem.quantity + 1;
            const adjustment = new StockAdjustment(
                1,
                'return',
                'Vente annulée et produit remis en stock'
            );
            
            inventoryItem.quantity = newQuantity;
            inventoryItem.addHistory(adjustment);
            
            // Ajustement du score de rotation (-1 si possible)
            if (inventoryItem.rotationScore > 0) {
                inventoryItem.rotationScore -= 1;
                inventoryItem.updateCategory();
            }
        }
    });
    
    // Sauvegarder et rafraîchir
    saveInventoryData();
    renderInventory();
    updateInventoryStats();
}
// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    if (typeof initializeInventoryModule === 'function') {
        initializeInventoryModule();
    }
});