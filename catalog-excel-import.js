// Fonctions pour l'import Excel du catalogue de cigares

// Ajouter un bouton d'import Excel à côté du bouton d'export CSV dans l'onglet Catalogue
function addCatalogExcelImportButton() {
    // Vérifier si le bouton existe déjà (en utilisant un ID unique)
    if (document.getElementById('importCatalogExcelButton')) {
        return; // Le bouton existe déjà, ne rien faire
    }
    
    const exportCSVButton = document.querySelector('#catalog .btn-outline-primary');
    if (exportCSVButton) {
        // Créer le bouton avec un ID unique
        const excelButton = document.createElement('button');
        excelButton.id = 'importCatalogExcelButton';
        excelButton.className = 'btn btn-outline-success me-2';
        excelButton.innerHTML = '<i class="fas fa-file-excel"></i> Importer Excel';
        excelButton.onclick = importCatalogExcel;
        
        // Insérer le bouton avant le bouton d'export CSV
        exportCSVButton.parentNode.insertBefore(excelButton, exportCSVButton);
    }
    
    // Ajouter aussi l'input file pour Excel (une seule fois)
    if (!document.getElementById('catalogExcelFileInput')) {
        const body = document.querySelector('body');
        const excelInput = document.createElement('input');
        excelInput.type = 'file';
        excelInput.id = 'catalogExcelFileInput';
        excelInput.accept = '.xlsx, .xls';
        excelInput.style.display = 'none';
        excelInput.onchange = handleCatalogExcelSelect;
        
        body.appendChild(excelInput);
    }
    
    // Ajouter aussi un bouton pour télécharger un modèle Excel
    addCatalogTemplateButton();
}

// Fonction pour déclencher l'importation Excel
function importCatalogExcel() {
    document.getElementById('catalogExcelFileInput').click();
}

// Fonction pour traiter le fichier Excel sélectionné
function handleCatalogExcelSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        processCatalogExcelFile(data);
    };
    reader.readAsArrayBuffer(file);
}

// Traitement du fichier Excel pour le catalogue
function processCatalogExcelFile(data) {
    try {
        // Lire le workbook
        const workbook = XLSX.read(data, {
            type: 'array',
            cellDates: true,
            cellStyles: true
        });
        
        // Récupérer la première feuille
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir en JSON
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (excelData.length < 2) {
            showToast('Le fichier Excel ne contient pas suffisamment de données.', 'warning');
            return;
        }
        
        // Analyser les en-têtes
        const headers = excelData[0];
        
        // Vérifier le format minimal requis
        const requiredColumns = ['Marque', 'Nom', 'Pays', 'Prix'];
        const columnIndexes = {};
        
        // Trouver les index de colonnes
        requiredColumns.forEach(column => {
            const index = headers.findIndex(header => 
                typeof header === 'string' && header.trim().toLowerCase() === column.toLowerCase()
            );
            columnIndexes[column] = index;
        });
        
        // Trouver l'index du fournisseur (optionnel)
        const supplierIndex = headers.findIndex(header => 
            typeof header === 'string' && header.trim().toLowerCase() === 'fournisseur'
        );
        columnIndexes['Fournisseur'] = supplierIndex;
        
        // Vérifier si toutes les colonnes requises sont présentes
        const missingColumns = requiredColumns.filter(column => columnIndexes[column] === -1);
        
        if (missingColumns.length > 0) {
            showToast(`Colonnes manquantes: ${missingColumns.join(', ')}. Format Excel non valide.`, 'danger');
            return;
        }
        
        // Demander confirmation avant d'importer
        showConfirmDialog(
            'Importer le catalogue',
            `Vous êtes sur le point d'importer ${excelData.length - 1} produits. Voulez-vous continuer?`,
            () => {
                // Vérifier si l'utilisateur veut remplacer ou ajouter
                showConfirmDialog(
                    'Mode d\'importation',
                    'Voulez-vous remplacer le catalogue existant ou ajouter à celui-ci?',
                    () => {
                        // Remplacer le catalogue
                        importCatalogProducts(excelData, columnIndexes, true);
                    },
                    () => {
                        // Ajouter au catalogue
                        importCatalogProducts(excelData, columnIndexes, false);
                    },
                    'Remplacer',
                    'Ajouter'
                );
            }
        );
    } catch (error) {
        console.error('Erreur lors du traitement du fichier Excel:', error);
        showToast('Erreur lors du traitement du fichier Excel.', 'danger');
    } finally {
        // Réinitialiser l'input file
        document.getElementById('catalogExcelFileInput').value = '';
    }
}

