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
        };
    }
    
    // Modifier processCatalogExcelFile pour inclure les fournisseurs
    if (typeof processCatalogExcelFile === 'function') {
        const originalProcessCatalogExcelFile = processCatalogExcelFile;
        window.processCatalogExcelFile = function(data) {
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
        };
    }
    
    // Modifier importCatalogProducts pour inclure les fournisseurs
    if (typeof importCatalogProducts === 'function') {
        const originalImportCatalogProducts = importCatalogProducts;
        window.importCatalogProducts = function(excelData, columnIndexes, replace) {
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
        };
    }
}