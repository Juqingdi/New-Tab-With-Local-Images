let search_baidu = null,
	bdsug = null,
	bdsug_ul = null,
	baidu_input = null;
let focusedLiIndex = null;
let totalLi = 0;
let searchWord = '';
let enableBlur = true,
	inputFocused = false;

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded');
	loadTopSites();
	initSearchBox();
	setTimeout(() => {
		document.getElementById('logo-baidu').classList.add('dom-loaded');
	}, 0);
});

function loadTopSites() {
	chrome.topSites.get((topSites)=>{
		console.log(topSites);
		let mvTiles = document.getElementById('mv-tiles');
		let template = document.getElementById('productTopSite');
		let gridTileContainer = template.content.querySelector('.grid-tile-container');
		let mdTile = template.content.querySelector('.md-tile');
		let mdIcon = template.content.querySelector('.md-icon');
		let mdTitleSpan = template.content.querySelector('.md-title span');
		let mdEditMenu = template.content.querySelector('button.md-edit-menu');

		let topSite;
		for (let i = topSites.length - 1; i >= 0; i--) {
			topSite = topSites[i];
			gridTileContainer.rid = gridTileContainer.index = i;
			let x = 112 * (i % 5);
			let y = 128 * parseInt(i / 5);
			gridTileContainer.style.transform = `translate(${x}px, ${y}px)`;
			mdTile.href = topSite.url;
			mdTile.ariaLabel = mdTile.title = topSite.title;
			mdTile.dataRid = i + 1;
			mdTile.dataPos = i;
			mdIcon.src = `chrome://favicon/size/16@2x/${topSite.url}`;
			mdTitleSpan.innerText = topSite.title;
			mdEditMenu.ariaLabel = `修改快捷方式 ${topSite.title}`;
			let clone = document.importNode(template.content, true);
			mvTiles.appendChild(clone);
		}
		document.getElementById('mv-tiles').style.opacity = 1;
	});
}

function fadeInBackground() {
	let preloadBg = document.querySelector('link[rel="preload"]');
	const image = new Image();
	image.onload = () => {
		console.log('bg loaded');
		let customBg = document.getElementById('custom-bg');
		customBg.style.backgroundImage = `url(${preloadBg.href})`;
		customBg.style.opacity = 1;
		bgLoaded = true;
		document.getElementById('logo-baidu').classList.add('bg-loaded');
	};
	image.src = preloadBg.href;
}

function initSearchBox() {
	if(search_baidu === null){
		search_baidu = document.getElementById('search-baidu');
		bdsug = search_baidu.querySelector('.bdsug');
		bdsug_ul = bdsug.querySelector('ul');
		baidu_input = search_baidu.querySelector('input[name="wd"]');
	}
	baidu_input.oninput = e => {
		searchWord = e.target.value;
		if(searchWord.length > 0){
			let script = document.createElement('script');
			script.src = `https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=${searchWord}&cb=soso`;
			document.body.appendChild(script);
			script.remove();
		}
		showOrHideBdsug();
	}
	baidu_input.onblur = e => {
		if(enableBlur){
			inputFocused = false;
			showOrHideBdsug();
			focusedLiIndex = null;
			liFocusAt(focusedLiIndex);
		}
	}
	baidu_input.onfocus = e => {
		inputFocused = true;
		showOrHideBdsug();
	}
	baidu_input.onkeydown = e => {
		if(bdsug_ul.style.display === 'none' || totalLi === 0)
			return;

		switch(e.key) {
			case 'ArrowDown':
				focusedLiIndex = (focusedLiIndex === null) ? 0 : (focusedLiIndex + 1);
				if(focusedLiIndex === totalLi)
					focusedLiIndex = null;
				liFocusAt(focusedLiIndex);
				break;
			case 'ArrowUp':
				focusedLiIndex = (focusedLiIndex === null) ? (totalLi - 1) : (focusedLiIndex - 1);
				if(focusedLiIndex < 0)
					focusedLiIndex = null;
				liFocusAt(focusedLiIndex);
				break;
			case 'Escape':
				baidu_input.blur();
				break;
		}
	}
	search_baidu.onsubmit = (e) => {
		if(baidu_input.value.trim() === '')
			return false;
	}
	bdsug_ul.onmouseenter = () => {
		enableBlur = false;
	}
	bdsug_ul.onmouseleave = () => {
		enableBlur = true;
	}
}

function soso(data) {
	let keys = data.s;
	bdsug_ul.innerHTML = '';
	totalLi = 0;
	keys.forEach((key, index) => {
		let li = document.createElement('li');
		li.class = 'bdsug-overflow';

		let strArr = key.split(searchWord.trim());
		if(strArr.length > 1){
			for (let i = strArr.length - 1; i >= 0; i--) {
				if(strArr[i].length > 0){
					strArr[i] = strArr[i].bold();
				}
			}
			li.innerHTML = strArr.join(searchWord.trim());
		}
		else{
			li.innerText = key;
		}

		li.onclick = () => {
			baidu_input.value = key;
			search_baidu.submit();
		}
		li.onmouseenter = () => {
			focusedLiIndex = index;
			liFocusAt(focusedLiIndex);
		}
		li.onmouseleave = () => {
			focusedLiIndex = null;
			liFocusAt(focusedLiIndex);
		}
		bdsug_ul.appendChild(li);
		totalLi++;
	});
	focusedLiIndex = null;
	liFocusAt(focusedLiIndex);
	showOrHideBdsug();
}

function liFocusAt(index) {
	if(bdsug_ul.innerHTML === '')
		return;

	let focusedLi = bdsug_ul.querySelector('li.bdsug-s');
	if(focusedLi !== null)
		focusedLi.classList.remove('bdsug-s');

	if(index !== null){
		focusedLi = bdsug_ul.querySelectorAll('li')[index];
		focusedLi.classList.add('bdsug-s');
		baidu_input.value = focusedLi.innerText;
	}
	else{
		baidu_input.value = searchWord;
	}
}

function showOrHideBdsug() {
	if(inputFocused && baidu_input.value.trim() && bdsug_ul.innerHTML !== '')
		bdsug.style.display = '';
	else
		bdsug.style.display = 'none';1
}

fadeInBackground();