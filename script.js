async function getPosts() {
    let url = 'https://www.delfi.lv/misc/task_2020/';
    try {
        let results = await fetch(url);
        return await results.json();

    } catch (error) {
        console.log(error);
    }
}

async function savePosts() {
    let posts = await getPosts();
    localStorage.setItem('getedPosts', JSON.stringify(posts));
}

function newPosts() {
    savePosts();
    let localPosts = getLocalPosts('localPosts');
    let newPosts = getLocalPosts('getedPosts');
    let latestPosts = [];
    if (localPosts === null) {
        localStorage.setItem('localPosts', JSON.stringify(newPosts));
    } else {
        newPosts.forEach(post => {
            if (!localPosts.find(localPost => localPost.id === post.id)) {
                localPosts.push(post);
                saveLocalPosts(localPosts, 'localPosts');
                latestPosts.push(post.id);
                localStorage.setItem('latestPosts', JSON.stringify(latestPosts));
            }
        });
    }
}

function getLocalPosts(param) {
    let localPosts = localStorage.getItem(param)
    localPosts = JSON.parse(localPosts);
    return localPosts;
}

function saveLocalPosts(param, name) {
    return localStorage.setItem(name, JSON.stringify(param));
}

function getHtml(post, page) {
    let savedPosts = getLocalPosts('savedPosts');
    let newPosts = getLocalPosts('latestPosts');
    let btnType = '';
    let isSaved = '';
    let btnTxt = 'Saglabāt';
    let newLabel = '';
    if (page === 'index') {
        if (newPosts !== null) {
            if (newPosts.find(np => np === post.id)) {
                newLabel = `<div class="position-absolute mb-2 ml-2 
                bg-science-blue text-white text-uppercase text-size-3 
                px-2 py-1 new__label headline__image_label-onlydelfi">Jaunums</div>`;
            }
        }
        if (savedPosts !== null) {
            if (savedPosts.find(savedPost => savedPost.id === post.id)) {
                isSaved = 'green-btn';
                btnTxt = 'Saglabāts';
            }
        }

        btnType = `<button class="position-absolute mb-2 ml-2 
        bg-science-blue text-white text-uppercase text-size-3 
        px-2 py-1 headline__image__label headline__image_label-onlydelfi ${isSaved}" 
        onclick="saveSinglePost(${post.id})";>${btnTxt}</button>
        `;
    } else if (page === 'saved') {
        btnType = `
                <div class="close-btn-container">
                    <button type="button" class="close close-btn" aria-label="Close" onclick="deleteSinglePost(${post.id})">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>`;
    } else {
        alert('Lapa netika atrasta');
    }
    let html = `
    <article class="col-sm-4 mb-md-4 mb-3">
            <figure class="mb-2 position-relative">
                <a href="${post.url}">
                ${newLabel}
                    <picture class="">
                        <source srcset="${post.pictures['456x260']}, ${post.pictures['768x438']} 2x" media="(min-width: 575px)">
                        <source srcset="l${post.pictures['372x212']}, ${post.pictures['456x260']} 2x" media="(min-width: 320px)">
                        <img id="img" src="${post.pictures['768x438']}" alt="${post.picture_alt}">
                    </picture>
                </a>
                ${btnType}
            </figure>
            <a href="${post.url}">
                <h2 class="text-size-22 mb-0 mt-2 headline__title">${post.title}</h2>
            </a>
       
    </article>`;
    return html;
}

function postsSort(b, a) {
    return new Date(a.publish_date).getTime() - new Date(b.publish_date).getTime();
}

function renderPosts(page, storage) {
    newPosts();
    let posts = getLocalPosts(storage);
    posts.sort(postsSort);
    let html = '';
    posts.forEach(post => {
        let htmlSegment = getHtml(post, page);
        html += htmlSegment;
    });

    let container = '';
    if (page === 'index') {
        container = document.querySelector('.home-posts');
    } else if (page === 'saved') {
        container = document.querySelector('.saved-posts');
    }
    container.innerHTML = html;
}

function saveSinglePost(id) {
    let posts = getLocalPosts('getedPosts');
    let savedPost = posts.find(post => post.id === id);
    if (getLocalPosts('savedPosts') === null) {
        posts = [];
    } else {
        posts = getLocalPosts('savedPosts');
    }
    if (posts.find(post => post.id === savedPost.id)) {
        alert('Raksts jau ir saglabāts');
    } else {
        posts.push(savedPost);
    }
    saveLocalPosts(posts, 'savedPosts');
    getPage();
}

function deleteSinglePost(id) {
    let answer = window.confirm("Vai tiešām vēlaties dzēst?");
    if (answer) {
        let posts = getLocalPosts('savedPosts');
        posts = posts.filter(post => post.id !== id);
        saveLocalPosts(posts, 'savedPosts');
        getPage();
    }
}

function getPage() {
    let url = window.location.pathname;
    let filename = url.substring(url.lastIndexOf('/') + 1);
    filename = filename.substring(0, filename.lastIndexOf('.'));
    let storage;
    if (filename === 'index') {
        storage = 'localPosts';
    } else if (filename === 'saved') {
        storage = 'savedPosts';
    } else {
        console.log('Lapa nav atrasta');
    }
    renderPosts(filename, storage);
}
getPage();

