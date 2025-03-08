/**
 * Module Fournisseurs - Le Diplomate
 * Gère les fournisseurs de cigares
 */

// Initialiser le module de fournisseurs
LeDiplomate.fournisseurs = {
    // Variables du module
    currentItems: [],
    
    /**
     * Initialise le module
     */
    init: function() {
        console.log('Initialisation du module Fournisseurs');
        
        // Initialiser les gestionnaires d'événements
        this.initEventListeners();
        
        // Charger les données de fournisseurs
        this.loadSuppliersData();
    },
    
    /**
     * Initialise les gestionnaires d'événements
     */
    initEventListeners: function() {
        // Actions CRUD
        document.getElementById('add-supplier').addEventListener('click', this.showAddSupplierModal.bind(this));
        document.getElementById('import-suppliers').addEventListener('click', this.importSuppliersExcel.bind(this));
        document.getElementById('export-suppliers').addEventListener('click', this.exportSuppliersExcel.bind(this));
        
        // Formulaire de fournisseur
        document.querySelector('body').addEventListener('submit', e => {
            if (e.target.id === 'supplier-form') {
                e.preventDefault();
                this.saveSupplierItem();
            }
        });
        
        // Événement de suppression et modification de fournisseur
        document.getElementById('supplier-items').addEventListener('click', e => {
            if (e.target.classList.contains('edit-supplier') || e.target.parentElement.classList.contains('edit-supplier')) {
                const supplierId = e.target.closest('tr').dataset.id;
                this.editSupplierItem(supplierId);
            } else if (e.target.classList.contains('delete-supplier') || e.target.parentElement.classList.contains('delete-supplier')) {
                const supplierId = e.target.closest('tr').dataset.id;
                this.deleteSupplierItem(supplierId);
            }
        });
    },
    
    /**
     * Charge les données de fournisseurs
     */
    loadSuppliersData: function() {
        // Récupérer les données de fournisseurs
        const suppliers = LeDiplomate.dataManager.suppliers.getAll();
        this.currentItems = suppliers;
        
        // Afficher les données
        this.renderSuppliersTable();
    },
    
    /**
     * Affiche le tableau de fournisseurs
     */
    renderSuppliersTable: function() {
        const tableBody = document.getElementById('supplier-items');
        tableBody.innerHTML = '';
        
        if (this.currentItems.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7" class="text-center">Aucun fournisseur enregistré</td>';
            tableBody.appendChild(row);
            return;
        }
        
        // Afficher les fournisseurs
        this.currentItems.forEach(supplier => {
            const productCount = LeDiplomate.dataManager.suppliers.getProductCount(supplier.id);
            
            const row = document.createElement('tr');
            row.dataset.id = supplier.id;
            
            row.innerHTML = `
                <td>${supplier.name || '--'}</td>
                <td>${supplier.contact || '--'}</td>
                <td>${supplier.email || '--'}</td>
                <td>${supplier.phone || '--'}</td>
                <td>${supplier.country || '--'}</td>
                <td>${productCount}</td>
                <td>
                    <button class="action-btn edit-supplier" title="Modifier">✎</button>
                    <button class="action-btn delete-supplier" title="Supprimer">✕</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    },
    
    /**
     * Affiche la modale d'ajout de fournisseur
     */
    showAddSupplierModal: function() {
        // Réinitialiser le formulaire
        document.getElementById('supplier-id').value = '';
        document.getElementById('supplier-name').value = '';
        document.getElementById('supplier-contact').value = '';
        document.getElementById('supplier-email').value = '';
        document.getElementById('supplier-phone').value = '';
        document.getElementById('supplier-country').value = '';
        
        // Afficher la modale
        LeDiplomate.modals.show('tpl-modal-supplier-form');
    },
    
    /**
     * Affiche la modale de modification de fournisseur
     * @param {string} supplierId - ID du fournisseur à modifier
     */
    editSupplierItem: function(supplierId) {
        // Récupérer le fournisseur
        const supplier = LeDiplomate.dataManager.suppliers.getById(supplierId);
        if (!supplier) return;
        
        // Remplir le formulaire
        document.getElementById('supplier-id').value = supplier.id;
        document.getElementById('supplier-name').value = supplier.name;
        document.getElementById('supplier-contact').value = supplier.contact;
        document.getElementById('supplier-email').value = supplier.email;
        document.getElementById('supplier-phone').value = supplier.phone;
        document.getElementById('supplier-country').value = supplier.country;
        
        // Afficher la modale
        LeDiplomate.modals.show('tpl-modal-supplier-form');
    },
    
    /**
     * Enregistre un fournisseur (ajout ou modification)
     */
    saveSupplierItem: function() {
        // Récupérer les données du formulaire
        const supplierId = document.getElementById('supplier-id').value;
        const name = document.getElementById('supplier-name').value;
        const contact = document.getElementById('supplier-contact').value;
        const email = document.getElementById('supplier-email').value;
        const phone = document.getElementById('supplier-phone').value;
        const country = document.getElementById('supplier-country').value;
        
        // Valider les données
        if (!name) {
            alert('Veuillez entrer un nom de fournisseur');
            return;
        }
        
        // Préparer l'objet fournisseur
        const supplier = {
            name,
            contact,
            email,
            phone,
            country
        };
        
        if (supplierId) {
            // Modification
            supplier.id = supplierId;
            LeDiplomate.dataManager.suppliers.update(supplier);
            LeDiplomate.notifications.show('Fournisseur mis à jour', 'success');
        } else {
            // Ajout
            LeDiplomate.dataManager.suppliers.add(supplier);
            LeDiplomate.notifications.show('Fournisseur ajouté', 'success');
        }
        
        // Fermer la modale
        LeDiplomate.modals.hide();
        
        // Recharger les données
        this.loadSuppliersData();
    },
    
    /**
     * Supprime un fournisseur
     * @param {string} supplierId - ID du fournisseur à supprimer
     */
    deleteSupplierItem: function(supplierId) {
        // Récupérer le fournisseur
        const supplier = LeDiplomate.dataManager.suppliers.getById(supplierId);
        if (!supplier) return;
        
        // Vérifier si le fournisseur a des produits associés
        const productCount = LeDiplomate.dataManager.suppliers.getProductCount(supplierId);
        
        if (productCount > 0) {
            alert(`Ce fournisseur est associé à ${productCount} produits. Veuillez d'abord modifier ces produits.`);
            return;
        }
        
        // Demander confirmation
        if (confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur ${supplier.name} ?`)) {
            // Supprimer le fournisseur
            LeDiplomate.dataManager.suppliers.delete(supplierId);
            LeDiplomate.notifications.show('Fournisseur supprimé', 'success');
            
            // Recharger les données
            this.loadSuppliersData();
        }
    },
    
    /**
     * Importe des données de fournisseurs depuis un fichier Excel
     */
    importSuppliersExcel: function() {
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
            LeDiplomate.dataManager.import.fromExcel(file, 'suppliers', result => {
                // Masquer le loader
                loader.classList.add('hidden');
                
                if (result.success) {
                    LeDiplomate.notifications.show(`${result.count} fournisseurs importés avec succès`, 'success');
                    
                    // Recharger les données
                    this.loadSuppliersData();
                } else {
                    LeDiplomate.notifications.show(`Erreur lors de l'importation: ${result.message}`, 'error');
                }
            });
        });
        
        // Déclencher la boîte de dialogue de sélection de fichier
        input.click();
    },
    
    /**
     * Exporte les données de fournisseurs vers un fichier Excel
     */
    exportSuppliersExcel: function() {
        // Exporter les données
        const result = LeDiplomate.dataManager.export.toExcel('suppliers');
        
        if (result.success) {
            LeDiplomate.notifications.show(`${result.count} fournisseurs exportés vers ${result.fileName}`, 'success');
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