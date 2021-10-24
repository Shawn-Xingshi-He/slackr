import { hideContentById, hideContentByClass, displayContentById } from "./utility.js";
import { timeStampSwitch, refreshCurrentChannelMsg, cleanAllChildren } from "./messages.js";
import { getAllUsers, allUsersInfo, updateInfoPopup } from "./users.js";


// const token = localStorage.getItem('token');

// close popupFrom
export const closePopupForm = () => { hideContentByClass('mask') };

const closeMasks = document.getElementsByClassName('mask')
for (let n = 0; n < closeMasks.length; n++) {
    closeMasks[n].addEventListener('click', closePopupForm);
}
const closePopupBtns = document.getElementsByClassName('closePopupBtn');
for (let n = 0; n < closePopupBtns.length; n++) {
    closePopupBtns[n].addEventListener('click', closePopupForm);
}
const stopPropagationFuc = (elementId) => {
    document.getElementById(elementId).addEventListener('click', (e) => { e.stopPropagation() });
};

stopPropagationFuc('createChannelForm');
stopPropagationFuc('currentChannelInfo');
stopPropagationFuc('userProfileInfo');
stopPropagationFuc('memberPopup');
stopPropagationFuc('messageImageEnlargeBox');


// clean the channel content space
const cleanChatContentFrame = () => {
    hideContentById('currentChannelName');
    hideContentById('channelMembers');
    cleanAllChildren('currentChannelChatBox');
    hideContentById('currentChannelInput');
    hideContentById('currentChannelInputTackle');
    hideContentById('pinMsgBar');
};

// Get details of the specific channel
export const linkChannel = (id) => {
    document.getElementById(id).addEventListener('mouseover', () => {
        document.getElementById(id).style.cursor = 'pointer';
        document.getElementById(id).style.backgroundColor = 'rgb(77, 255, 0, 0.3)'
        document.getElementById(id).style.boxShadow = 'rgb(77, 255, 0) 0.1em 0.1em 1em';
    });

    document.getElementById(id).addEventListener('mouseout', () => {
        document.getElementById(id).style.backgroundColor = '';
        document.getElementById(id).style.boxShadow = '';
    });
    document.getElementById(id).addEventListener('click', () => {

        localStorage.setItem('currentChannelId', id);
        const token = localStorage.getItem('token');

        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        };
        fetch(`http://localhost:5005/channel/${id}`, requestOptions).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    console.log(data);
                    localStorage.setItem('currentChannelName', data['name']);
                    localStorage.setItem('currentChannelDescription', data['description']);
                    localStorage.setItem('currentChannelMembers', data['members']);
                    // localStorage.setItem('channelId', id);
                    displayContentById('currentChannelName');
                    displayContentById('channelMembers');
                    displayContentById('currentChannelInput');
                    displayContentById('currentChannelInputTackle');
                    displayContentById('pinMsgBar');

                    const currentChannelName = document.getElementById('currentChannelName');
                    currentChannelName.innerText = data['name'];
                    currentChannelName.addEventListener('click', () => {
                        // document.getElementById('currentChannelInfoTitle').children[0].innerText = `Channel: ${data['name']}`;
                        document.getElementById('currentChannelInfoName').innerText = data['name'];
                        document.getElementById('currentChannelInfoDescription').innerText = data['description'];
                        (data['private']) ? document.getElementById('currentChannelInfoPrivate').children[1].innerHTML = 'Private':
                            document.getElementById('currentChannelInfoPrivate').children[1].innerHTML = 'Public';
                        document.getElementById('currentChannelInfoCreatorAndTime').children[1].innerText = allUsersInfo[data['creator']]['name'] +
                            ' on ' + timeStampSwitch(data['createdAt'])[1];
                        displayContentById('currentChannelInfoMask');
                    });

                    document.getElementById('pinMsgBar').addEventListener('click', () => {
                        refreshCurrentChannelMsg(id, token, allUsersInfo);
                        displayContentById('pinPopupMask');
                    });

                    document.getElementById('channelMembers').addEventListener('click', () => {
                        displayContentById('memberPopupMask');
                    })

                    console.log(data['members']);
                    const memberList = document.getElementById('memberList');
                    const nonMemberList = document.getElementById('nonMemberList');
                    while (memberList.hasChildNodes()) { memberList.removeChild(memberList.childNodes[0]) };
                    while (nonMemberList.hasChildNodes()) { nonMemberList.removeChild(nonMemberList.childNodes[0]) };

                    for (let item in allUsersInfo) {
                        console.log(item);
                        const memberBar = document.createElement('li');
                        const memberBox = document.createElement('span');
                        memberBar.id = `member${item}`;
                        const memberImage = document.createElement('img');
                        memberBox.innerText = allUsersInfo[item]['name'];
                        (allUsersInfo[item]['image']) ? memberImage.src = allUsersInfo[item]['image']: memberImage.src = '../images/person-square.svg';
                        memberBar.append(memberImage);
                        memberBar.append(memberBox);
                        // console.log(memberBar);
                        if (itemExistInArray(parseInt(item), data['members'])) {
                            const blankBox = document.createElement('span');
                            memberBar.insertBefore(blankBox, memberBar.firstChild);
                            let positionIndex = 0;
                            for (let n = 0; n < memberList.children.length; n++) {
                                if (allUsersInfo[item]['name'].toLowerCase() > memberList.children[n].children[2].innerText.toLowerCase()) {

                                    positionIndex += 1;
                                }
                            };
                            (positionIndex === memberList.children.length) ? memberList.append(memberBar): memberList.insertBefore(memberBar, memberList.children[positionIndex]);
                        } else {
                            const tickBox = document.createElement('input');
                            tickBox.type = 'checkbox';
                            memberBar.insertBefore(tickBox, memberBar.firstChild);
                            let positionIndex = 0;
                            for (let n = 0; n < nonMemberList.children.length; n++) {
                                if (allUsersInfo[item]['name'].toLowerCase() > nonMemberList.children[n].children[2].innerText.toLowerCase()) {
                                    positionIndex += 1;
                                    // console.log(nonMemberList.children[n].children[1]);
                                }
                            };
                            (positionIndex === nonMemberList.children.length) ? nonMemberList.append(memberBar): nonMemberList.insertBefore(memberBar, nonMemberList.children[positionIndex]);
                        };
                    };
                });
            } else {
                alert("Channel opening failed...");
            }
        });
        console.log(allUsersInfo);
        refreshCurrentChannelMsg(id, token, allUsersInfo);


    });
};
// update channel Information
document.getElementById('updateChannelInfo').addEventListener('click', () => {
    const newChannelName = document.getElementById('currentChannelInfoName').value;
    const newChannelDescription = document.getElementById('currentChannelInfoDescription').value;

    if (newChannelName === localStorage.getItem('currentChannelName') &&
        newChannelDescription === localStorage.getItem('currentChannelDescription')) {
        updateInfoPopup("Nothing changed!!! Try again!!!")
    } else {
        const channelUpdateInfo = JSON.stringify({
            name: newChannelName,
            description: newChannelDescription,
        });
        const token = localStorage.getItem('token');
        const ChannelId = localStorage.getItem('currentChannelId');

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: channelUpdateInfo,
        }

        fetch(`http://localhost:5005/channel/${ChannelId}`, requestOptions).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    localStorage.setItem('currentChannelName', newChannelName);
                    localStorage.setItem('currentChannelDescription', newChannelDescription);
                    updateInfoPopup('Update channel Information successfully!!!');
                    // openChannels(token);
                    console.log('Update channel Information successfully!!!');
                });
            } else {
                alert('Failed to update channel Information...');
            };
        });
    }
});

