import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
// import { fileToDataUrl } from './helpers.js';
import { openChannels } from './channels.js';
import { hideContentById, displayContentById } from "./utility.js";


// switch signIn page and register page 
document.getElementById('toRegisterPage').addEventListener('click', () => {
    hideContentById('login');
    displayContentById('register');
});

document.getElementById('toLoginPage').addEventListener('click', () => {
    hideContentById('register');
    displayContentById('login');
});

// sign in
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

    fetch(`http://localhost:${BACKEND_PORT}/auth/login`, requestOptions).then((response) => {
        if (response.status === 200) {
            hideContentById('loginError');
            // console.log('Login succeeded!');
            response.json().then((data) => {
                localStorage.setItem('userId', data['userId']);
                localStorage.setItem('token', data['token']);
                localStorage.setItem('password', password);
                // console.log('loginUserId', localStorage.getItem('userId'));
                openChannels(data['token']);
            })
        } else if (response.status === 400) {
            displayContentById('loginError');
        }
    });
});

document.getElementById('loginEmail').addEventListener('click', () => {
    hideContentById('loginError');
});
document.getElementById('loginPassword').addEventListener('click', () => {
    hideContentById('loginError');
});

// sign out
document.getElementById('signOutBtn').addEventListener('click', () => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:${BACKEND_PORT}/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    }).then((response) => {
        if (response.status === 200) {
            // hideContentById('loginError');
            console.log('Logout succeeded!');
            response.json().then((data) => {
                localStorage.clear();
                hideContentById('channels');
                displayContentById('login');
                document.getElementById('loginEmail').value = '';
                document.getElementById('loginPassword').value = '';

            })
        } else if (response.status === 400) {
            alert('loginOut failed...');
        }
    });
})

// register
document.getElementById('registerBtn').addEventListener('click', () => {
    const email = document.getElementById('registerEmail').value;
    const name = document.getElementById('registerName').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    // console.log(email, name + password, confirmPassword);

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
        fetch(`http://localhost:${BACKEND_PORT}/auth/register`, requestOptions).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    // console.log(data);
                    localStorage.setItem('userId', data['userId']);
                    localStorage.setItem('token', data['token']);
                    localStorage.setItem('password', password);
                    openChannels(data['token']);
                })
            } else if (response.status === 400) {
                alert("Please enter valid details!");
            }
        });
    } else {
        displayContentById('registerError');
    }
});

document.getElementById('registerPassword').addEventListener('click', () => {
    hideContentById('registerError');
});
document.getElementById('registerConfirmPassword').addEventListener('click', () => {
    hideContentById('registerError');
});


window.addEventListener('resize', () => {
    if (document.body.clientWidth < 500) {
        document.getElementById('channelsBar').style.display = 'none';
        document.getElementById('channelContent').style.gridColumn = '1/13';
        document.getElementById('headerChannelBarBtn').style.display = 'grid';

    } else {
        document.getElementById('channelsBar').style.display = 'grid';
        document.getElementById('channelContent').style.gridColumn = '';
        document.getElementById('headerChannelBarBtn').style.display = 'none';
    }
    // console.log('g', document.body.clientWidth, document.body.clientHeight);
    // console.log('ddd', document.documentElement.clientWidth, document.documentElement.clientHeight);
})

let channelBarBtnflag = false;
document.getElementById('headerChannelBarBtn').addEventListener('click', () => {
    if (channelBarBtnflag === false) {
        document.getElementById('channelsBar').style.display = 'grid';
        document.getElementById('channelContent').style.gridColumn = '';
        document.getElementById('headerChannelBarBtn').backgroundColor = 'rgb(255, 255, 255, 0.5)';
    } else {
        document.getElementById('channelsBar').style.display = 'none';
        document.getElementById('channelContent').style.gridColumn = '1/13';
        document.getElementById('headerChannelBarBtn').backgroundColor = 'none';
    }
    channelBarBtnflag = !channelBarBtnflag;
    // if (channelBarBtnflag = false) {


    // } else {
    //     document.getElementById('channelsBar').style.display = 'none';
    //     // document.getElementById('channelContent').style.gridColumn = '';
    // }
    // channelBarBtnflag = !channelBarBtnflag;
});