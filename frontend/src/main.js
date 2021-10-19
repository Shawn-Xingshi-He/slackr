import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
import { openChannels } from './channels.js';
import { hideContentById, displayContentById } from "./utility.js";


// page switch
document.getElementById('toRegisterPage').addEventListener('click', () => {
    hideContentById('login');
    displayContentById('register');
});

document.getElementById('toLoginPage').addEventListener('click', () => {
    hideContentById('register');
    displayContentById('login');
});

// login part

document.getElementById('loginBtn').addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const loginInfo = JSON.stringify({
        email,
        password,
    });

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: loginInfo,
    }

    fetch('http://localhost:5005/auth/login', requestOptions).then((response) => {
        if (response.status === 200) {
            hideContentById('loginError');
            console.log('Login succeeded!');
            response.json().then((data) => {
                localStorage.setItem('token', data['token']);
                openChannels(data['token']);
            })
        } else if (response.status === 400) {
            displayContentById('loginError');
        }
    });
});

// register page

document.getElementById('registerBtn').addEventListener('click', () => {
    const email = document.getElementById('registerEmail').value;
    const name = document.getElementById('registerName').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    console.log(email, name + password, confirmPassword);

    const registerInfo = JSON.stringify({
        email,
        password,
        name,
    });

    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: registerInfo,
    }

    if (password === confirmPassword) {
        hideContentById('registerError');
        fetch('http://localhost:5005/auth/register', requestOptions).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => { openChannels(data['token']); })
            } else if (response.status === 400) {
                alert("please enter valid details!");
            }
        });
    } else {
        displayContentById('registerError');
    }

})