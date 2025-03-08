/**
 * Module Produits - Le Diplomate
 * Gère le catalogue des produits
 */

// Initialiser le module des produits
LeDiplomate.produits = {
    // Variables du module
    currentPage: 1,
    itemsPerPage: 10,
    currentItems: [],
    filteredItems: [],
    
    /**
     * Initialise le module
     */
    init: function() {
        console.log('Initialisation du module Produits');
        
        // Initialiser les gestionnaires d'événements
        this.initEventListeners();
        
        // Charger les données de produits
        this.loadProductsData();
    },
    
    /**
     * Initialise les gestionnaires d'événements
     */
    initEventListeners: function() {
        // Recherche
        document.getElementById('product-catalog-search').addEventListener('input', this.debounce(this.searchProducts.bind(this), 300));
        document.getElementById('product-search-btn').addEventListener('click', this.searchProducts.bind(this));
        
        // Actions CRUD
        document.getElementById('add-product-item').addEventListener('click', this.showAddProductModal.bind(this));
        document.getElementById('import-products').addEventListener('click', this.importProductsExcel.bind(this));
        document.getElementById('export-products').addEventListener('click', this.exportProductsExcel.bind(this));
        
        // Formulaire de produit
        document.querySelector('body').addEventListener('submit', e => {
            if (e.target.id === 'product-form') {
                e.preventDefault();
                this.saveProductItem();
            }
        });
        
        // Événement de suppression et modification de produit
        document.getElementById('product-items').addEventListener('click', e => {
            if (e.target.classList.contains('edit-product') || e.target.parentElement.classList.contains('edit-product')) {
                const productId = e.target.closest('tr').dataset.id;
                this.editProductItem(productId);
            } else if (e.target.classList.contains('delete-product') || e.target.parentElement.classList.contains('delete-product')) {
                const productId = e.target.closest('tr').dataset.id;
                this.deleteProductItem(productId);
            }
        });
    },
    
    /**
     * Charge les données de produits
     */
    loadProductsData: function() {
        // Récupérer les données de produits
        const products = LeDiplomate.dataManager.products.getAll();
        this.currentItems = products;
        this.filteredItems = products;
        
        // Afficher les données
        this.renderProductsTable();
    },
    
    /**
     * Affiche le tableau de produits
     */
    renderProductsTable: function() {
        const tableBody = document.getElementById('product-items');
        tableBody.innerHTML = '';
        
        if (this.filteredItems.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="10" class="text-center">Aucun produit trouvé</td>';
            tableBody.appendChild(row);
            
            // Masquer la pagination
            document.getElementById('products-pagination').innerHTML = '';
            return;
        }
        
        // Calculer la pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredItems.length);
        const paginatedItems = this.filteredItems.slice(startIndex, endIndex);
        
        // Afficher les produits
        paginatedItems.forEach(product => {
            // Récupérer le prix depuis le stock si disponible
            const stockItem = LeDiplomate.dataManager.stock.getByProductId(product.id);
            const price = stockItem ? LeDiplomate.formatPrice(stockItem.price) + '€' : '--';
            
            const row = document.createElement('tr');
            row.dataset.id = product.id;
            
            row.innerHTML = `
                <td>${product.brand || '--'}</td>
                <td>${product.name || '--'}</td>
                <td>${product.country || '--'}</td>
                <td>${product.vitole || '--'}</td>
                <td>${product.wrapper || '--'}</td>
                <td>${product.binder || '--'}</td>
                <td>${product.filler || '--'}</td>
                <td>${product.strength || '--'}</td>
                <td>${price}</td>
                <td>
                    <button class="action-btn edit-product" title="Modifier">✎</button>
                    <button class="action-btn delete-product" title="Supprimer">✕</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Mettre à jour la pagination
        this.renderPagination();
    },
    
    /**
     * Affiche les contrôles de pagination
     */
    renderPagination: function() {
        const paginationContainer = document.getElementById('products-pagination');
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
                this.renderProductsTable();
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
                this.renderProductsTable();
            });
            
            paginationContainer.appendChild(pageButton);
        }
        
        // Bouton suivant
        if (this.currentPage < pageCount) {
            const nextButton = document.createElement('button');
            nextButton.textContent = '→';
            nextButton.addEventListener('click', () => {
                this.currentPage++;
                this.renderProductsTable();
            });
            paginationContainer.appendChild(nextButton);
        }
    },
    
    /**
     * Recherche dans le catalogue
     */
    searchProducts: function() {
        const query = document.getElementById('product-catalog-search').value.trim();
        
        if (query === '') {
            // Réinitialiser la recherche
            this.filteredItems = this.currentItems;
        } else {
            // Appliquer la recherche
            this.filteredItems = LeDiplomate.dataManager.products.search(query);
        }
        
        // Réinitialiser la pagination
        this.currentPage = 1;
        
        // Mettre à jour l'affichage
        this.renderProductsTable();
    },
    
    /**
     * Affiche la modale d'ajout de produit
     */
    showAddProductModal: function() {
        // Réinitialiser le formulaire
        document.getElementById('product-id').value = '';
        document.getElementById('product-brand').value = '';
        document.getElementById('product-name').value = '';
        document.getElementById('product-country').value = '';
        document.getElementById('product-vitole').value = '';
        document.getElementById('product-wrapper').value = '';
        document.getElementById('product-binder').value = '';
        document.getElementById('product-filler').value = '';
        document.getElementById('product-strength').value = 'Moyenne';
        
        // Afficher la modale
        LeDiplomate.modals.show('tpl-modal-product-form');
    },
    
    /**
     * Affiche la modale de modification de produit
     * @param {string} productId - ID du produit à modifier
     */
    editProductItem: function(productId) {
        // Récupérer le produit
        const product = LeDiplomate.dataManager.products.getById(productId);
        if (!product) return;
        
        // Remplir le formulaire
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-brand').value = product.brand;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-country').value = product.country;
        document.getElementById('product-vitole').value = product.vitole;
        document.getElementById('product-wrapper').value = product.wrapper;
        document.getElementById('product-binder').value = product.binder;
        document.getElementById('product-filler').value = product.filler;
        document.getElementById('product-strength').value = product.strength;
        
        // Afficher la modale
        LeDiplomate.modals.show('tpl-modal-product-form');
    },
    
    /**
     * Enregistre un produit (ajout ou modification)
     */
    saveProductItem: function() {
        // Récupérer les données du formulaire
        const productId = document.getElementById('product-id').value;
        const brand = document.getElementById('product-brand').value;
        const name = document.getElementById('product-name').value;
        const country = document.getElementById('product-country').value;
        const vitole = document.getElementById('product-vitole').value;
        const wrapper = document.getElementById('product-wrapper').value;
        const binder = document.getElementById('product-binder').value;
        const filler = document.getElementById('product-filler').value;
        const strength = document.getElementById('product-strength').value;
        
        // Valider les données
        if (!brand || !name) {
            alert('Veuillez entrer la marque et le nom du produit');
            return;
        }
        
        // Préparer l'objet produit
        const product = {
            brand,
            name,
            country,
            vitole,
            wrapper,
            binder,
            filler,
            strength
        };
        
        if (productId) {
            // Modification
            product.id = productId;
            LeDiplomate.dataManager.products.update(product);
            LeDiplomate.notifications.show('Produit mis à jour', 'success');
        } else {
            // Ajout
            LeDiplomate.dataManager.products.add(product);
            LeDiplomate.notifications.show('Produit ajouté', 'success');
        }
        
        // Fermer la modale
        LeDiplomate.modals.hide();
        
        // Recharger les données
        this.loadProductsData();
    },
    
    /**
     * Supprime un produit
     * @param {string} productId - ID du produit à supprimer
     */
    deleteProductItem: function(productId) {
        // Récupérer le produit
        const product = LeDiplomate.dataManager.products.getById(productId);
        if (!product) return;
        
        // Vérifier si le produit est en stock
        const stockItem = LeDiplomate.dataManager.stock.getByProductId(productId);
        
        if (stockItem) {
            alert(`Ce produit est présent en stock. Veuillez d'abord le supprimer du stock.`);
            return;
        }
        
        // Demander confirmation
        if (confirm(`Êtes-vous sûr de vouloir supprimer le produit ${product.brand} ${product.name} ?`)) {
            // Supprimer le produit
            LeDiplomate.dataManager.products.delete(productId);
            LeDiplomate.notifications.show('Produit supprimé', 'success');
            
            // Recharger les données
            this.loadProductsData();
        }
    },
    
    /**
     * Importe des données de produits depuis un fichier Excel
     */
    importProductsExcel: function() {
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
            LeDiplomate.dataManager.import.fromExcel(file, 'products', result => {
                // Masquer le loader
                loader.classList.add('hidden');
                
                if (result.success) {
                    LeDiplomate.notifications.show(`${result.count} produits importés avec succès`, 'success');
                    
                    // Recharger les données
                    this.loadProductsData();
                } else {
                    LeDiplomate.notifications.show(`Erreur lors de l'importation: ${result.message}`, 'error');
                }
            });
        });
        
        // Déclencher la boîte de dialogue de sélection de fichier
        input.click();
    },
    
    /**
     * Exporte les données de produits vers un fichier Excel
     */
    exportProductsExcel: function() {
        // Exporter les données
        const result = LeDiplomate.dataManager.export.toExcel('products');
        
        if (result.success) {
            LeDiplomate.notifications.show(`${result.count} produits exportés vers ${result.fileName}`, 'success');
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