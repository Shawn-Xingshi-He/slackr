import { hideContentById, hideContentByClass, displayContentById } from "./utility.js";
import { itemExistInArray } from './channels.js';


export let allUsersInfo = new Object();
const getOneUserInfo = (userId, token) => {
    fetch(`http://localhost:5005/user/${userId}`, {
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
                const userimage = document.createElement('img');
                userBox.innerText = data['name'];
                // nonMemberListIDs.push(channel);
                (data['image']) ? userimage.src = data['image']: userimage.src = '../images/person-square.svg';
                userBar.append(userimage);
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
                } else {
                    let positionIndex = 0;
                    for (let n = 0; n < allUsers.children.length; n++) {
                        if (data['name'].toLowerCase() > allUsers.children[n].children[1].innerText.toLowerCase()) {
                            positionIndex += 1;
                        }
                    };
                    (positionIndex === allUsers.children.length) ? allUsers.append(userBar): allUsers.insertBefore(userBar, allUsers.children[positionIndex]);
                };
            });
        } else {
            alert("getOneUserInfo failed...");
        }
    });
};

// Get a list of all the users
export const getAllUsers = (token) => {
    // let allMembers = new Object();
    // const userId = localStorage.getItem('userId');
    // const token = localStorage.getItem('token');
    // let currentChannelMembers = localStorage.getItem('currentChannelMembers').split(',');
    // const channelId = localStorage.getItem('channelId');
    fetch(`http://localhost:5005/user`, {
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

document.getElementById('userProfileBtn').addEventListener('click', () => {
    displayContentById('userProfileMask');
})

/* <div class="form-check">
  <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault">
  <label class="form-check-label" for="flexCheckDefault">
    Default checkbox
  </label>
</div> */
const uploadInfo = () => {
    const editMessage = newMsgEditBtn.children[1].children[0];
    editMessage.addEventListener('click', () => {
        const seletedMsg = document.getElementById(messages[n]['id']);
        // console.log('edit', messages[n]['id']);
        const editWindow = document.createElement('span');
        editWindow.innerText = seletedMsg.children[1].innerText;
        editWindow.contentEditable = true;
        editWindow.className = 'messageContent';
        const formerMsg = seletedMsg.children[1];
        seletedMsg.replaceChild(editWindow, formerMsg);

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-danger';
        cancelBtn.innerText = 'Cancel';
        cancelBtn.style.gridColumn = '2/3';
        cancelBtn.style.marginTop = '0.5em';
        cancelBtn.style.fontSize = '0.7em';
        seletedMsg.append(cancelBtn);
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-primary';
        saveBtn.innerText = 'Save Changes';
        saveBtn.style.gridColumn = '4/6';
        saveBtn.style.marginTop = '0.5em';
        saveBtn.style.fontSize = '0.7em';
        seletedMsg.append(saveBtn);

        saveBtn.addEventListener('click', () => {
            // console.log(seletedMsg.children);
            // console.log(editWindow.innerText, formerMsg.innerText);
            if (editWindow.innerText.match(/^\s*$/)) {
                alert('empty message or message containing only whitespace!!!!');
                editWindow.innerText = formerMsg.innerText;
            } else if (editWindow.innerText === formerMsg.innerText) {
                alert('cannot edit a message to the same existing message...');
                // seletedMsg.replaceChild(seletedMsg.children[1], editWindow);
            } else {
                const token = localStorage.getItem('token');
                const currentChannelId = localStorage.getItem('currentChannelId');
                const editInfo = JSON.stringify({
                    message: editWindow.innerText,
                    image: '',
                });
                // console.log(editInfo);

                requestOptions = {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token,
                    },
                    body: editInfo,
                };
                fetch(`http://localhost:5005/message/${id}/${messages[n]['id']}`, requestOptions).then((response) => {
                    if (response.status === 200) {
                        response.json().then((data) => {
                            for (let m = 0; m < editBtns.length; m++) { editBtns[m].disabled = false; };
                            refreshCurrentChannelMsg(currentChannelId, token, allUsersInfo);
                        });
                    } else {
                        alert("sendMessage failed...");
                    }
                });
            };
        })
    });
};