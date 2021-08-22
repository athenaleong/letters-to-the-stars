import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

export {initObjects, animate}

var base, particles;

function initObjects(scenebase) {
    base = scenebase;
    initStars();
}

function initStars() {
    const geometry = new THREE.BufferGeometry()
    const sprite = new THREE.TextureLoader().load('texture/spark.png')

    const createStars = (numOfStars) => {
        const vertices = []
        const colors = []
        const sizes = []

        for (let i =0; i < numOfStars; i++) {
            const x = Math.random() * 10 - 5
            const y = Math.random() * 4 - 2
            const z = Math.random() * 100 - 50
            // const color = new THREE.Color("rgb(191, 255, 0)").toArray()
            // console.log(color)
            vertices.push(x, y, z)
            colors.push(...[255, 255, 255])
        }

        const colorAttribute = new THREE.Float32BufferAttribute(colors, 3)

        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geometry.setAttribute('color', colorAttribute);

        const pointMaterial = new THREE.PointsMaterial( {size: 1, map: sprite, vertexColors:true, alphaTest: 0.5} );
        particles = new THREE.Points(geometry, pointMaterial);
        particles.layers.enable(1)
        base.scene.add(particles)
    }
    createStars(100);
}

function animate()
{
    const intersects = base.raycaster.intersectObjects(base.scene.children);
    if (intersects.length != 0) {
        var index = intersects[0].index;
        particles.geometry.attributes.color.setXYZ(index, 191, 255, 0)
        particles.geometry.attributes.color.needsUpdate = true;
    }
}