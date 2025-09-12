#!/usr/bin/env node

/**
 * Image Optimization Script for Scoop Unit Website
 * Optimizes images for web with modern formats and multiple sizes
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  inputDir: 'images',
  outputDir: 'images/optimized',
  quality: {
    webp: 80,
    avif: 70,
    jpeg: 85,
    png: 90
  },
  sizes: [400, 800, 1200, 1600], // Different sizes for responsive images
  formats: ['webp', 'avif'] // Modern formats to generate
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Get all image files
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const imageFiles = fs.readdirSync(config.inputDir)
  .filter(file => imageExtensions.includes(path.extname(file).toLowerCase()));

console.log(`🖼️  Found ${imageFiles.length} images to optimize...`);

async function optimizeImage(filename) {
  const inputPath = path.join(config.inputDir, filename);
  const name = path.parse(filename).name;
  const ext = path.parse(filename).ext.toLowerCase();
  
  console.log(`🔄 Processing: ${filename}`);
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Generate responsive sizes for each format
    for (const format of config.formats) {
      for (const size of config.sizes) {
        // Only create sizes smaller than original
        if (size <= metadata.width) {
          const outputFilename = `${name}-${size}w.${format}`;
          const outputPath = path.join(config.outputDir, outputFilename);
          
          await image
            .resize(size, null, { withoutEnlargement: true })
            .toFormat(format, { quality: config.quality[format] })
            .toFile(outputPath);
            
          console.log(`  ✅ Generated: ${outputFilename}`);
        }
      }
    }
    
    // Generate optimized original format
    const originalOutputPath = path.join(config.outputDir, `${name}-optimized${ext}`);
    if (ext === '.jpg' || ext === '.jpeg') {
      await image
        .jpeg({ quality: config.quality.jpeg, progressive: true })
        .toFile(originalOutputPath);
    } else if (ext === '.png') {
      await image
        .png({ quality: config.quality.png, progressive: true })
        .toFile(originalOutputPath);
    }
    
    console.log(`  ✅ Optimized original: ${name}-optimized${ext}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
}

async function generateImageManifest() {
  const manifest = {};
  
  for (const filename of imageFiles) {
    const name = path.parse(filename).name;
    const ext = path.parse(filename).ext.toLowerCase();
    
    manifest[name] = {
      original: `images/${filename}`,
      optimized: `images/optimized/${name}-optimized${ext}`,
      formats: {}
    };
    
    // Add different formats and sizes
    for (const format of config.formats) {
      manifest[name].formats[format] = {};
      for (const size of config.sizes) {
        const outputFilename = `${name}-${size}w.${format}`;
        const outputPath = path.join(config.outputDir, outputFilename);
        
        if (fs.existsSync(outputPath)) {
          manifest[name].formats[format][size] = `images/optimized/${outputFilename}`;
        }
      }
    }
  }
  
  // Write manifest file
  fs.writeFileSync('image-manifest.json', JSON.stringify(manifest, null, 2));
  console.log('📋 Generated image-manifest.json');
}

async function main() {
  console.log('🚀 Starting image optimization...');
  
  // Process all images
  for (const filename of imageFiles) {
    await optimizeImage(filename);
  }
  
  // Generate manifest
  await generateImageManifest();
  
  console.log('✨ Image optimization complete!');
  console.log(`📁 Optimized images saved to: ${config.outputDir}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { optimizeImage, generateImageManifest, config };