// Fonction pour importer les produits dans le catalogue
function importCatalogProducts(excelData, columnIndexes, replace) {
    // Si on remplace, vider le catalogue actuel
    if (replace) {
        productCatalog = [];
    }
    
    let newCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    // Parcourir les lignes de données (en sautant l'en-tête)
    for (let i = 1; i < excelData.length; i++) {
        const row = excelData[i];
        
        // Vérifier que la ligne contient des données
        if (!row || row.length === 0) continue;
        
        // Extraire les données
        const brand = row[columnIndexes['Marque']];
        const name = row[columnIndexes['Nom']];
        const country = row[columnIndexes['Pays']];
        const price = parseFloat(row[columnIndexes['Prix']]);
        let supplier = '';
        
        // Extraire le fournisseur s'il existe
        if (columnIndexes['Fournisseur'] !== -1 && row[columnIndexes['Fournisseur']]) {
            supplier = row[columnIndexes['Fournisseur']];
            
            // Vérifier si le fournisseur existe, sinon l'ajouter
            const suppliers = getSuppliers();
            if (!suppliers.includes(supplier)) {
                addSupplier(supplier);
            }
        }
        
        // Vérifier la validité des données
        if (!brand || !name || !country || isNaN(price) || price <= 0) {
            errorCount++;
            continue;
        }
        
        // Chercher si le produit existe déjà (par nom et marque)
        const existingIndex = productCatalog.findIndex(p => 
            p.brand.toLowerCase() === brand.toString().toLowerCase() && 
            p.name.toLowerCase() === name.toString().toLowerCase()
        );
        
        if (existingIndex !== -1) {
            // Mettre à jour le produit existant
            productCatalog[existingIndex].country = country;
            productCatalog[existingIndex].price = price;
            if (supplier) {
                productCatalog[existingIndex].supplier = supplier;
            }
            updatedCount++;
        } else {
            // Ajouter un nouveau produit
            const newId = Date.now() + Math.random().toString(36).substr(2, 9);
            productCatalog.push({
                id: newId,
                brand: brand,
                name: name,
                country: country,
                supplier: supplier,
                price: price
            });
            newCount++;
        }
    }
    
    // Sauvegarder et rafraîchir
    saveToLocalStorage();
    renderCatalog();
    
    // Message récapitulatif
    showToast(`Import Excel terminé : ${newCount} nouveaux produits, ${updatedCount} produits mis à jour, ${errorCount} erreurs.`, 
            errorCount > 0 ? 'warning' : 'success');
}

// Fonction pour générer un modèle Excel pour le catalogue
function generateCatalogExcelTemplate() {
    try {
        // Définir les en-têtes
        const headers = ['Marque', 'Nom', 'Pays', 'Fournisseur', 'Prix'];
        
        // Créer un exemple de données
        const sampleData = [
            headers,
            ['Cohiba', 'Robusto', 'Cuba', 'Coprova', 25.50],
            ['Montecristo', 'No. 2', 'Cuba', 'Coprova', 22.00],
            ['Davidoff', 'Grand Cru', 'République Dominicaine', 'Davidoff', 30.75],
            ['', '', '', '', '']
        ];
        
        // Créer un workbook et une feuille
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(sampleData);
        
        // Ajouter la feuille au workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Catalogue');
        
        // Générer un blob et télécharger directement
        XLSX.writeFile(wb, 'modele_catalogue.xlsx');
    } catch (error) {
        console.error('Erreur lors de la génération du modèle Excel:', error);
        showToast('Erreur lors de la génération du modèle Excel.', 'danger');
    }
}

// Ajouter un bouton pour télécharger le modèle Excel
function addCatalogTemplateButton() {
    const catalogSection = document.querySelector('#catalog');
    if (catalogSection) {
        const buttonsContainer = catalogSection.querySelector('.d-flex.justify-content-between.align-items-center div');
        
        if (buttonsContainer) {
            // Vérifier si le bouton existe déjà
            if (!document.getElementById('downloadCatalogTemplateBtn')) {
                const templateButton = document.createElement('button');
                templateButton.id = 'downloadCatalogTemplateBtn';
                templateButton.className = 'btn btn-outline-info me-2';
                templateButton.innerHTML = '<i class="fas fa-download"></i> Modèle Excel';
                templateButton.onclick = generateCatalogExcelTemplate;
                
                // Ajouter le bouton en premier
                if (buttonsContainer.firstChild) {
                    buttonsContainer.insertBefore(templateButton, buttonsContainer.firstChild);
                } else {
                    buttonsContainer.appendChild(templateButton);
                }
            }
        }
    }
}

