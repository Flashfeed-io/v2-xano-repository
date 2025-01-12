// Function to load Cleave.js script if not already loaded
export function loadCleave() {
    return new Promise((resolve, reject) => {
        if (window.Cleave) {
            resolve(window.Cleave);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/cleave.js/1.6.0/cleave.min.js';
        script.async = true;

        script.onload = () => {
            console.log('Cleave.js loaded successfully');
            resolve(window.Cleave);
        };

        script.onerror = (error) => {
            console.error('Error loading Cleave.js:', error);
            reject(error);
        };

        document.head.appendChild(script);
    });
}

// Initialize Cleave on elements with specific data attributes
export function initCleave() {
    return loadCleave().then(() => {
        // Initialize currency inputs
        document.querySelectorAll('[cc_data="cleave-currency"]').forEach(input => {
            new window.Cleave(input, {
                numeral: true,
                numeralThousandsGroupStyle: 'thousand'
            });
        });

        // You can add more types of formatting here, for example:
        // Phone numbers
        document.querySelectorAll('[cc_data="cleave-phone"]').forEach(input => {
            new window.Cleave(input, {
                phone: true,
                phoneRegionCode: 'US' // or any other region code
            });
        });

        // Date inputs
        document.querySelectorAll('[cc_data="cleave-date"]').forEach(input => {
            new window.Cleave(input, {
                date: true,
                datePattern: ['Y', 'm', 'd']
            });
        });
    }).catch(error => {
        console.error('Failed to initialize Cleave:', error);
    });
}
