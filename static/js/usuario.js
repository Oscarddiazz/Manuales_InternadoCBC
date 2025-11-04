

// ===== CONFIGURACIÓN GLOBAL =====
const MANUAL_CONFIG = {
    totalSections: 3,
    transitionDuration: 600,
    homePageUrl: 'index.html', // Cambia por tu página de inicio
    autoSaveProgress: true
};

// ===== CLASE PRINCIPAL DEL MANUAL =====
class ManualController {
    constructor() {
        this.currentSection = 1;
        this.totalSections = MANUAL_CONFIG.totalSections;
        this.sections = [];
        this.isTransitioning = false;
        
        this.init();
    }

    /**
     * Inicializa el controlador del manual
     */
    init() {
        this.cacheDOMElements();
        this.setupEventListeners();
        this.loadSavedProgress();
        this.updateInterface();
        this.showCurrentSection();
        
        console.log('📖 Manual de usuario inicializado');
    }

    /**
     * Cachea elementos del DOM para mejor rendimiento
     */
    cacheDOMElements() {
        // Botones de navegación
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.backBtn = document.getElementById('backBtn');
        
        // Elementos de interfaz
        this.progressFill = document.getElementById('progressFill');
        this.currentSectionSpan = document.querySelector('.current-section');
        this.totalSectionsSpan = document.querySelector('.total-sections');
        
        // Secciones
        this.sections = Array.from(document.querySelectorAll('.section-card'));
        
        // Verificar que todos los elementos existen
        this.validateDOMElements();
    }

