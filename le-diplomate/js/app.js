/**
 * Application principale - Le Diplomate
 * Gère le routage et l'initialisation des modules
 */

// Namespace global de l'application
const LeDiplomate = {};

// État de l'application
LeDiplomate.state = {
    currentModule: 'ventes', // Module actif par défaut
};

// Gestionnaire de modales
LeDiplomate.modals = {
    show: function(templateId, data = {}) {
        const modalContainer = document.getElementById('modal-container');
        const modalBody = document.getElementById('modal-body');
        
        // Cloner le template
        const template = document.getElementById(templateId);
        if (!template) {
            console.error(`Template modal non trouvé: ${templateId}`);
            return;
        }
        
        // Remplir le contenu de la modale
        modalBody.innerHTML = '';
        modalBody.appendChild(document.importNode(template.content, true));
        
        // Initialiser les données si nécessaire
        if (typeof data === 'object' && Object.keys(data).length > 0) {
            for (const [id, value] of Object.entries(data)) {
                const element = document.getElementById(id);
                if (element) {
                    if (element.tagName === 'SELECT') {
                        // Pour les select, on doit trouver l'option correspondante
                        const option = Array.from(element.options).find(opt => opt.value === value);
                        if (option) {
                            option.selected = true;
                        }
                    } else {
                        element.value = value;
                    }
                }
            }
        }
        
        // Ajouter les gestionnaires d'événements pour fermer la modale
        document.querySelector('.close-modal').addEventListener('click', this.hide);
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', this.hide);
        });
        
        // Afficher la modale
        modalContainer.classList.remove('hidden');
        
        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';
    },
    
    hide: function() {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.classList.add('hidden');
        
        // Réactiver le scroll du body
        document.body.style.overflow = 'auto';
    }
};

// Gestionnaire de notifications
LeDiplomate.notifications = {
    show: function(message, type = 'success', duration = 3000) {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.textContent = message;
        
        // Ajouter la notification au DOM
        document.body.appendChild(notification);
        
        // Positionner la notification
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '2000';
        
        // Supprimer la notification après la durée spécifiée
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
};
// Ajouter ces méthodes à l'objet LeDiplomate :
LeDiplomate.initNavigation = function() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Récupérer le module à charger
            const module = this.getAttribute('data-module');
            
            // Mettre à jour la classe active
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Charger le module
            LeDiplomate.loadModule(module);
        });
    });
};

LeDiplomate.loadModule = function(moduleName) {
    // Mettre à jour l'état de l'application
    this.state.currentModule = moduleName;
    
    // Afficher le loader
    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
    
    // Récupérer le conteneur principal
    const container = document.getElementById('app-container');
    
    // Vider le conteneur (sauf le loader)
    Array.from(container.children).forEach(child => {
        if (child !== loader) {
            child.remove();
        }
    });
    
    // Récupérer le template du module
    const template = document.getElementById(`tpl-${moduleName}`);
    if (!template) {
        console.error(`Template non trouvé pour le module: ${moduleName}`);
        loader.classList.add('hidden');
        return;
    }
    
    // Cloner le template et l'ajouter au conteneur
    const moduleContent = document.importNode(template.content, true);
    container.appendChild(moduleContent);
    
    // Initialiser le module
    try {
        if (this[moduleName] && typeof this[moduleName].init === 'function') {
            this[moduleName].init();
        } else {
            console.warn(`Le module ${moduleName} n'a pas de méthode d'initialisation.`);
        }
    } catch (error) {
        console.error(`Erreur lors de l'initialisation du module ${moduleName}:`, error);
    }
    
    // Masquer le loader
    loader.classList.add('hidden');
};

/**
 * Initialise les événements de navigation
 */
LeDiplomate.initNavigation = function() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Récupérer le module à charger
            const module = this.getAttribute('data-module');
            
            // Mettre à jour la classe active
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Charger le module
            LeDiplomate.loadModule(module);
        });
    });
};

/**
 * Charge un module spécifique
 * @param {string} moduleName - Nom du module à charger
 */
LeDiplomate.loadModule = function(moduleName) {
    // Mettre à jour l'état de l'application
    this.state.currentModule = moduleName;
    
    // Afficher le loader
    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
    
    // Récupérer le conteneur principal
    const container = document.getElementById('app-container');
    
    // Vider le conteneur (sauf le loader)
    Array.from(container.children).forEach(child => {
        if (child !== loader) {
            child.remove();
        }
    });
    
    // Récupérer le template du module
    const template = document.getElementById(`tpl-${moduleName}`);
    if (!template) {
        console.error(`Template non trouvé pour le module: ${moduleName}`);
        loader.classList.add('hidden');
        return;
    }
    
    // Cloner le template et l'ajouter au conteneur
    const moduleContent = document.importNode(template.content, true);
    container.appendChild(moduleContent);
    
    // Initialiser le module
    try {
        if (this[moduleName] && typeof this[moduleName].init === 'function') {
            this[moduleName].init();
        } else {
            console.warn(`Le module ${moduleName} n'a pas de méthode d'initialisation.`);
        }
    } catch (error) {
        console.error(`Erreur lors de l'initialisation du module ${moduleName}:`, error);
    }
    
    // Masquer le loader
    loader.classList.add('hidden');
};

/**
 * Fonction utilitaire pour formater les prix
 * @param {number} price - Prix à formater
 * @returns {string} - Prix formaté avec 2 décimales
 */
LeDiplomate.formatPrice = function(price) {
    return parseFloat(price).toFixed(2);
};

/**
 * Fonction utilitaire pour formater les dates
 * @param {Date|string} date - Date à formater
 * @returns {string} - Date formatée en DD/MM/YYYY
 */
LeDiplomate.formatDate = function(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
};

/**
 * Fonction utilitaire pour générer un ID unique
 * @returns {string} - ID unique
 */
LeDiplomate.generateId = function() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};