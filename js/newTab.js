document.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded');
	loadTopSites();
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

fadeInBackground();