// Exporter le catalogue au format Excel
function exportCatalogExcel() {
    if (productCatalog.length === 0) {
        showToast('Aucune donnée à exporter', 'warning');
        return;
    }
    
    // Préparer les données
    const headers = ['Marque', 'Nom', 'Pays', 'Fournisseur', 'Prix'];
    const rows = [headers];
    
    // Ajouter les données
    productCatalog.forEach(product => {
        rows.push([
            product.brand,
            product.name,
            product.country,
            product.supplier || 'Non spécifié',
            product.price
        ]);
    });
    
    // Créer un workbook et une feuille
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    
    // Formatage
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!ws[address]) continue;
        ws[address].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "CCCCCC" } }
        };
    }
    
    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Catalogue');
    
    // Générer un blob et télécharger
    XLSX.writeFile(wb, 'catalogue.xlsx');
}

// Ajouter le bouton d'export Excel pour le catalogue
function addCatalogExcelExportButton() {
    // Vérifier si le bouton existe déjà
    if (document.getElementById('exportCatalogExcelButton')) {
        return; // Le bouton existe déjà, ne rien faire
    }
    
    const exportCSVButton = document.querySelector('button[onclick="exportCatalogCSV()"]');
    if (exportCSVButton) {
        const exportExcelButton = document.createElement('button');
        exportExcelButton.id = 'exportCatalogExcelButton';
        exportExcelButton.className = 'btn btn-outline-success me-2';
        exportExcelButton.innerHTML = '<i class="fas fa-file-excel"></i> Exporter Excel';
        exportExcelButton.onclick = exportCatalogExcel;
        
        exportCSVButton.parentNode.insertBefore(exportExcelButton, exportCSVButton);
    }
}

// Version améliorée de showConfirmDialog pour supporter plusieurs boutons
function showConfirmDialog(title, message, callback, secondCallback = null, confirmText = 'Confirmer', secondText = null) {
    const modalLabel = document.getElementById('confirmModalLabel');
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmModalBtn');
    
    modalLabel.textContent = title;
    modalBody.innerHTML = message;
    confirmBtn.textContent = confirmText;
    
    // Supprimer les anciens event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Ajouter un second bouton si nécessaire
    let secondBtn = document.getElementById('secondConfirmModalBtn');
    if (secondCallback && secondText) {
        if (!secondBtn) {
            secondBtn = document.createElement('button');
            secondBtn.id = 'secondConfirmModalBtn';
            secondBtn.type = 'button';
            secondBtn.className = 'btn btn-outline-primary';
            newConfirmBtn.parentNode.insertBefore(secondBtn, newConfirmBtn);
        }
        secondBtn.textContent = secondText;
        secondBtn.style.display = 'inline-block';
        
        // Supprimer les anciens event listeners
        const newSecondBtn = secondBtn.cloneNode(true);
        secondBtn.parentNode.replaceChild(newSecondBtn, secondBtn);
        secondBtn = newSecondBtn;
        
        secondBtn.addEventListener('click', () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
            modal.hide();
            if (secondCallback) secondCallback();
        });
    } else if (secondBtn) {
        secondBtn.style.display = 'none';
    }
    
    // Ajouter le nouveau event listener
    newConfirmBtn.addEventListener('click', () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
        modal.hide();
        if (callback) callback();
    });
    
    // Afficher la modal
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

// Initialiser les fonctionnalités d'import Excel pour le catalogue
function initCatalogExcelImport() {
    // S'assurer que la bibliothèque XLSX est disponible
    if (typeof XLSX !== 'undefined') {
        addCatalogExcelImportButton();
        addCatalogExcelExportButton();
    } else {
        console.error('La bibliothèque SheetJS (XLSX) n\'est pas disponible.');
    }
}

// Initialiser lorsque le document est chargé
document.addEventListener('DOMContentLoaded', function() {
    // S'abonner à un événement pour l'onglet Catalogue
    const catalogTab = document.getElementById('catalog-tab');
    if (catalogTab) {
        catalogTab.addEventListener('shown.bs.tab', function() {
            // Initialiser l'import Excel quand l'onglet est affiché
            initCatalogExcelImport();
        });
    }
    
    // Appeler aussi lors du chargement initial
    setTimeout(initCatalogExcelImport, 1000);
});