    /**
     * Valida que todos los elementos del DOM existen
     */
    validateDOMElements() {
        const requiredElements = [
            { element: this.prevBtn, name: 'prevBtn' },
            { element: this.nextBtn, name: 'nextBtn' },
            { element: this.backBtn, name: 'backBtn' },
            { element: this.progressFill, name: 'progressFill' },
            { element: this.currentSectionSpan, name: 'currentSectionSpan' }
        ];

        requiredElements.forEach(({ element, name }) => {
            if (!element) {
                console.warn(`⚠️ Elemento ${name} no encontrado`);
            }
        });

        if (this.sections.length === 0) {
            console.warn('⚠️ No se encontraron secciones del manual');
        }
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        // Navegación entre secciones
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSection());
        }
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousSection());
        }
        
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.goHome());
        }

        // Navegación con teclado
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        
        // Guardar progreso cuando cambie la sección
        window.addEventListener('beforeunload', () => this.saveProgress());
    }

    /**
     * Maneja la navegación con teclado
     * @param {KeyboardEvent} e - Evento del teclado
     */
    handleKeyNavigation(e) {
        if (this.isTransitioning) return;

        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                this.nextSection();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                this.previousSection();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSection(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToSection(this.totalSections);
                break;
            case 'Escape':
                e.preventDefault();
                this.goHome();
                break;
        }
    }

    /**
     * Navega a la siguiente sección
     */
    nextSection() {
        if (this.currentSection < this.totalSections && !this.isTransitioning) {
            this.goToSection(this.currentSection + 1);
        }
    }

    /**
     * Navega a la sección anterior
     */
    previousSection() {
        if (this.currentSection > 1 && !this.isTransitioning) {
            this.goToSection(this.currentSection - 1);
        }
    }

    /**
     * Navega a una sección específica
     * @param {number} sectionNumber - Número de sección (1-indexado)
     */
    goToSection(sectionNumber) {
        if (sectionNumber < 1 || sectionNumber > this.totalSections || 
            sectionNumber === this.currentSection || this.isTransitioning) {
            return;
        }

        this.isTransitioning = true;
        this.currentSection = sectionNumber;
        
        this.hideAllSections();
        
        setTimeout(() => {
            this.showCurrentSection();
            this.updateInterface();
            this.saveProgress();
            
            setTimeout(() => {
                this.isTransitioning = false;
            }, MANUAL_CONFIG.transitionDuration);
        }, 150);
    }

    /**
     * Oculta todas las secciones
     */
    hideAllSections() {
        this.sections.forEach(section => {
            section.classList.remove('active');
            section.classList.add('hidden');
        });
    }

    /**
     * Muestra la sección actual
     */
    showCurrentSection() {
        const currentSectionElement = this.sections[this.currentSection - 1];
        if (currentSectionElement) {
            currentSectionElement.classList.remove('hidden');
            
            // Pequeño delay para la animación
            setTimeout(() => {
                currentSectionElement.classList.add('active');
            }, 50);
        }
    }

    /**
     * Actualiza la interfaz de usuario
     */
    updateInterface() {
        this.updateProgressBar();
        this.updateSectionIndicator();
        this.updateNavigationButtons();
    }

    /**
     * Actualiza la barra de progreso
     */
    updateProgressBar() {
        if (!this.progressFill) return;
        
        const progress = (this.currentSection / this.totalSections) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    /**
     * Actualiza el indicador de sección actual
     */
    updateSectionIndicator() {
        if (this.currentSectionSpan) {
            this.currentSectionSpan.textContent = this.currentSection;
        }
        
        if (this.totalSectionsSpan) {
            this.totalSectionsSpan.textContent = this.totalSections;
        }
    }

    /**
     * Actualiza el estado de los botones de navegación
     */
    updateNavigationButtons() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentSection === 1;
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentSection === this.totalSections;
            
            // Cambiar texto del botón en la última sección
            if (this.currentSection === this.totalSections) {
                this.nextBtn.textContent = 'Finalizar ✓';
            } else {
                this.nextBtn.textContent = 'Siguiente →';
            }
        }
    }

    /**
     * Guarda el progreso actual en localStorage
     */
    saveProgress() {
        if (!MANUAL_CONFIG.autoSaveProgress) return;
        
        try {
            const progressData = {
                currentSection: this.currentSection,
                timestamp: new Date().toISOString(),
                completed: this.currentSection === this.totalSections
            };
            
            localStorage.setItem('sena-manual-progress', JSON.stringify(progressData));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar el progreso:', error);
        }
    }

    /**
     * Carga el progreso guardado
     */
    loadSavedProgress() {
        if (!MANUAL_CONFIG.autoSaveProgress) return;
        
        try {
            const savedProgress = localStorage.getItem('sena-manual-progress');
            if (savedProgress) {
                const progressData = JSON.parse(savedProgress);
                
                // Solo restaurar si el progreso es reciente (último día)
                const savedTime = new Date(progressData.timestamp);
                const now = new Date();
                const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24 && progressData.currentSection) {
                    this.currentSection = progressData.currentSection;
                    console.log(`📚 Progreso restaurado: Sección ${this.currentSection}`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error al cargar progreso guardado:', error);
        }
    }

    /**
     * Navega de vuelta a la página de inicio
     */
    goHome() {
        // Animación de salida
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = MANUAL_CONFIG.homePageUrl;
        }, 500);
        
        console.log('🏠 Regresando al inicio...');
    }

    /**
     * Método para debugging
     */
    debug() {
        console.log('🔧 Estado del manual:', {
            currentSection: this.currentSection,
            totalSections: this.totalSections,
            isTransitioning: this.isTransitioning,
            sectionsFound: this.sections.length
        });
    }

    /**
     * Reinicia el manual a la primera sección
     */
    reset() {
        this.goToSection(1);
        localStorage.removeItem('sena-manual-progress');
        console.log('🔄 Manual reiniciado');
    }
}

// ===== FUNCIONES UTILITARIAS =====

/**
 * Verifica si el dispositivo es móvil
 * @returns {boolean}
 */
function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * Muestra una notificación temporal
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación ('success', 'warning', 'error')
 */
function showNotification(message, type = 'info') {
    // Esta función podría expandirse para mostrar notificaciones visuales
    console.log(`${getNotificationIcon(type)} ${message}`);
}

/**
 * Obtiene el ícono para el tipo de notificación
 * @param {string} type - Tipo de notificación
 * @returns {string}
 */
function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

// ===== INICIALIZACIÓN =====

// Variable global para la instancia del manual
let manualController;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initManual);
} else {
    initManual();
}

/**
 * Función de inicialización principal
 */
function initManual() {
    try {
        manualController = new ManualController();
    } catch (error) {
        console.error('❌ Error al inicializar el manual:', error);
        showNotification('Error al cargar el manual', 'error');
    }
}

// ===== EXPORTAR PARA TESTING (OPCIONAL) =====
// Si necesitas hacer testing, descomenta la siguiente línea:
// window.ManualController = ManualController;