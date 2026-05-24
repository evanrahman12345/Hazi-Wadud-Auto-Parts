import { getStoreConfig, saveStoreConfig } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Login elements
    const loginSection = document.getElementById('loginSection');
    const adminSection = document.getElementById('adminSection');
    const loginForm = document.getElementById('loginForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    // Admin form elements
    const addressInput = document.getElementById('storeAddress');
    const phoneInput = document.getElementById('storePhone');
    const emailInput = document.getElementById('storeEmail');
    const csvInput = document.getElementById('storeCsv');
    const form = document.getElementById('adminForm');

    // Hardcoded credentials for basic client-side protection
    const ADMIN_EMAIL = 'admin@hajiwadudparts.com';
    const ADMIN_PASS = 'admin123';

    // Check auth status
    function checkAuth() {
        if (sessionStorage.getItem('hw_admin_auth') === 'true') {
            loginSection.style.display = 'none';
            adminSection.style.display = 'block';
            loadConfig();
        } else {
            loginSection.style.display = 'block';
            adminSection.style.display = 'none';
        }
    }

    // Handle Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            sessionStorage.setItem('hw_admin_auth', 'true');
            loginError.style.display = 'none';
            checkAuth();
        } else {
            loginError.style.display = 'block';
        }
    });

    // Handle Logout
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('hw_admin_auth');
        loginEmail.value = '';
        loginPassword.value = '';
        checkAuth();
    });

    // Load initial config
    function loadConfig() {
        const config = getStoreConfig();
        addressInput.value = config.address;
        phoneInput.value = config.phone;
        emailInput.value = config.email;
        csvInput.value = config.csvUrl;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const success = saveStoreConfig(
            addressInput.value.trim(),
            phoneInput.value.trim(),
            emailInput.value.trim(),
            csvInput.value.trim()
        );

        if (success) {
            alert('Configuration saved successfully!');
        } else {
            alert('Failed to save configuration. Please try again.');
        }
    });

    // Initial check
    checkAuth();
});
