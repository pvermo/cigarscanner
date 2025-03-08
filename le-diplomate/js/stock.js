/**
 * Module Stock - Le Diplomate
 * Gère la gestion du stock des cigares
 */

// Initialiser le module de stock
LeDiplomate.stock = {
    // Variables du module
    currentPage: 1,
    itemsPerPage: 10,
    currentItems: [],
    filteredItems: [],
    
    /**
     * Initialise le module
     */
    init: function() {
        console.log('Initialisation du module Stock');
        
        // Initialiser les gestionnaires d'événements
        this.initEventListeners();
        
        // Charger les données de stock
        this.loadStockData();
    },
    
    /**
     * Initialise les gestionnaires d'événements
     */
    initEventListeners: function() {
        // Recherche
        document.getElementById('stock-search').addEventListener('input', this.debounce(this.searchStock.bind(this), 300));
        document.getElementById('stock-search-btn').addEventListener('click', this.searchStock.bind(this));
        
        // Actions CRUD
        document.getElementById('add-stock-item').addEventListener('click', this.showAddStockModal.bind(this));
        document.getElementById('import-stock').addEventListener('click', this.importStockExcel.bind(this));
        document.getElementById('export-stock').addEventListener('click', this.exportStockExcel.bind(this));
        
        // Formulaire de stock
        document.querySelector('body').addEventListener('submit', e => {
            if (e.target.id === 'stock-form') {
                e.preventDefault();
                this.saveStockItem();
            }
        });
        
        // Événement de suppression et modification de stock
        document.getElementById('stock-items').addEventListener('click', e => {
            if (e.target.classList.contains('edit-stock') || e.target.parentElement.classList.contains('edit-stock')) {
                const stockId = e.target.closest('tr').dataset.id;
                this.editStockItem(stockId);
            } else if (e.target.classList.contains('delete-stock') || e.target.parentElement.classList.contains('delete-stock')) {
                const stockId = e.target.closest('tr').dataset.id;
                this.deleteStockItem(stockId);
            }
        });
    },
    
    /**
     * Charge les données de stock
     */
    loadStockData: function() {
        // Récupérer les données de stock
        const stockItems = LeDiplomate.dataManager.stock.getFullStock();
        this.currentItems = stockItems;
        this.filteredItems = stockItems;
        
        // Afficher les données
        this.renderStockTable();
    },
    
    /**
     * Affiche le tableau de stock
     */
    renderStockTable: function() {
        const tableBody = document.getElementById('stock-items');
        tableBody.innerHTML = '';
        
        if (this.filteredItems.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7" class="text-center">Aucun article en stock</td>';
            tableBody.appendChild(row);
            
            // Masquer la pagination
            document.getElementById('stock-pagination').innerHTML = '';
            return;
        }
        
        // Calculer la pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredItems.length);
        const paginatedItems = this.filteredItems.slice(startIndex, endIndex);
        
        // Afficher les articles
        paginatedItems.forEach(item => {
            const product = item.product || {};
            const supplier = item.supplier || {};
            
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            
            row.innerHTML = `
                <td>${product.brand || '--'}</td>
                <td>${product.name || '--'}</td>
                <td>${product.country || '--'}</td>
                <td>${item.quantity}</td>
                <td>${LeDiplomate.formatPrice(item.price)}€</td>
                <td>${supplier.name || '--'}</td>
                <td>
                    <button class="action-btn edit-stock" title="Modifier">✎</button>
                    <button class="action-btn delete-stock" title="Supprimer">✕</button>
                </td>
            `;
            
            // Appliquer des styles conditionnels
            if (item.quantity <= 3) {
                row.querySelector('td:nth-child(4)').style.color = 'red';
                row.querySelector('td:nth-child(4)').style.fontWeight = 'bold';
            }
            
            tableBody.appendChild(row);
        });
        
        // Mettre à jour la pagination
        this.renderPagination();
    },
    
    /**
     * Affiche les contrôles de pagination
     */
    renderPagination: function() {
        const paginationContainer = document.getElementById('stock-pagination');
        paginationContainer.innerHTML = '';
        
        if (this.filteredItems.length <= this.itemsPerPage) {
            return;
        }
        
        const pageCount = Math.ceil(this.filteredItems.length / this.itemsPerPage);
        
        // Bouton précédent
        if (this.currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = '←';
            prevButton.addEventListener('click', () => {
                this.currentPage--;
                this.renderStockTable();
            });
            paginationContainer.appendChild(prevButton);
        }
        
        // Pages
        for (let i = 1; i <= pageCount; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.toggle('active', i === this.currentPage);
            
            pageButton.addEventListener('click', () => {
                this.currentPage = i;
                this.renderStockTable();
            });
            
            paginationContainer.appendChild(pageButton);
        }
        
        // Bouton suivant
        if (this.currentPage < pageCount) {
            const nextButton = document.createElement('button');
            nextButton.textContent = '→';
            nextButton.addEventListener('click', () => {
                this.currentPage++;
                this.renderStockTable();
            });
            paginationContainer.appendChild(nextButton);
        }
    },
    
    /**
     * Recherche dans le stock
     */
    searchStock: function() {
        const query = document.getElementById('stock-search').value.trim();
        
        if (query === '') {
            // Réinitialiser la recherche
            this.filteredItems = this.currentItems;
        } else {
            // Appliquer la recherche
            this.filteredItems = LeDiplomate.dataManager.stock.search(query);
        }
        
        // Réinitialiser la pagination
        this.currentPage = 1;
        
        // Mettre à jour l'affichage
        this.renderStockTable();
    },
    
    /**
     * Affiche la modale d'ajout de stock
     */
    showAddStockModal: function() {
        // Remplir les options de produits
        const productSelect = document.getElementById('stock-product');
        productSelect.innerHTML = '<option value="">Sélectionnez un produit</option>';
        
        LeDiplomate.dataManager.products.getAll().forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.brand} ${product.name}`;
            productSelect.appendChild(option);
        });
        
        // Remplir les options de fournisseurs
        const supplierSelect = document.getElementById('stock-supplier');
        supplierSelect.innerHTML = '<option value="">Sélectionnez un fournisseur</option>';
        
        LeDiplomate.dataManager.suppliers.getAll().forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            supplierSelect.appendChild(option);
        });
        
        // Réinitialiser le formulaire
        document.getElementById('stock-id').value = '';
        document.getElementById('stock-quantity').value = '';
        document.getElementById('stock-price').value = '';
        
        // Afficher la modale
        LeDiplomate.modals.show('tpl-modal-stock-form');
    },
    
    /**
     * Affiche la modale de modification de stock
     * @param {string} stockId - ID de l'article de stock à modifier
     */
    editStockItem: function(stockId) {
        // Récupérer l'article
        const stockItem = LeDiplomate.dataManager.stock.getById(stockId);
        if (!stockItem) return;
        
        // Remplir les options de produits
        const productSelect = document.getElementById('stock-product');
        productSelect.innerHTML = '<option value="">Sélectionnez un produit</option>';
        
        LeDiplomate.dataManager.products.getAll().forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.brand} ${product.name}`;
            productSelect.appendChild(option);
        });
        
        // Remplir les options de fournisseurs
        const supplierSelect = document.getElementById('stock-supplier');
        supplierSelect.innerHTML = '<option value="">Sélectionnez un fournisseur</option>';
        
        LeDiplomate.dataManager.suppliers.getAll().forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            supplierSelect.appendChild(option);
        });
        
        // Remplir le formulaire
        document.getElementById('stock-id').value = stockItem.id;
        document.getElementById('stock-product').value = stockItem.productId;
        document.getElementById('stock-quantity').value = stockItem.quantity;
        document.getElementById('stock-supplier').value = stockItem.supplierId;
        document.getElementById('stock-price').value = stockItem.price;
        
        // Afficher la modale
        LeDiplomate.modals.show('tpl-modal-stock-form');
    },
    
    /**
     * Enregistre un article de stock (ajout ou modification)
     */
    saveStockItem: function() {
        // Récupérer les données du formulaire
        const stockId = document.getElementById('stock-id').value;
        const productId = document.getElementById('stock-product').value;
        const quantity = parseInt(document.getElementById('stock-quantity').value);
        const supplierId = document.getElementById('stock-supplier').value;
        const price = parseFloat(document.getElementById('stock-price').value);
        
        // Valider les données
        if (!productId) {
            alert('Veuillez sélectionner un produit');
            return;
        }
        
        if (!supplierId) {
            alert('Veuillez sélectionner un fournisseur');
            return;
        }
        
        if (isNaN(quantity) || quantity < 0) {
            alert('Veuillez entrer une quantité valide');
            return;
        }
        
        if (isNaN(price) || price <= 0) {
            alert('Veuillez entrer un prix valide');
            return;
        }
        
        // Vérifier si c'est un ajout ou une modification
        const stockItem = {
            productId,
            quantity,
            supplierId,
            price
        };
        
        if (stockId) {
            // Modification
            stockItem.id = stockId;
            LeDiplomate.dataManager.stock.update(stockItem);
            LeDiplomate.notifications.show('Article de stock mis à jour', 'success');
        } else {
            // Ajout
            // Vérifier si le produit existe déjà en stock
            const existingItem = LeDiplomate.dataManager.stock.getByProductId(productId);
            
            if (existingItem) {
                // Mettre à jour l'article existant
                existingItem.quantity += quantity;
                existingItem.price = price;
                existingItem.supplierId = supplierId;
                LeDiplomate.dataManager.stock.update(existingItem);
                LeDiplomate.notifications.show('Quantité de stock mise à jour', 'success');
            } else {
                // Ajouter un nouvel article
                LeDiplomate.dataManager.stock.add(stockItem);
                LeDiplomate.notifications.show('Nouvel article ajouté au stock', 'success');
            }
        }
        
        // Fermer la modale
        LeDiplomate.modals.hide();
        
        // Recharger les données
        this.loadStockData();
    },
    
    /**
     * Supprime un article de stock
     * @param {string} stockId - ID de l'article de stock à supprimer
     */
    deleteStockItem: function(stockId) {
        // Récupérer l'article
        const stockItem = LeDiplomate.dataManager.stock.getById(stockId);
        if (!stockItem) return;
        
        // Récupérer les informations du produit
        const product = LeDiplomate.dataManager.products.getById(stockItem.productId) || {};
        
        // Demander confirmation
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${product.brand} ${product.name} du stock ?`)) {
            // Supprimer l'article
            LeDiplomate.dataManager.stock.delete(stockId);
            LeDiplomate.notifications.show('Article supprimé du stock', 'success');
            
            // Recharger les données
            this.loadStockData();
        }
    },
    
    /**
     * Importe des données de stock depuis un fichier Excel
     */
    importStockExcel: function() {
        // Créer un input file temporaire
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls, .csv';
        
        // Gérer l'événement de sélection de fichier
        input.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Afficher le loader
            const loader = document.getElementById('loader');
            loader.classList.remove('hidden');
            
            // Importer les données
            LeDiplomate.dataManager.import.fromExcel(file, 'stock', result => {
                // Masquer le loader
                loader.classList.add('hidden');
                
                if (result.success) {
                    LeDiplomate.notifications.show(`${result.count} articles importés avec succès`, 'success');
                    
                    // Recharger les données
                    this.loadStockData();
                } else {
                    LeDiplomate.notifications.show(`Erreur lors de l'importation: ${result.message}`, 'error');
                }
            });
        });
        
        // Déclencher la boîte de dialogue de sélection de fichier
        input.click();
    },
    
    /**
     * Exporte les données de stock vers un fichier Excel
     */
    exportStockExcel: function() {
        // Exporter les données
        const result = LeDiplomate.dataManager.export.toExcel('stock');
        
        if (result.success) {
            LeDiplomate.notifications.show(`${result.count} articles exportés vers ${result.fileName}`, 'success');
        } else {
            LeDiplomate.notifications.show('Erreur lors de l\'exportation', 'error');
        }
    },
    
    /**
     * Fonction utilitaire pour limiter le nombre d'appels à une fonction
     * @param {Function} func - Fonction à exécuter
     * @param {number} wait - Délai en millisecondes
     * @returns {Function} - Fonction limitée
     */
    debounce: function(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};