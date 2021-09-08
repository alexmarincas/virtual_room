import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { BackSide } from 'three'
import { gsap } from 'gsap'

const addBtn = document.querySelector('.add-btn')
const editBtn = document.querySelector('#edit')
const loadingBarElement = document.querySelector('.loading-bar')
const scaling_holder = document.querySelector('.scaling-holder')
const scale_up = document.querySelector('.scale-up')
const scale_down = document.querySelector('.scale-down')
const crosshairElement = document.querySelector('.crosshair')

/**
 * Scene
 */
 const scene = new THREE.Scene()
 const root = new THREE.Object3D()
 
 /**
  * Raycaster
  */
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

}
window.addEventListener( 'mousemove', onMouseMove, false )
 
 /**
  * Cameras
  */
 // Base camera
 const camera = new THREE.PerspectiveCamera(60, 2, 1, 5000)
 camera.position.set(0, 0, .1)
   
 
  /**
  * Renderers
  */
 const css3DContainer = document.querySelector('#css3d')
 const css3DRenderer = new CSS3DRenderer()
 css3DContainer.appendChild(css3DRenderer.domElement)
   
 const webglCanvas = document.querySelector('#webgl')
 const webglRenderer = new THREE.WebGLRenderer({
 canvas: webglCanvas,
 antialias: true,
 alpha: true
 })
 webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
/**
 * Controls
 */
const controls = new OrbitControls(camera, css3DContainer)
controls.enableDamping = true
controls.rotateSpeed = 2
controls.enablePan = false
controls.enableZoom = false

  
// Block iframe events when dragging camera
controls.addEventListener( 'start', function () {
    css3DContainer.classList.add('inactive')
    // controls.enableRotate = false
})
controls.addEventListener( 'end', function () {
    css3DContainer.classList.remove('inactive')
})

// TRANSFORM CONTROLS
let control = new TransformControls( camera, css3DRenderer.domElement )
control.setMode( 'scale' )

/**
 * Textures
 */
const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () =>
{
    css3DContainer.style.opacity = 0
    css3DContainer.style.zIndex = -2
}
loadingManager.onLoad = () =>
{
    window.setTimeout(() =>
    {
        gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })
        gsap.to(css3DContainer, { duration: 3, opacity: 1, zIndex: 1, delay: 1 })

        loadingBarElement.classList.add('ended')
        crosshairElement.classList.add('visible')
        loadingBarElement.style.transform = ''
    }, 500)
}
loadingManager.onProgress = (itemUrl, itemsLoaded, itemsTotal) =>
{
    const progressRatio = itemsLoaded / itemsTotal
    loadingBarElement.style.transform = `scaleX(${progressRatio})`
}
loadingManager.onError = () =>
{
    console.log('loadingManager: loading error')
}

const textureLoader = new THREE.TextureLoader(loadingManager)

const colorTexture = textureLoader.load(
    '/textures/bg_huge.jpg',
    () =>
    {
        // console.log('textureLoader: loading finished')
    },
    () =>
    {
        // console.log('textureLoader: loading progressing')
    },
    () =>
    {
        // console.log('textureLoader: loading error')
    }
)
// colorTexture.wrapS = THREE.MirroredRepeatWrapping
// colorTexture.wrapT = THREE.MirroredRepeatWrapping
// colorTexture.repeat.x = 2
// colorTexture.repeat.y = 3
// colorTexture.offset.y = 0.5
// colorTexture.rotation = Math.PI * 0.25
// colorTexture.center.x = 0.5
// colorTexture.center.y = 0.5
// colorTexture.generateMipmaps = false
// colorTexture.minFilter = THREE.NearestFilter
// colorTexture.magFilter = THREE.NearestFilter

colorTexture.offset.x = 0.4
colorTexture.wrapS = THREE.RepeatWrapping
colorTexture.repeat.x = - 1

