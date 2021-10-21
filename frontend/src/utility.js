const hideContentById = (id) => {
    document.getElementById(id).style.display = 'none';
}
const hideContentByClass = (className) => {
    const allItems = document.getElementsByClassName(className);
    for (let n = 0; n < allItems.length; n++) {
        allItems[n].style.display = 'none';
    }
}

const displayContentById = (id) => {
    document.getElementById(id).style.display = 'grid';
}


export { hideContentById, hideContentByClass, displayContentById };