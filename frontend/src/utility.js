const hideContentById = (id) => {
    document.getElementById(id).style.display = 'none';
}

const displayContentById = (id) => {
    document.getElementById(id).style.display = 'grid';
}


export { hideContentById, displayContentById };