/**
 * Overlay
 */
 const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    fragmentShader: `
        uniform float uAlpha;
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})

const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Object
 */
const geometry = new THREE.SphereGeometry(1000, 64, 64)
const material = new THREE.MeshBasicMaterial({ map: colorTexture , side: BackSide })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Helper functions
 */
// Video element function
function VideoElement( videoID, x, y, z, rY, scale ) {
    
    const div = document.createElement( 'div' )
    div.setAttribute("class", "video_element")
    
    const iframe = document.createElement( 'iframe' )
    iframe.src = `https://www.youtube.com/embed/${videoID}?rel=0`
    div.appendChild( iframe )
    
    const object = new CSS3DObject( div )
    object.position.set( x, y, z )
    object.rotation.set(0,rY,0)
    
    const obj = new THREE.Object3D
    obj.add(object)
    
    obj.scale.x = scale
    obj.scale.y = scale

    return obj

}

// ADD chair
function ChairElement() {

    const div = document.createElement( 'div' )
    div.setAttribute("class", "chair-holder")
    
    const image = document.createElement( 'img' )
    image.src = `textures/emptySeat.png`
    div.appendChild( image )
    
    const object = new CSS3DObject( div )       
    object.position.copy(camera.position)
    object.rotation.copy(camera.rotation)
    object.updateMatrix()
    object.translateZ( - 300 )
    // object.position.copy(camera.position)

    const mesh = new THREE.Mesh(new THREE.CircleGeometry(25,36), new THREE.MeshBasicMaterial({
        opacity	: 0,
        transparent: true,
        color	: new THREE.Color( 0xffffff )
    }))
    mesh.position.copy(object.position)
    mesh.rotation.copy(object.rotation)  
    
    const obj = new THREE.Object3D
    mesh.parentID = obj.uuid  
    obj.add(object)
    obj.add(mesh)

    control.attach(obj)
    control.position.set( object.position )
    control.rotation.set( object.rotation )

    obj.seat_empty = true
    obj.iSitOnIt = false
    
    return obj
    
}


// ADD CHAIR
addBtn.addEventListener('click', function(){
    chairsGroup.add( ChairElement() )
})

// Window resize function
function onWindowResize() {
    const width = webglCanvas.clientWidth
    const height = webglCanvas.clientHeight
    
    if (webglCanvas.width !== width || webglCanvas.height !== height) {
        webglRenderer.setSize(width, height, false)
        css3DRenderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
    }
}

window.addEventListener('resize', onWindowResize, false)
onWindowResize()

/**
 * Adding 3D models and html elements to the scene
 */

const chairsGroup = new THREE.Group()
root.add(chairsGroup)

scene.add( control )

// Video element
const youtube_video = new VideoElement( 'Bf_YemfEaDs', -180, -17, -1000, -.55, .84) // Math.PI/2*1.7
root.add(youtube_video)
scene.add( root )

// DRAG OBJECTS
let allowEdit = true

editBtn.addEventListener("change", function(){
    if(!this.checked && elementSelected!==null && elementSelected[0].seat_empty){    
        elementSelected[0].children[0].element.children[0].src = 'textures/emptySeat.png' 
        scaling_holder.classList.remove('show')             
    }
    allowEdit = this.checked ? true : false    
    if(allowEdit){
        addBtn.classList.add('visible')
    }else{        
        addBtn.classList.remove('visible')
    }
})

const dragControls = new DragControls(chairsGroup.children, camera, css3DRenderer.domElement)

dragControls.addEventListener('dragstart', function (event) {
    if(allowEdit){
        controls.enabled = false
        event.object.material.opacity = 0.33
    }
})

dragControls.addEventListener('drag', function (event) {
    if(allowEdit){
        const currentObj = event.object
        currentObj.rotation.copy( camera.rotation )
        const parent = chairsGroup.children.filter(obj => obj.uuid === currentObj.parentID)
        const sibling = parent[0].children[0]
    
        sibling.position.copy( currentObj.position )
        sibling.rotation.copy( currentObj.rotation )
    }
})

