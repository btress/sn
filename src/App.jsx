import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// IMPORT ẢNH TỪ ASSETS 👇
import img1 from './assets/1.jpg';
import img2 from './assets/2.jpg';
import img3 from './assets/3.jpg';
import img4 from './assets/4.jpg';
import img5 from './assets/5.jpg';

export default function BanhKem3D() {
  const mountRef = useRef(null);
  
  // DANH SÁCH ẢNH 👇
  const imageUrls = [
    img1, img2, img3, img4, img5,
    img1, img2, img3,
  ];

  useEffect(() => {
    // Scene setup với background gradient
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xfff0f5, 10, 30);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4, 10);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // Gradient background
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#ffd4e5');
    gradient.addColorStop(0.5, '#ffe4f0');
    gradient.addColorStop(1, '#fff5fb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 512);
    const bgTexture = new THREE.CanvasTexture(canvas);
    scene.background = bgTexture;

    // Lighting - nhiều ánh sáng hơn
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(8, 15, 8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.far = 50;
    scene.add(mainLight);

    // Thêm nhiều ánh sáng màu
    const colors = [0xff69b4, 0xffc0cb, 0xffb6c1, 0xff1493, 0xffd700, 0xff00ff];
    const lights = [];
    for (let i = 0; i < 6; i++) {
      const light = new THREE.PointLight(colors[i], 0.8, 20);
      const angle = (i / 6) * Math.PI * 2;
      light.position.set(
        Math.cos(angle) * 8,
        3 + Math.sin(i) * 2,
        Math.sin(angle) * 8
      );
      scene.add(light);
      lights.push(light);
    }

    // Particles - thêm hạt lấp lánh
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 30;
      posArray[i + 1] = Math.random() * 20;
      posArray[i + 2] = (Math.random() - 0.5) * 30;
      
      const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
      colorArray[i] = color.r;
      colorArray[i + 1] = color.g;
      colorArray[i + 2] = color.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Cake group
    const cakeGroup = new THREE.Group();
    
    // Tạo texture gradient cho bánh
    const createCakeTexture = (color1, color2) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      return new THREE.CanvasTexture(canvas);
    };

    // Bottom layer - lớn và lộng lẫy
    const bottomGeometry = new THREE.CylinderGeometry(2.5, 2.5, 1.2, 64);
    const bottomMaterial = new THREE.MeshStandardMaterial({ 
      map: createCakeTexture('#ffb6d9', '#ffd4e5'),
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0xffb6c1,
      emissiveIntensity: 0.2
    });
    const bottomLayer = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottomLayer.position.y = 0.6;
    bottomLayer.castShadow = true;
    bottomLayer.receiveShadow = true;
    cakeGroup.add(bottomLayer);

    // Ribbon cho tầng dưới
    const ribbonGeometry = new THREE.CylinderGeometry(2.52, 2.52, 0.15, 64);
    const ribbonMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0xffd700,
      emissiveIntensity: 0.3
    });
    const ribbon1 = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    ribbon1.position.y = 0.3;
    cakeGroup.add(ribbon1);

    // Middle layer
    const middleGeometry = new THREE.CylinderGeometry(1.8, 1.8, 1, 64);
    const middleLayer = new THREE.Mesh(middleGeometry, bottomMaterial);
    middleLayer.position.y = 1.7;
    middleLayer.castShadow = true;
    cakeGroup.add(middleLayer);

    const ribbon2 = new THREE.Mesh(new THREE.CylinderGeometry(1.82, 1.82, 0.12, 64), ribbonMaterial);
    ribbon2.position.y = 1.3;
    cakeGroup.add(ribbon2);

    // Top layer
    const topGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 64);
    const topLayer = new THREE.Mesh(topGeometry, bottomMaterial);
    topLayer.position.y = 2.6;
    topLayer.castShadow = true;
    cakeGroup.add(topLayer);

    // Frosting decorations - nhiều kem hơn
    const frostingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.4,
      emissive: 0xffffff,
      emissiveIntensity: 0.2
    });

    // Kem tầng dưới
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const creamGeometry = new THREE.SphereGeometry(0.18, 32, 32);
      const cream = new THREE.Mesh(creamGeometry, frostingMaterial);
      cream.position.set(
        Math.cos(angle) * 2.4,
        1.2,
        Math.sin(angle) * 2.4
      );
      cream.castShadow = true;
      cakeGroup.add(cream);
    }

    // Kem tầng giữa
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const creamGeometry = new THREE.SphereGeometry(0.15, 32, 32);
      const cream = new THREE.Mesh(creamGeometry, frostingMaterial);
      cream.position.set(
        Math.cos(angle) * 1.7,
        2.2,
        Math.sin(angle) * 1.7
      );
      cream.castShadow = true;
      cakeGroup.add(cream);
    }

    // Kem tầng trên
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const creamGeometry = new THREE.SphereGeometry(0.12, 32, 32);
      const cream = new THREE.Mesh(creamGeometry, frostingMaterial);
      cream.position.set(
        Math.cos(angle) * 1.1,
        3,
        Math.sin(angle) * 1.1
      );
      cream.castShadow = true;
      cakeGroup.add(cream);
    }

    // Cherry lớn và sáng hơn
    const cherryGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const cherryMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0040,
      roughness: 0.1,
      metalness: 0.5,
      emissive: 0xff0040,
      emissiveIntensity: 0.5
    });
    const cherry = new THREE.Mesh(cherryGeometry, cherryMaterial);
    cherry.position.y = 3.3;
    cherry.castShadow = true;
    cakeGroup.add(cherry);

    // Thân cherry
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 3.5;
    cakeGroup.add(stem);

    // Candles - nhiều nến hơn
    const candlePositions = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 0.8;
      
      const candleGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 16);
      const candleMaterial = new THREE.MeshStandardMaterial({ 
        color: i % 2 === 0 ? 0xffeb3b : 0xff69b4,
        roughness: 0.3,
        metalness: 0.2
      });
      const candle = new THREE.Mesh(candleGeometry, candleMaterial);
      candle.position.set(
        Math.cos(angle) * radius,
        3.2,
        Math.sin(angle) * radius
      );
      cakeGroup.add(candle);

      // Flame
      const flameGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const flameMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffa500,
        transparent: true,
        opacity: 0.9
      });
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      flame.position.set(
        Math.cos(angle) * radius,
        3.6,
        Math.sin(angle) * radius
      );
      flame.scale.y = 1.5;
      cakeGroup.add(flame);
      candlePositions.push(flame);

      // Flame glow
      const glowGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(flame.position);
      glow.scale.set(1.5, 1.5, 1.5);
      cakeGroup.add(glow);
      candlePositions.push(glow);
    }

    // Thêm ngôi sao trang trí
    const createStar = (x, y, z, size, color) => {
      const starShape = new THREE.Shape();
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const radius = i % 2 === 0 ? size : size * 0.4;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) starShape.moveTo(px, py);
        else starShape.lineTo(px, py);
      }
      starShape.closePath();
      
      const extrudeSettings = { depth: 0.05, bevelEnabled: false };
      const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
      const starMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        roughness: 0.1,
        metalness: 0.8,
        emissive: color,
        emissiveIntensity: 0.5
      });
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(x, y, z);
      return star;
    };

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const star = createStar(
        Math.cos(angle) * 2.2,
        0.2,
        Math.sin(angle) * 2.2,
        0.15,
        0xffd700
      );
      star.rotation.x = -Math.PI / 2;
      cakeGroup.add(star);
    }

    scene.add(cakeGroup);

    // Photo frames - sang trọng hơn
    const photoGroup = new THREE.Group();
    const numPhotos = 8;
    const photoRadius = 6;

    for (let i = 0; i < numPhotos; i++) {
      const angle = (i / numPhotos) * Math.PI * 2;
      
      // Khung sang trọng với viền vàng
      const frameGroup = new THREE.Group();
      
      // Khung ngoài màu vàng
      const outerFrameGeometry = new THREE.BoxGeometry(1.5, 2, 0.15);
      const outerFrameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0xffd700,
        emissiveIntensity: 0.2
      });
      const outerFrame = new THREE.Mesh(outerFrameGeometry, outerFrameMaterial);
      outerFrame.castShadow = true;
      frameGroup.add(outerFrame);

      // Khung trong màu trắng
      const innerFrameGeometry = new THREE.BoxGeometry(1.3, 1.8, 0.12);
      const innerFrameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.2
      });
      const innerFrame = new THREE.Mesh(innerFrameGeometry, innerFrameMaterial);
      innerFrame.position.z = 0.02;
      frameGroup.add(innerFrame);
      
      // Photo
      const photoGeometry = new THREE.PlaneGeometry(1.1, 1.6);
      const textureLoader = new THREE.TextureLoader();
      const photoTexture = textureLoader.load(
        imageUrls[i % imageUrls.length],
        () => renderer.render(scene, camera)
      );
      
      const photoMaterial = new THREE.MeshStandardMaterial({ 
        map: photoTexture,
        roughness: 0.4
      });
      const photo = new THREE.Mesh(photoGeometry, photoMaterial);
      photo.position.z = 0.08;
      frameGroup.add(photo);

      // Thêm viền sáng xung quanh ảnh
      const glowGeometry = new THREE.PlaneGeometry(1.4, 1.9);
      const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });
      const photoGlow = new THREE.Mesh(glowGeometry, glowMaterial);
      photoGlow.position.z = -0.01;
      frameGroup.add(photoGlow);

      frameGroup.position.set(
        Math.cos(angle) * photoRadius,
        2,
        Math.sin(angle) * photoRadius
      );
      frameGroup.lookAt(0, 2, 0);
      
      photoGroup.add(frameGroup);
    }
    
    scene.add(photoGroup);

    // Thêm sàn phản chiếu
    const floorGeometry = new THREE.CircleGeometry(15, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.3
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      time += 0.01;
      
      // Xoay bánh chậm
      cakeGroup.rotation.y = time * 0.3;
      
      // Xoay ảnh ngược chiều
      photoGroup.rotation.y = -time * 0.2;
      
      // Bay lên xuống nhẹ
      cakeGroup.position.y = Math.sin(time * 0.5) * 0.1;
      
      // Particles chuyển động
      particlesMesh.rotation.y = time * 0.1;
      const positions = particlesGeometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + i) * 0.002;
        if (positions[i] > 20) positions[i] = 0;
      }
      particlesGeometry.attributes.position.needsUpdate = true;
      
      // Animate candle flames
      candlePositions.forEach((flame, index) => {
        flame.scale.y = 1.5 + Math.sin(time * 3 + index) * 0.3;
        flame.scale.x = 1 + Math.sin(time * 4 + index) * 0.2;
        flame.scale.z = 1 + Math.cos(time * 4 + index) * 0.2;
      });

      // Di chuyển ánh sáng màu
      lights.forEach((light, i) => {
        const angle = time * 0.5 + (i / lights.length) * Math.PI * 2;
        light.position.x = Math.cos(angle) * 8;
        light.position.z = Math.sin(angle) * 8;
        light.position.y = 3 + Math.sin(time + i) * 2;
      });

      // Camera di chuyển nhẹ
      camera.position.x = Math.sin(time * 0.1) * 2;
      camera.position.z = 10 + Math.cos(time * 0.1) * 2;
      camera.lookAt(0, 1.5, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
  );
}