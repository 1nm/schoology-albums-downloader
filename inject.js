if (window.contentScriptInjected !== true) {
  window.contentScriptInjected = true; // global scope
  const thumbnails = document.getElementsByClassName('thumbnail-image');
  const titleNode = document.getElementsByClassName('page-title')[0];
  const title = titleNode?.innerHTML;

  const urls = [];
  for (const thumbnail of thumbnails) {
    const match = thumbnail.style.backgroundImage.match(
      /^.*(https.*album_thumbnail\/(media_albums\/.*\.jpg)).*$/
    );
    const thumbnailUrl = match[1];
    const largeUrl = thumbnailUrl.replace('album_thumbnail', 'album_large');
    const fullUrl = `${window.origin}/system/files/${match[2]}`;
    urls.push({ thumbnail: thumbnailUrl, large: largeUrl, full: fullUrl });
  }

  if (urls.length > 0) {
    const downloadButton = document.createElement('button');
    downloadButton.innerHTML = `Download ${urls.length} Photos`;
    downloadButton.type = 'button';
    downloadButton.className = 'link-btn';
    downloadButton.style = 'height: 30px';

    downloadButton.onclick = function () {
      console.log(`Zipping ${urls.length} images to '${title}.zip' ...`);
      progress.style.display = 'block';
      percentage.style.display = 'block';
      const zip = new JSZip();
      var downloadedCount = 0;
      urls.forEach(function (url, index) {
        const filename = `${index}.jpg`;
        zip.file(
          filename,
          new Promise(function (resolve, reject) {
            JSZipUtils.getBinaryContent(url['full'], function (err, data) {
              if (err) {
                reject(err);
              } else {
                resolve(data);
                downloadedCount += 1;
                const percent = parseInt((downloadedCount * 100) / urls.length);
                progress.value = percent;
                percentage.innerHTML = percent + '%';
              }
            });
          }),
          { binary: true }
        );
      });

      zip
        .generateAsync({ type: 'blob' }, function updateCallback(metadata) {
          if (downloadedCount === urls.length) {
            percentage.innerHTML = `Zipping... ${parseInt(metadata.percent)}%`;
          }
        })
        .then(function (content) {
          progress.style.display = 'none';
          progress.value = 0;
          percentage.innerHTML = '0%';
          percentage.style.display = 'none';
          console.log(`Downloading '${title}.zip' ...`);
          saveAs(content, `${title}.zip`);
        });
    };

    const downloadButtonContainer = document.createElement('div');
    downloadButtonContainer.style = 'padding-top: 12px;';

    const percentage = document.createElement('p');
    percentage.id = 'percentage';
    percentage.innerHTML = '0%';
    percentage.style = 'display: none;';

    const progress = document.createElement('progress');
    progress.id = 'download-progress';
    progress.max = 100;
    progress.value = 0;
    progress.style = 'display: none; margin-top: 10px; width: 240px;';

    downloadButtonContainer.appendChild(downloadButton);
    downloadButtonContainer.appendChild(progress);
    downloadButtonContainer.appendChild(percentage);

    titleNode.parentNode.insertBefore(
      downloadButtonContainer,
      titleNode.nextSibling
    );
  }
}