// add new members to channel
document.getElementById('addMemberBtn').addEventListener('click', () => {
    for (let n = 0; n < nonMemberList.children.length; n++) {
        if (nonMemberList.children[n].firstChild.checked === true) {
            // console.log(nonMemberList.children[n].id);
            // console.log(typeof nonMemberList.children[n].id);
            // console.log(nonMemberList.children[n].id.match(/\d+/)[0]);

            const addedUserId = parseInt(nonMemberList.children[n].id.match(/\d+/)[0]);
            const addedUserInfo = JSON.stringify({
                userId: addedUserId,
            });
            const token = localStorage.getItem('token');
            const ChannelId = localStorage.getItem('currentChannelId');

            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: addedUserInfo,
            }

            fetch(`http://localhost:5005/channel/${ChannelId}/invite`, requestOptions).then((response) => {
                if (response.status === 200) {
                    response.json().then((data) => {
                        console.log('Invited one user successfully!!!');

                        const addUser = document.getElementById(`member${addedUserId}`);
                        const addUserCopy = addUser.cloneNode(true);
                        addUserCopy.removeChild(addUserCopy.firstChild);
                        const blankBox = document.createElement('span');
                        addUserCopy.insertBefore(blankBox, addUserCopy.firstChild);

                        nonMemberList.removeChild(document.getElementById(`member${addedUserId}`));
                        let positionIndex = 0;
                        for (let n = 0; n < memberList.children.length; n++) {
                            if (allUsersInfo[addedUserId]['name'].toLowerCase() > memberList.children[n].children[2].innerText.toLowerCase()) {
                                positionIndex += 1;
                            }
                        };
                        (positionIndex === memberList.children.length) ? memberList.append(addUserCopy): memberList.insertBefore(addUserCopy, memberList.children[positionIndex]);

                        refreshCurrentChannelMsg(localStorage.getItem('currentChannelId'), token, allUsersInfo);
                    });
                } else {
                    alert('Failed to invite users...');
                }
            })
        }
    }
    // console.log(nonMemberList.children);
});



