import "./style.css";
import * as THREE from 'three';
import { Scene, PerspectiveCamera, AmbientLight, BoxGeometry, MeshBasicMaterial, Mesh, Side, FrontSide, SphereGeometry, Vector3, Color, CylinderGeometry, OctahedronGeometry } from "three";
import { Pendulum } from "./Pendulum";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'dat.gui'
import renderer, { renderLoop } from "./renderer";
import { convertTypeAcquisitionFromJson } from "typescript";

const RESOLUTION = 16 / 9;
export var camtype = 2;
const scene = new Scene();
var pendulum
renderer.setClearColor(0x000000)
export var dynamiccamera


var gravity = 9.8
var max_angle = Math.PI/2


let loopHooks: Array<(dt: number) => void> = [];



(async () => {
    //Camera Setup
    //Fixed
    const camera = new PerspectiveCamera(50, RESOLUTION, 1, 10000);
    const Camcontrols = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 400, 1000);
    Camcontrols.update();
    //Dynamic
    dynamiccamera = new PerspectiveCamera(50, RESOLUTION, 1, 10000);
    const dynamicCamcontrols = new OrbitControls(dynamiccamera, renderer.domElement);
    dynamiccamera.position.set(0, 400, 1000);
    dynamicCamcontrols.update();


    //Lighting Setup
    //Ambient
    var amlight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(amlight)

    //Dynamic Spotlight
    var spotLightDynamic = new THREE.SpotLight( 0xffff00, 50, 1000, Math.PI / 4, 1 );
    spotLightDynamic.position.set( 0, 300, 300 );
    spotLightDynamic.castShadow = true;
    scene.add( spotLightDynamic );

    const dynamiclightMesh = new THREE.Mesh(
        new THREE.SphereGeometry(5, 16, 16), 
        new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    dynamiclightMesh.position.copy(spotLightDynamic.position);
    scene.add(dynamiclightMesh);


    //Fixed Spotlight
    var spotLightFixed = new THREE.SpotLight( 0xffffff, 100, 500, Math.PI / 4, 1 );
    spotLightFixed.position.set( 300,300, 0 );
    spotLightFixed.castShadow = true;
    scene.add( spotLightFixed );
    
    const fixedlightMesh = new THREE.Mesh(
        new THREE.SphereGeometry(5, 16, 16), 
        new THREE.MeshBasicMaterial({ color: 0xffffff }));
    fixedlightMesh.position.copy(spotLightFixed.position);
    scene.add(fixedlightMesh);

    //globals
    
    let sceneMade = false;    

    var box = new THREE.Mesh(
        new BoxGeometry(10,10,10),
        new THREE.MeshStandardMaterial( { color: 0xff0000 } )
    )

    box.position.y = 5

    box.castShadow = true;
    scene.add( box );


    //Setting up GUI
    const guicontrols = {
        fixedlight : {
            x: spotLightFixed.position.x,
            y: spotLightFixed.position.y,
            z: spotLightFixed.position.z,
            Intensity : spotLightFixed.intensity
        },
        dynamiclight : {
            x: spotLightDynamic.position.x,
            y: spotLightDynamic.position.y,
            z: spotLightDynamic.position.z,
            Intensity : spotLightDynamic.intensity
        },
        physics:{
            gravity: gravity,
            max_disp: max_angle
        }        

    };
    const gui = new GUI;
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '0px';
    gui.domElement.style.right = '0px';

    const folder1 = gui.addFolder('fixedlight');
    folder1.add(guicontrols.fixedlight, 'x', -500, 500).onChange(function(value) {spotLightFixed.position.x = value });
    folder1.add(guicontrols.fixedlight, 'y', -500, 500).onChange(function(value) {spotLightFixed.position.y = value });
    folder1.add(guicontrols.fixedlight, 'z', -500, 500).onChange(function(value) {spotLightFixed.position.z = value });
    folder1.add(guicontrols.fixedlight, 'Intensity', 0, 1000).onChange(function(value) {spotLightFixed.intensity = value });
    
    const folder2 = gui.addFolder('dynamiclight');
    folder2.add(guicontrols.dynamiclight, 'x', -500, 500).onChange(function(value) {spotLightDynamic.position.x = value });
    folder2.add(guicontrols.dynamiclight, 'y', -500, 500).onChange(function(value) {spotLightDynamic.position.y = value });
    folder2.add(guicontrols.dynamiclight, 'z', -500, 500).onChange(function(value) {spotLightDynamic.position.z = value });
    folder2.add(guicontrols.dynamiclight, 'Intensity', 0, 1000).onChange(function(value) {spotLightDynamic.intensity = value });
    
    const folder3 = gui.addFolder('Physics')
    folder3.add(guicontrols.physics,'gravity',0,30).onChange(function(value) {gravity = value});
    folder3.add(guicontrols.physics,'max_disp',0,Math.PI).onChange(function(value) {max_angle = value});

    // Controls
    document.addEventListener('keydown', function(event) {

        if(event.code == 'KeyC') {
            console.log("hel")
            if(camtype == 1){camtype = 2;}
            else{camtype = 1;}
        }
    

    });

    const PendulumInit = (scene,x,y,z)=>
    {
        let pend = new Pendulum(x,y,z);
        scene.add(pend.pendulum)
        return pend;
    }
    const initializeScene = (scene) => {
        sceneMade = true;


        // Ground
        const GROUND_SIZE = 2000;
        const groundGeometry = new THREE.PlaneGeometry( GROUND_SIZE, GROUND_SIZE );
        var groundMesh = new Mesh(groundGeometry, new MeshBasicMaterial({ color: 0x028683 }));
        groundMesh.receiveShadow = true;
        scene.add(groundMesh);
        groundMesh.rotation.x = -Math.PI/2;
    

        //creating Pendulum
        pendulum = PendulumInit(scene,50,250,25)
        spotLightDynamic.target = pendulum.sphere;
        console.log("saman: ",pendulum.boundingbox)
        let pendulum2 = PendulumInit(scene,-60,250,25)
        pendulum2.time =  Math.PI * Math.sqrt(pendulum2.plen/pendulum2.gravity)/2
        loopHooks.push(dt =>{
            pendulum.ApplyPhysics(gravity,max_angle)
            pendulum2.ApplyPhysics(gravity,max_angle)
           // first pendulum upar se niche
            if(!pendulum.boundingbox.intersectsSphere(pendulum2.normalbox))
            {
                let ScaledDt = dt*0.1
                pendulum.time += ScaledDt
                let period = 2* Math.PI * Math.sqrt(pendulum.plen/pendulum.gravity)
                let ang = pendulum.wo * Math.cos( 2* Math.PI / period * pendulum.time)

                // updating the coordinates of the center of the bounding box
                pendulum.bob_x = pendulum.origin[0] + (pendulum.plen+50)*Math.sin(ang)
                pendulum.bob_y = pendulum.origin[1] - (pendulum.plen+50)*Math.cos(ang)

                pendulum.boundingbox.set(new Vector3(pendulum.bob_x,pendulum.bob_y,pendulum.bob_z),50)

                pendulum.pendulum.rotateZ(ang - pendulum.theta);
                pendulum.theta = ang
            }
            // second pendulum niche se upar and then upar se niche
            if(pendulum.boundingbox.intersectsSphere(pendulum2.normalbox))
            {
                spotLightDynamic.target = pendulum2.sphere;
                pendulum.time = 3*Math.PI * Math.sqrt(pendulum2.plen/pendulum2.gravity)/2
                let ScaledDt = dt*0.2
                pendulum2.time += ScaledDt
                let period = 2* Math.PI * Math.sqrt(pendulum2.plen/pendulum2.gravity)
                let ang = pendulum2.wo * Math.cos( 2* Math.PI / period * pendulum2.time)

                // updating the coordinates of the center of the bounding box
                pendulum2.bob_x = pendulum2.origin[0] + (pendulum2.plen+50)*Math.sin(ang)
                pendulum2.bob_y = pendulum2.origin[1] - (pendulum2.plen+50)*Math.cos(ang)

                pendulum2.boundingbox.set(new Vector3(pendulum2.bob_x,pendulum2.bob_y,pendulum2.bob_z),50)

                pendulum2.pendulum.rotateZ(ang - pendulum2.theta);
                pendulum2.theta = ang
            }
            // first pendulum niche se upar and then upar se niche
            if(pendulum2.boundingbox.intersectsSphere(pendulum.normalbox))
            {   
                spotLightDynamic.target = pendulum.sphere;
                pendulum2.time =  Math.PI * Math.sqrt(pendulum2.plen/pendulum2.gravity)/2
                let ScaledDt = dt*0.1
                pendulum.time += ScaledDt
                let period = 2* Math.PI * Math.sqrt(pendulum.plen/pendulum.gravity)
                let ang = pendulum.wo * Math.cos( 2* Math.PI / period * pendulum.time)

                // updating the coordinates of the center of the bounding box
                pendulum.bob_x = pendulum.origin[0] + (pendulum.plen+50)*Math.sin(ang)
                pendulum.bob_y = pendulum.origin[1] - (pendulum.plen+50)*Math.cos(ang)
                // console.log("Center of Bounding box",pendulum.bob_x,pendulum.bob_y)
                pendulum.boundingbox.set(new Vector3(pendulum.bob_x,pendulum.bob_y,pendulum.bob_z),50)
                // console.log("Center of Bounding box",pendulum.boundingbox.center)
                pendulum.pendulum.rotateZ(ang - pendulum.theta);
                pendulum.theta = ang
            }
        })

    };

    if(camtype == 1){
        renderLoop(scene,dynamiccamera, (dt) => {

            dynamiclightMesh.position.copy(spotLightDynamic.position);
            fixedlightMesh.position.copy(spotLightFixed.position);
            if (sceneMade === false) {
                initializeScene(scene);
            }
            loopHooks.forEach(fn => fn(dt));
            
        });
    }
    else{
        renderLoop(scene,camera, (dt) => {

            dynamiclightMesh.position.copy(spotLightDynamic.position);
            fixedlightMesh.position.copy(spotLightFixed.position);
            if (sceneMade === false) {
                initializeScene(scene);
            }
            loopHooks.forEach(fn => fn(dt));
            
        });
    }
    

    

})();


