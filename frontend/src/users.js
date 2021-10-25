import { BACKEND_PORT } from './config.js';
import { displayContentById } from "./utility.js";
import { openChannels } from './channels.js';
import { fileToDataUrl } from './helpers.js';


export const updateInfoPopup = (info) => {
    document.getElementById('promptContent').innerText = info;
    displayContentById('promptPopup');
};

export let allUsersInfo = new Object();
const getOneUserInfo = (userId, token) => {
    fetch(`http://localhost:${BACKEND_PORT}/user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    }).then((response) => {
        if (response.status === 200) {
            response.json().then((data) => {
                // return data['name'];
                const currentUserId = parseInt(localStorage.getItem('userId'));
                allUsersInfo[userId] = data;
                const allUsers = document.getElementById('allUsers');

                const userBar = document.createElement('li');
                const userBox = document.createElement('span');
                userBar.id = `user${userId}`;
                const userImageBox = document.createElement('span');
                const userimage = document.createElement('img');
                userBox.innerText = data['name'];
                // nonMemberListIDs.push(channel);
                (data['image']) ? userimage.src = data['image']: userimage.src = '../images/person-square.svg';
                userImageBox.append(userimage);
                userBar.append(userImageBox);
                userBar.append(userBox);

                userBar.addEventListener('mouseover', () => {
                    userBar.style.cursor = 'pointer';
                    userBar.style.backgroundColor = 'rgb(255,237,1, 0.3)'
                    userBar.style.boxShadow = 'rgb(255,237,1) 0.1em 0.1em 1em';
                });

                userBar.addEventListener('mouseout', () => {
                    userBar.style.backgroundColor = '';
                    userBar.style.boxShadow = '';
                });

                if (userId === currentUserId) {
                    const annotation = document.createElement('span');
                    annotation.style.color = 'purple';
                    annotation.style.fontSize = '0.8em';
                    annotation.innerText = ' (You)';
                    userBox.append(annotation);
                    document.getElementById('userYourself').append(userBar);
                    userBar.addEventListener('click', getYourProfile);
                } else {
                    let positionIndex = 0;
                    for (let n = 0; n < allUsers.children.length; n++) {
                        if (data['name'].toLowerCase() > allUsers.children[n].children[1].innerText.toLowerCase()) {
                            positionIndex += 1;
                        }
                    };
                    (positionIndex === allUsers.children.length) ? allUsers.append(userBar): allUsers.insertBefore(userBar, allUsers.children[positionIndex]);
                    userBar.addEventListener('click', () => {
                        fetch(`http://localhost:${BACKEND_PORT}/user/${userId}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token,
                            }
                        }).then((response) => {
                            if (response.status === 200) {
                                response.json().then((data) => {
                                    document.getElementById("oneUserProfileName").innerText = data['name'];
                                    document.getElementById("oneUserBio").innerText = data['bio'];
                                    document.getElementById("oneUserEmail").innerText = data['email'];
                                    (data['image'] !== null && data['image'].match(/^data:image\/.+/)) ? document.getElementById("oneUserPhoto").src = data['image']:
                                        document.getElementById("oneUserPhoto").src = '../images/person-lines-fill.svg';
                                    document.getElementById("oneUserProfileTitle").children[0].innerText = `${data['name']}'s profile`;
                                    displayContentById("oneUserProfileMask");
                                });
                            };
                        })
                    });
                };
            });
        } else {
            alert("getOneUserInfo failed...");
        }
    });
};

// Get a list of all the users
export const getAllUsers = (token) => {
    fetch(`http://localhost:${BACKEND_PORT}/user`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    }).then((response) => {
        if (response.status === 200) {
            response.json().then((data) => {
                const userYourselfList = document.getElementById('userYourself');
                const allUsersList = document.getElementById('allUsers');
                while (userYourselfList.hasChildNodes()) { userYourselfList.removeChild(userYourselfList.childNodes[0]) };
                while (allUsersList.hasChildNodes()) { allUsersList.removeChild(allUsersList.childNodes[0]) };

                for (let n = 0; n < data['users'].length; n++) {
                    getOneUserInfo(data['users'][n]['id'], token);
                };
            });
        } else {
            alert("getUserList failed...");
        }
    });
    document.getElementById('channelMembers').addEventListener('click', () => {});

}

// display user profile and update
export const getYourProfile = () => {
    displayContentById('userProfileMask');
    const userId = localStorage.getItem('userId');
    const password = localStorage.getItem('password');
    const token = localStorage.getItem('token');
    fetch(`http://localhost:${BACKEND_PORT}/user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    }).then((response) => {
        if (response.status === 200) {
            response.json().then((data) => {
                console.log(data);
                document.getElementById('userProfileInfoName').value = data['name'];
                document.getElementById('userProfileInfoBio').value = data['bio'];
                document.getElementById('userProfileInfoEmail').value = data['email'];
                document.getElementById('userProfileInfoPassword').value = password;
                document.getElementById('userProfileInfoImageShow').src = data['image'];

                document.getElementById('userProfileInfoImage').addEventListener('change', () => {

                    const file = document.getElementById('userProfileInfoImage').files[0];
                    console.log(document.getElementById('userProfileInfoImage').files[0]['name']);
                    fileToDataUrl(file).then(data => {
                        document.getElementById('userProfileInfoImageShow').src = data;
                    });
                });
            });
        } else {
            alert("getUserProfileInfo failed...");
        };
    });
};

document.getElementById('userProfileBtn').addEventListener('click', getYourProfile);


document.getElementById('userProfileInfoPasswordToggle').addEventListener('click', () => {
    if (document.getElementById('userProfileInfoPasswordToggle').checked === true) {
        document.getElementById('userProfileInfoPassword').type = 'text';
    } else {
        document.getElementById('userProfileInfoPassword').type = 'Password';
    };
});


document.getElementById('userProfileUpdateBtn').addEventListener('click', () => {
    const newEmail = document.getElementById('userProfileInfoEmail').value;
    const newName = document.getElementById('userProfileInfoName').value;
    const newBio = document.getElementById('userProfileInfoBio').value;
    const newImage = document.getElementById('userProfileInfoImageShow').src;
    const newPassword = document.getElementById('userProfileInfoPassword').value;

    const userId = localStorage.getItem('userId');
    if (newEmail === allUsersInfo[userId]['email'] && newName === allUsersInfo[userId]['name'] &&
        newBio === allUsersInfo[userId]['bio'] && newImage === allUsersInfo[userId]['image'] &&
        newPassword === localStorage.getItem('password')) {
        updateInfoPopup("Nothing changed!!! Try again!!!");
    } else {
        const userProfileUpdateInfo = JSON.stringify({
            email: newEmail,
            password: newPassword,
            name: newName,
            bio: newBio,
            image: newImage
        });

        const token = localStorage.getItem('token');

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: userProfileUpdateInfo,
        }

        fetch(`http://localhost:${BACKEND_PORT}/user`, requestOptions).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    // closePopupForm();
                    allUsersInfo[userId]['email'] = newEmail;
                    allUsersInfo[userId]['name'] = newName;
                    allUsersInfo[userId]['bio'] = newBio;
                    allUsersInfo[userId]['image'] = newImage;
                    localStorage.setItem('password', newPassword);
                    updateInfoPopup("Update user's own profile successfully!!!");
                    openChannels(token);
                    console.log("Update user's own profile successfully!!!");
                });
            } else {
                alert("Failed to update user's own profile...");
            };
        });
    }

});