// Join a channel
document.getElementById('confirmPopupBtn').addEventListener('click', () => {
    const channelWantToJoinId = localStorage.getItem('channelWantToJoinId');
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5005/channel/${channelWantToJoinId}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    }).then((response) => {
        if (response.status === 200) {
            response.json().then((data) => {
                openChannels(token);
            });
        } else {
            alert('joinChannel failed...');
        }
    })
})

const joinChannel = (id) => {
    const channelWantToJoin = document.getElementById(id);
    channelWantToJoin.addEventListener('mouseover', () => {
        channelWantToJoin.style.cursor = 'help';
        channelWantToJoin.style.backgroundColor = 'rgb(255, 0, 0, 0.3)'
        channelWantToJoin.style.boxShadow = 'rgb(255, 0, 0) 0.1em 0.1em 1em';

    });

    channelWantToJoin.addEventListener('mouseout', () => {
        channelWantToJoin.style.backgroundColor = '';
        channelWantToJoin.style.boxShadow = '';
    });

    channelWantToJoin.addEventListener('click', () => {
        document.getElementById('confirmPopupPrompt').innerText = `Do you want to join "${channelWantToJoin.children[1].innerText}"?`;
        displayContentById('confirmPopupMask');
        localStorage.setItem('channelWantToJoinId', id);
    });
};


// Leave a channel
document.getElementById('currentChannelInfoLeave').addEventListener('click', () => {
    const currentChannelId = localStorage.getItem('currentChannelId');
    const token = localStorage.getItem('token');
    console.log(currentChannelId);
    fetch(`http://localhost:5005/channel/${currentChannelId}/leave`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        }
    }).then((response) => {
        if (response.status === 200) {
            response.json().then((data) => {
                closePopupForm();
                cleanChatContentFrame();
                openChannels(token);
            });
        } else {
            alert("leaveChannel failed...");
        }
    })
})


// Get a list of all the channels
export const itemExistInArray = (target, array) => {
    let flag = false;
    array.forEach(item => { if (item.toString() === target.toString()) { flag = true; } });
    return flag;
}
const showAllChannels = (data) => {
    const joinedChannels = document.getElementById('joinedChannels');
    const unjoinChannels = document.getElementById('unjoinChannels');
    while (joinedChannels.hasChildNodes()) { joinedChannels.removeChild(joinedChannels.childNodes[0]) };
    while (unjoinChannels.hasChildNodes()) { unjoinChannels.removeChild(unjoinChannels.childNodes[0]) };

    const userId = localStorage.getItem('userId');
    console.log('SHOWlistUserId', userId);
    const joinChannelIDs = new Array();
    const unjoinChannelIDs = new Array();
    data['channels'].forEach((channel) => {
        const channelBar = document.createElement('li')
        const channelBox = document.createElement('span');
        channelBar.id = channel['id'];
        const image = document.createElement('img');
        channelBox.innerText = channel['name'];
        if (itemExistInArray(parseInt(userId), channel['members'])) {
            joinChannelIDs.push(channel['id']);
            (channel['private']) ? image.src = '../images/lock-fill.svg': image.src = '../images/chat-text.svg';
            channelBar.append(image);
            channelBar.append(channelBox)
            joinedChannels.append(channelBar);
        } else {
            if (!channel['private']) {
                unjoinChannelIDs.push(channel['id']);
                image.src = '../images/door-open.svg';
                channelBar.append(image);
                channelBar.append(channelBox);
                unjoinChannels.append(channelBar);
            };
        };
    });
    joinChannelIDs.map(linkChannel);
    unjoinChannelIDs.map(joinChannel);
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
            response.json().then((data) => {
                // console.log('openChannel succeeded!!!');
                // console.log(data);
                // console.log('OPENUserId', localStorage.getItem('userId'));
                cleanChatContentFrame();
                showAllChannels(data);
                getAllUsers(token);
            });
        } else {
            alert("openChannelList failed...");
        }
    })
}

// create a channel
let createFlag = true;
document.getElementById('tackleChannelBtn').addEventListener('click', () => { displayContentById('createChannelFormMask') });

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
    const token = localStorage.getItem('token');

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body: newChannelInfo,
    }

    fetch('http://localhost:5005/channel', requestOptions).then((response) => {
        if (response.status === 200) {
            document.getElementById('newChannelName').value = '';
            document.getElementById('newChannelDescription').value = '';
            document.getElementById('makePrivate').checked = false;
            closePopupForm();
            response.json().then((data) => {
                console.log(data);
                openChannels(token);
            });
        } else {
            alert("createChannels failed...");
        };
    });
});


// Update details of the specific channel