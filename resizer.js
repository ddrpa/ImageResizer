const fs = require('fs').promises;
const path = require('path');

const sharp = require('sharp');
const heicConvert = require('heic-convert');

const imageExtensions = require('./imageExtensions');

let processor_queue = [];

function _resizerGenerator(suffix, maxWidth) {
    const width = parseInt(maxWidth);
    if (!width) {
        return undefined;
    }
    return async function (buffer, dir, fileNameWithoutSuffix) {
        return await sharp(buffer)
            .resize({ width, withoutEnlargement: true })
            .toFile(path.resolve(dir, fileNameWithoutSuffix + suffix + '.webp'))
            .catch(console.error);
    };
}

async function _resize(buffer, dir, fileNameWithoutSuffix) {
    for (const processor of processor_queue) {
        await processor(buffer, dir, fileNameWithoutSuffix);
    }
}

async function _process(files) {
    for (const file of files) {
        const filePath = file.path;
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
            let { dir, ext, name } = path.parse(filePath);
            ext = ext.toLowerCase();
            if (imageExtensions.includes(ext)) {
                const inputBuffer = await fs.readFile(filePath);
                await _resize(inputBuffer, dir, name);
            } else if (ext === '.heic') {
                const inputBuffer = await fs.readFile(filePath);
                const outputBuffer = await heicConvert({
                    buffer: inputBuffer,
                    format: 'JPEG',
                    quality: 1,
                });
                await _resize(outputBuffer, dir, name);
            }
        } else if (stats.isDirectory()) {
            const children = await fs.readdir(filePath);
            await _process(
                children.map((child) => ({
                    path: path.resolve(filePath, child),
                }))
            );
        }
    }
}

exports.handle = async function handle(payload) {
    const { files, targetPlatform } = payload;
    processor_queue = targetPlatform
        .map(({ suffix, max_width }) => _resizerGenerator(suffix, max_width))
        .filter((i) => i !== undefined);
    await _process(files);
};
