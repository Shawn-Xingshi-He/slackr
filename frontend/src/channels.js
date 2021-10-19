import { hideContentById, displayContentById } from "./utility.js";


const token = localStorage.getItem('token');

// close createChannelFrom
const closeCreateChannelFrom = () => {
    hideContentById('mask');
    hideContentById('createChannelForm');
    hideContentById('currentChannelInfo')
}
document.getElementById('mask').addEventListener('click', closeCreateChannelFrom);
const closePopupBtns = document.getElementsByClassName('closePopupBtn');
console.log(closePopupBtns.length);
for (let n = 0; n < closePopupBtns.length; n++) {
    closePopupBtns[n].addEventListener('click', closeCreateChannelFrom);
}


const linkChannel = (id) => {
    document.getElementById(id).addEventListener('click', () => {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        };
        fetch(`http://localhost:5005/channel/${id}`, requestOptions).then(
            (response) => {
                if (response.status === 200) {
                    response.json().then((data) => {
                        // console.log(data);
                        const currentChannelName = document.getElementById('currentChannelName');
                        currentChannelName.innerText = data['name'];
                        currentChannelName.addEventListener('click', () => {
                            displayContentById('mask');
                            let formWidth = parseInt(getComputedStyle(document.getElementById('currentChannelInfo')).width);
                            document.getElementById('currentChannelInfo').style.left = (document.documentElement.clientWidth - formWidth) / 2 + 'px';
                            displayContentById('currentChannelInfo');
                        })


                    });
                } else {
                    alert("Channel opening failed...");
                }
            }
        )
    });
};

const showAllChannels = (data) => {
    const channelsList = document.getElementById('channelsList');
    while (channelsList.hasChildNodes()) {
        channelsList.removeChild(channelsList.childNodes[0]);
    }
    const channelIDs = new Array();
    data['channels'].forEach((channel) => {
        const channelBox = document.createElement('div');
        channelBox.id = channel['id'];
        channelIDs.push(channel['id']);
        channelBox.innerText = channel['name'];
        channelsList.append(channelBox);
    })
    channelIDs.map(linkChannel);
}

export const openChannels = (token) => {
    fetch('http://localhost:5005/channel', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    }).then((response) => {
        if (response.status === 200) {
            hideContentById('login');
            hideContentById('register');
            displayContentById('channels');
            response.json().then((data) => { showAllChannels(data); });
        } else {
            alert("openChannelList failed...");
        }
    })
}

// + create channel button
let createFlag = true;
document.getElementById('tackleChannelBtn').addEventListener('click', () => {
    createFlag ? displayContentById('tackleChannelPopup') : hideContentById('tackleChannelPopup');
    createFlag = !createFlag;
});

// display createChannelFrom
document.getElementById('createChannel').addEventListener('click', () => {
    displayContentById('mask');
    let formWidth = parseInt(getComputedStyle(document.getElementById('createChannelForm')).width);
    document.getElementById('createChannelForm').style.left = (document.documentElement.clientWidth - formWidth) / 2 + 'px';
    displayContentById('createChannelForm');
});

//mediate createChannelFrom in the window dynamically
window.addEventListener('resize', () => {
    let formWidth = parseInt(getComputedStyle(document.getElementById('createChannelForm')).width);
    document.getElementById('createChannelForm').style.left = (document.documentElement.clientWidth - formWidth) / 2 + 'px';
    let formwidth = parseInt(getComputedStyle(document.getElementById('currentChannelInfo')).width);
    document.getElementById('currentChannelInfo').style.left = (document.documentElement.clientWidth - formWidth) / 2 + 'px';
})


//
document.getElementById('createChannelBtn').addEventListener('click', () => {
    const name = document.getElementById('newChannelName').value;
    const description = document.getElementById('newChannelDescription').value;
    const privateFlag = document.getElementById('makePrivate').checked;

    const newChannelInfo = JSON.stringify({
        name,
        private: privateFlag,
        description,
    });

    // console.log(newChannelInfo);
    // console.log(token);

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body: newChannelInfo,
    }

    // requestOptions('POST', token, newChannelInfo);
    // console.log(requestOptionss);
    // console.log(requestOptions('POST', token, newChannelInfo) === requestOptionss);
    fetch('http://localhost:5005/channel', requestOptions).then((response) => {
        if (response.status === 200) {
            closeCreateChannelFrom();
            response.json().then((data) => {
                console.log(data);
                openChannels(token);
            });
        } else {
            alert("createChannels failed...");
        };
    });
});