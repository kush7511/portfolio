const loaderMessages = [
    "Syncing interface layers",
    "Rendering neon panels",
    "Compiling interaction matrix",
    "Routing to destination view",
    "Finalizing visual systems"
];

function initSharedLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    const bar = loader.querySelector('[data-loader-bar]');
    const percent = loader.querySelector('[data-loader-percent]');
    const status = loader.querySelector('[data-loader-status]');
    let progress = 0;
    let statusIndex = 0;

    const setProgress = (value) => {
        progress = Math.max(progress, Math.min(value, 100));
        if (bar) bar.style.width = `${progress}%`;
        if (percent) percent.textContent = `${Math.round(progress)}%`;
        if (status) {
            status.textContent = loaderMessages[Math.min(statusIndex, loaderMessages.length - 1)];
        }
    };

    setProgress(12);

    const progressTimer = window.setInterval(() => {
        if (progress >= 90) {
            window.clearInterval(progressTimer);
            return;
        }

        statusIndex = Math.min(statusIndex + 1, loaderMessages.length - 1);
        setProgress(progress + 17);
    }, 260);

    window.addEventListener('load', () => {
        window.clearInterval(progressTimer);
        statusIndex = loaderMessages.length - 1;
        setProgress(100);

        window.setTimeout(() => {
            loader.classList.add('hidden');
            document.body.classList.add('is-ready');
        }, 260);
    });

    document.querySelectorAll('a[data-page-link]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }

            const url = new URL(href, window.location.href);
            if (url.origin !== window.location.origin) {
                return;
            }

            event.preventDefault();
            loader.classList.remove('hidden');
            loader.classList.add('active');
            statusIndex = 3;
            setProgress(22);

            window.setTimeout(() => setProgress(68), 120);
            window.setTimeout(() => {
                setProgress(100);
                window.location.href = url.href;
            }, 360);
        });
    });
}

function initDownloadModal() {
    const modal = document.getElementById('download-modal');
    if (!modal) return;

    const title = modal.querySelector('[data-download-title]');
    const buttons = modal.querySelectorAll('[data-download-target]');
    const triggers = document.querySelectorAll('[data-download-trigger]');
    const closeButtons = modal.querySelectorAll('[data-modal-close]');

    let lastFocusedElement = null;

    const openModal = (trigger) => {
        lastFocusedElement = trigger;
        const projectName = trigger.dataset.projectName || 'Project App';
        if (title) {
            title.textContent = `Download ${projectName}`;
        }

        buttons.forEach((button) => {
            const platform = button.dataset.downloadTarget;
            const key = `${platform}Link`;
            const link = trigger.dataset[key] || '#';
            button.setAttribute('href', link);
        });

        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    };

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            openModal(trigger);
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

function initSharedBackground() {
    const canvas = document.getElementById('detail-canvas');
    if (!canvas || !window.THREE) return;

    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 26;

    const renderer = new window.THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const particleCount = 1800;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < positions.length; i += 1) {
        positions[i] = (Math.random() - 0.5) * 90;
    }

    const geometry = new window.THREE.BufferGeometry();
    geometry.setAttribute('position', new window.THREE.BufferAttribute(positions, 3));

    const cyanMaterial = new window.THREE.PointsMaterial({
        size: 0.12,
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.65,
        blending: window.THREE.AdditiveBlending
    });

    const purpleMaterial = new window.THREE.PointsMaterial({
        size: 0.16,
        color: 0xbc13fe,
        transparent: true,
        opacity: 0.42,
        blending: window.THREE.AdditiveBlending
    });

    const cyanField = new window.THREE.Points(geometry, cyanMaterial);
    const purpleField = new window.THREE.Points(geometry, purpleMaterial);
    scene.add(cyanField, purpleField);

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    const clock = new window.THREE.Clock();

    const animate = () => {
        window.requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        cyanField.rotation.y = elapsed * 0.04;
        cyanField.rotation.x = mouseY * 0.08;
        purpleField.rotation.y = -elapsed * 0.025;
        purpleField.rotation.z = mouseX * 0.045;

        camera.position.x += (mouseX * 3 - camera.position.x) * 0.04;
        camera.position.y += (mouseY * 1.8 - camera.position.y) * 0.04;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initSharedLoader();
    initDownloadModal();
    initSharedBackground();
});
