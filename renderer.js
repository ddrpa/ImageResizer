const dropZone = document.querySelector('.drop-zone');
const compressForDesktop = document.querySelector('input[name="desktop"]');
const compressForMobile = document.querySelector('input[name="mobile"]');
const compressForCustomizedDevice = document.querySelector(
    'input[name="customized"]'
);
const customizedWidthInPixel = document.querySelector(
    'input[name="customized_width"]'
);

window.ipc.listen('drop-files-and-folders', () => {
    dropZone.classList.contains('busy') && dropZone.classList.remove('busy');
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (
        (compressForMobile.checked ||
            compressForDesktop.checked ||
            (compressForCustomizedDevice.checked &&
                customizedWidthInPixel.value > 1)) &&
        files?.length > 0
    ) {
        let targetPlatform = [];
        if (compressForMobile.checked) {
            targetPlatform.push({ suffix: '_m', max_width: 320 });
        }
        if (compressForDesktop.checked) {
            targetPlatform.push({ suffix: '_d', max_width: 800 });
        }
        if (compressForCustomizedDevice.checked) {
            targetPlatform.push({
                suffix: '_c',
                max_width: customizedWidthInPixel.value,
            });
        }
        window.ipc.send('drop-files-and-folders', {
            targetPlatform,
            files: [...files].map((file) => ({
                name: file.name,
                path: file.path,
                // image/* for file, empty for folder
                type: file.type,
            })),
        });
        dropZone.classList.add('busy');
    }
});

dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
});
