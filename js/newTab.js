let search_baidu = null,
	bdsug = null,
	bdsug_ul = null,
	baidu_input = null;

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded');
	loadTopSites();
	associate();
});

function loadTopSites() {
	chrome.topSites.get((topSites)=>{
		console.log(topSites);
		let mvTiles = document.getElementById('mv-tiles');
		let template = document.getElementById('productTopSite');
		let gridTileContainer = template.content.querySelectorAll('.grid-tile-container')[0];
		let mdTile = template.content.querySelectorAll('.md-tile')[0];
		let mdIcon = template.content.querySelectorAll('.md-icon')[0];
		let mdTitleSpan = template.content.querySelectorAll('.md-title span')[0];
		let mdEditMenu = template.content.querySelectorAll('button.md-edit-menu')[0];

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
	});
}

function fadeInBackground() {
	let preloadBg = document.querySelector('link[rel="preload"]');
	const image = new Image();
	image.onload = () => {
		console.log('preload loaded');
		var customBg = document.getElementById('custom-bg');
		customBg.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3)), url(${preloadBg.href})`;
		customBg.style.opacity = 1;
	};
	image.src = preloadBg.href;
}

function associate() {
	if(search_baidu === null){
		search_baidu = document.getElementById('search-baidu');
		bdsug = search_baidu.querySelector('.bdsug');
		bdsug_ul = bdsug.querySelector('ul');
		baidu_input = search_baidu.querySelector('input[name="wd"]');
	}
	baidu_input.oninput = e => {
		var value = e.target.value.trim();
		if(value.length > 0){
			var script = document.createElement('script');
			script.src = `https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=${value}&cb=soso`;
			document.body.appendChild(script);
			script.remove();
			bdsug.style.display = '';
		}
		else{
			bdsug.style.display = 'none';
		}
	}
	baidu_input.onblur = e => {
		bdsug.style.display = 'none';
	}
	baidu_input.onfocus = e => {
		if(baidu_input.value !== ''){
			bdsug.style.display = '';
		}
	}
}

function soso(data) {
	var keys = data.s;
	bdsug_ul.innerHTML = '';
	keys.forEach(key => {
		let li = document.createElement('li');
		li.class = 'bdsug-overflow';

		let strArr = key.split(baidu_input.value);
		if(strArr.length > 1){
			for (var i = strArr.length - 1; i >= 0; i--) {
				if(strArr[i].length > 0){
					strArr[i] = strArr[i].bold();
				}
			}
			li.innerHTML = strArr.join(baidu_input.value);
		}
		else{
			li.innerText = key;
		}

		li.onmousedown = () => {
			baidu_input.value = key;
			search_baidu.submit();
		}
		bdsug_ul.appendChild(li);
	});
}

fadeInBackground();