dragControls.addEventListener('dragend', function (event) {
    if(allowEdit){
        controls.enabled = true
        event.object.material.opacity = 0
    }
})

/**
 * Click events
 */
let elementSelected = null
let lastSeatISitOn = ''
 css3DContainer.addEventListener("click", function(){

    raycaster.setFromCamera( mouse, camera )

    // Array.from(document.querySelectorAll(".chair-holder")).forEach(el => el.style.opacity = 1)

    if(elementSelected!==null && allowEdit){
        if(elementSelected[0].seat_empty){
            elementSelected[0].children[0].element.children[0].src = 'textures/emptySeat.png'
        }
    }

    scaling_holder.classList.remove('show')

	const intersects = raycaster.intersectObjects( scene.children, true )
    for(let x=0; x< intersects.length; x++){
        if(intersects[x].object.geometry.type!=='SphereGeometry' && intersects[x].object.geometry.type!=='BufferGeometry' && intersects[x].object.geometry.type!=='PlaneGeometry' ){
            const currentObj = intersects[x].object
            const parent = chairsGroup.children.filter(obj => obj.uuid === currentObj.parentID)
            const sibling = parent[0].children[0]
            elementSelected = parent

            if(allowEdit){
                // sintaxa buna pentru navigarea intre scene
                // controls.target.set(currentObj.position.x, currentObj.position.y, currentObj.position.z)
                
                if(elementSelected[0].seat_empty)
                    sibling.element.children[0].src = 'textures/emptySeatHighlighted.png'

                scaling_holder.classList.add('show')

            }else{

                scaling_holder.classList.remove('show')

                if(parent[0].seat_empty){
                    
                    if(!lastSeatISitOn){
                        sibling.element.children[0].src = 'textures/avatar.jpg'
                        parent[0].iSitOnIt = true
                        parent[0].seat_empty = false
                        lastSeatISitOn = sibling.uuid
                    }else{
                        if(lastSeatISitOn !== sibling.uuid ){

                            sibling.element.children[0].src = 'textures/avatar.jpg'
                            const lastEl = chairsGroup.children.filter(obj => obj.children[0].uuid === lastSeatISitOn)
                            lastEl[0].children[0].element.children[0].src = 'textures/emptySeat.png'
                            lastEl[0].iSitOnIt = false
                            lastEl[0].seat_empty = true
                            lastSeatISitOn = sibling.uuid
                        }else{
                            sibling.element.children[0].src = 'textures/avatar.jpg'
                        }
                        parent[0].iSitOnIt = true
                        parent[0].seat_empty = false
                    }
                }else{
                    if(parent[0].iSitOnIt){
                        sibling.element.children[0].src = 'textures/emptySeat.png'
                        parent[0].iSitOnIt = false
                        parent[0].seat_empty = true
                    }
                }
            }
        }
    }
 })

 /***
  * Scale elements
  */
scale_up.addEventListener("click", function(){
    const css_el = elementSelected[0].children[0]
    const webgl_el = elementSelected[0].children[1]

    let initialScale = webgl_el.scale
    let newXscale = initialScale.x + 0.1
    let newYscale = initialScale.y + 0.1
    css_el.scale.x = newXscale
    webgl_el.scale.x = newXscale
    css_el.scale.y = newYscale
    webgl_el.scale.y = newYscale
})
scale_down.addEventListener("click", function(){
    const css_el = elementSelected[0].children[0]
    const webgl_el = elementSelected[0].children[1]

    let initialScale = webgl_el.scale
    let newXscale = initialScale.x - 0.1
    let newYscale = initialScale.y - 0.1
    css_el.scale.x = newXscale
    webgl_el.scale.x = newXscale
    css_el.scale.y = newYscale
    webgl_el.scale.y = newYscale
})


/**
 * Animate
 */
function tick() {
    controls.update()
    

    css3DRenderer.render(scene, camera)
    webglRenderer.render(scene, camera)
    requestAnimationFrame(tick)
}

tick()